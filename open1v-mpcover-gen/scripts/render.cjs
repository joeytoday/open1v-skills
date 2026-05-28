/**
 * render.cjs — 公众号封面 HTML → PNG 渲染脚本
 * 使用 Playwright 截图导出
 * 
 * 用法：node render.cjs <html文件路径> [输出目录]
 * 示例：node render.cjs ./task/index.html ./task/output/
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function render(htmlPath, outputDir) {
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
  console.log(`输出: ${outputDir}`);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(`file://${absoluteHtmlPath}`, { waitUntil: 'networkidle' });
  
  // 等待字体和图片加载
  await page.waitForTimeout(1000);

  // 查找所有 .cover 元素并逐个截图
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

    // 验证尺寸
    const box = await cover.boundingBox();
    console.log(`✓ ${elementId}.png (${Math.round(box.width)}×${Math.round(box.height)})`);
  }

  await browser.close();
  console.log(`\n完成，共导出 ${covers.length} 张封面到 ${outputDir}`);
}

// CLI 入口
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('用法: node render.cjs <html文件路径> [输出目录]');
  console.log('示例: node render.cjs ./task/index.html ./task/output/');
  process.exit(0);
}

render(args[0], args[1]).catch(err => {
  console.error('渲染失败:', err.message);
  process.exit(1);
});
