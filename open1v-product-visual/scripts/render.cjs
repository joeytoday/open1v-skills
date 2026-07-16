/**
 * render.cjs — 电商商品图 HTML → PNG 渲染脚本
 * Playwright 截图导出，支持多尺寸画布和 @2x 高清输出
 *
 * 用法：node render.cjs <html文件> [输出目录] [--scale=2] [--size=1x1]
 * 示例：
 *   node render.cjs ./index.html ./output/ --scale=2 --size=1x1
 *   node render.cjs ./index.html ./output/ --size=3x4
 *   node render.cjs ./index.html ./output/ --size=9x16
 *   node render.cjs ./index.html ./output/ --size=16x9
 *
 * 支持的尺寸：
 *   1x1   → 512×512   (导出 1024×1024)  电商主图
 *   3x4   → 512×683   (导出 1024×1366)  详情页图
 *   9x16  → 540×960   (导出 1080×1920)  启动页/竖版
 *   16x9  → 672×378   (导出 1344×756)   横幅广告
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SIZE_MAP = {
  '1x1':  { width: 512, height: 512 },
  '3x4':  { width: 512, height: 683 },
  '9x16': { width: 540, height: 960 },
  '16x9': { width: 672, height: 378 },
};

async function render(htmlPath, outputDir, scale, size) {
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

  const canvas = SIZE_MAP[size] || SIZE_MAP['1x1'];
  console.log(`渲染: ${absoluteHtmlPath}`);
  console.log(`画布: ${canvas.width}×${canvas.height} (${size})`);
  console.log(`输出: ${outputDir} (scale=${scale}x → ${canvas.width * scale}×${canvas.height * scale}px)`);

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: canvas.width, height: canvas.height },
    deviceScaleFactor: scale,
  });

  await page.goto(`file://${absoluteHtmlPath}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  const cards = await page.$$('.product-card');

  if (cards.length === 0) {
    console.log('未找到 .product-card 元素，尝试全页截图...');
    const outputPath = path.join(outputDir, 'product-output.png');
    await page.screenshot({ path: outputPath, type: 'png' });
    console.log(`✓ product-output.png (${canvas.width * scale}×${canvas.height * scale}px)`);
  } else {
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const elementId = await card.getAttribute('id') || `card-${i + 1}`;
      const outputPath = path.join(outputDir, `${elementId}.png`);

      await card.screenshot({ path: outputPath, type: 'png' });

      const box = await card.boundingBox();
      const actualWidth = Math.round(box.width * scale);
      const actualHeight = Math.round(box.height * scale);
      console.log(`✓ ${elementId}.png (${actualWidth}×${actualHeight}px)`);
    }
  }

  await browser.close();
  console.log(`\n完成，导出到 ${outputDir}`);
}

// CLI 入口
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('用法: node render.cjs <html文件路径> [输出目录] [--scale=2] [--size=1x1]');
  console.log('');
  console.log('支持的尺寸:');
  Object.entries(SIZE_MAP).forEach(([key, val]) => {
    console.log(`  --size=${key}  → ${val.width}×${val.height} (@2x: ${val.width * 2}×${val.height * 2})`);
  });
  process.exit(0);
}

const scaleArg = args.find(a => a.startsWith('--scale='));
const sizeArg = args.find(a => a.startsWith('--size='));
const scale = scaleArg ? parseInt(scaleArg.split('=')[1], 10) || 2 : 2;
const size = sizeArg ? sizeArg.split('=')[1] : '1x1';
const nonFlagArgs = args.filter(a => !a.startsWith('--'));

render(nonFlagArgs[0], nonFlagArgs[1], scale, size).catch(err => {
  console.error('渲染失败:', err.message);
  process.exit(1);
});
