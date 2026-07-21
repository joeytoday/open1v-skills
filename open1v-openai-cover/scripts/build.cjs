#!/usr/bin/env node
/**
 * 构建封面 HTML：内嵌一张或多张底图（data URI），生成 output/<name>.html。
 * 多张底图时，页面自动出现「底图」切换器。
 *
 * 用法：
 *   node scripts/build.cjs [--name <文件名>] "<标题>" "<标签>=<图片路径>" ["<标签>=<图片路径>" ...]
 *
 * 示例（默认输出 index.html）：
 *   node scripts/build.cjs "文章标题" "晕染=output/image/a.png"
 *
 * 示例（指定输出文件名，自动补 .html）：
 *   node scripts/build.cjs --name "my-article" "文章标题" "晕染=output/image/a.png"
 *
 * 示例（多张，页面出现切换器）：
 *   node scripts/build.cjs --name "my-article" "文章标题" "实物=output/image/a.png" "波形=output/image/b.png"
 *
 * 说明：标签会显示在底图切换器上，建议用风格名（实物/晕染/光束弧影/波形）。
 *       图片不带 "标签=" 前缀时，用文件名作标签。
 */
const fs = require('fs');
const path = require('path');

const rawArgs = process.argv.slice(2);

// Parse --name option
let outName = 'index.html';
const nameIdx = rawArgs.indexOf('--name');
if (nameIdx > -1) {
  if (!rawArgs[nameIdx + 1]) {
    console.error('--name 需要一个参数');
    process.exit(1);
  }
  outName = rawArgs[nameIdx + 1];
  if (!outName.endsWith('.html')) outName += '.html';
  rawArgs.splice(nameIdx, 2);
}

const title = rawArgs[0];
const bgArgs = rawArgs.slice(1);

if (!title || bgArgs.length === 0) {
  console.error('用法: node scripts/build.cjs [--name <文件名>] "<标题>" "<标签>=<图片路径>" [...]');
  process.exit(1);
}

const root = path.resolve(__dirname, '..');
const templatePath = path.join(root, 'assets', 'template.html');
const outDir = path.resolve(root, 'output');
const outPath = path.join(outDir, outName);

const backgrounds = bgArgs.map(arg => {
  const eq = arg.indexOf('=');
  let label, imgPath;
  if (eq > -1) { label = arg.slice(0, eq).trim(); imgPath = arg.slice(eq + 1).trim(); }
  else { label = path.basename(arg, path.extname(arg)); imgPath = arg; }

  const abs = path.resolve(root, imgPath);
  if (!fs.existsSync(abs)) { console.error('图片不存在: ' + abs); process.exit(1); }
  const ext = path.extname(abs).slice(1).toLowerCase();
  const mime = ext === 'jpg' ? 'jpeg' : ext;
  const src = `data:image/${mime};base64,` + fs.readFileSync(abs).toString('base64');
  return { label, src };
});

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

let html = fs.readFileSync(templatePath, 'utf8');
html = html.replace(/\{\{TITLE\}\}/g, esc(title));
html = html.replace(/\{\{BACKGROUNDS_JSON\}\}/g, JSON.stringify(backgrounds));

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, html);
console.log('已生成: ' + outPath);
console.log('底图 ' + backgrounds.length + ' 张: ' + backgrounds.map(b => b.label).join(' / '));
console.log('HTML 体积 ' + (html.length / 1024).toFixed(0) + ' KB' +
  (backgrounds.length > 1 ? '（含底图切换器）' : ''));
