/**
 * render.cjs — 公众号封面 HTML → PNG 渲染脚本
 * Playwright 截图导出，支持 @2x 高清输出
 *
 * 用法：node render.cjs <html文件> [输出目录] [--scale=2]
 * 示例：node render.cjs ./task/index.html ./task/output/ --scale=2
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const COVER_WIDTH = 1344;
const COVER_HEIGHT = 572;

async function render(htmlPath, outputDir, scale) {
  const absoluteHtmlPath = path.resolve(htmlPath);

  if (!fs.existsSync(absoluteHtmlPath)) {
    console.error(`文件不存在: ${absoluteHtmlPath}`);
    process.exit(1);
  }

  if (!outputDir) {
    outputDir = path.join(path.dirname(absoluteHtmlPath), 'output');
  }
  outputDir = path.resolve(outputDir);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`渲染: ${absoluteHtmlPath}`);
  console.log(`输出: ${outputDir} (scale=${scale}x)`);

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: COVER_WIDTH, height: COVER_HEIGHT },
    deviceScaleFactor: scale,
  });

  await page.goto(`file://${absoluteHtmlPath}`, { waitUntil: 'domcontentloaded' });
  // 等待图片加载（如有）+ 字体渲染
  await page.waitForTimeout(1200);

  const covers = await page.$$('.cover');

  if (covers.length === 0) {
    console.error('未找到 .cover 元素');
    await browser.close();
    process.exit(1);
  }

  for (const cover of covers) {
    const elementId = await cover.getAttribute('id');
    if (!elementId) continue;

    const outputPath = path.join(outputDir, `${elementId}.png`);

    await cover.screenshot({
      path: outputPath,
      type: 'png',
    });

    const box = await cover.boundingBox();
    const actualWidth = Math.round(box.width * scale);
    const actualHeight = Math.round(box.height * scale);
    console.log(`✓ ${elementId}.png (${actualWidth}×${actualHeight}px)`);
  }

  await browser.close();
  console.log(`\n完成，共导出 ${covers.length} 张封面到 ${outputDir}`);
}

// CLI 入口
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('用法: node render.cjs <html文件路径> [输出目录] [--scale=2]');
  console.log('示例: node render.cjs ./task/index.html ./task/output/ --scale=2');
  console.log(`\n画布: ${COVER_WIDTH}×${COVER_HEIGHT} (2.35:1)`);
  process.exit(0);
}

const scaleArg = args.find(a => a.startsWith('--scale='));
const scale = scaleArg ? parseInt(scaleArg.split('=')[1], 10) || 2 : 2;
const nonFlagArgs = args.filter(a => !a.startsWith('--'));

render(nonFlagArgs[0], nonFlagArgs[1], scale).catch(err => {
  console.error('渲染失败:', err.message);
  process.exit(1);
});
