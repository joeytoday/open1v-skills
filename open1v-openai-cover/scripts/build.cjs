#!/usr/bin/env node
/**
 * 构建封面 HTML：内嵌一张或多张底图（data URI），生成 output/<name>.html。
 * 多张底图时，页面自动出现「底图」切换器。
 *
 * 用法：
 *   node scripts/build.cjs [--name <文件名>] [--dir <图片文件夹>] "<标题>" ["<标签>=<图片路径>" ...]
 *
 * 示例（@ 引用了文章，底图取 image 文件夹全部图片）：
 *   node scripts/build.cjs --name "my-post" --dir output/image "文章标题"
 *
 * 示例（第二篇文章，底图在 image-1）：
 *   node scripts/build.cjs --name "my-post2" --dir output/image-1 "文章标题"
 *
 * 示例（手动指定单张/多张，可与 --dir 混用）：
 *   node scripts/build.cjs --name "my-post" "文章标题" "晕染=output/image/a.png"
 *
 * 说明：--dir 会扫描文件夹内全部图片（png/jpg/jpeg/webp），按文件名排序，
 *       自动生成标签（识别四种风格前缀 → 实物/晕染/光束弧影/波形 + 序号）。
 *       手动指定的 "标签=路径" 会追加在文件夹图片之后。
 */
const fs = require('fs');
const path = require('path');

const rawArgs = process.argv.slice(2);

// 解析 --name / --dir
let outName = 'index.html';
let imagesDir = null;
for (const flag of ['--name', '--dir']) {
  const i = rawArgs.indexOf(flag);
  if (i > -1) {
    if (!rawArgs[i + 1]) { console.error(flag + ' 需要一个参数'); process.exit(1); }
    if (flag === '--name') {
      outName = rawArgs[i + 1];
      if (!outName.endsWith('.html')) outName += '.html';
    } else {
      imagesDir = rawArgs[i + 1];
    }
    rawArgs.splice(i, 2);
  }
}

const title = rawArgs[0];
const bgArgs = rawArgs.slice(1);

if (!title || (bgArgs.length === 0 && !imagesDir)) {
  console.error('用法: node scripts/build.cjs [--name <文件名>] [--dir <图片文件夹>] "<标题>" ["<标签>=<图片路径>" ...]');
  process.exit(1);
}

const root = path.resolve(__dirname, '..');
const templatePath = path.join(root, 'assets', 'template.html');
const outDir = path.resolve(root, 'output');
const outPath = path.join(outDir, outName);

// 风格前缀 → 中文名（对应 SKILL.md 四种提示词模板的开头）
const STYLE_PREFIXES = [
  [/^Extreme_macro/, '实物'],
  [/^Abstract_soft/, '晕染'],
  [/^Minimal_light/, '光束弧影'],
  [/^Soft_watercolor/, '波形'],
];

// 从 bl 生成的文件名推导可读标签：image_<风格词>_<时间戳>_<序号>.png → "晕染 001"
function labelForFile(filename) {
  const base = path.basename(filename, path.extname(filename));
  let s = base.replace(/^image_/, '');
  const m = s.match(/_(\d{3})$/);
  const variant = m ? m[1] : '';
  s = s.replace(/_\d+_\d{3}$/, '');
  let style = s.replace(/_/g, ' ');
  for (const [re, name] of STYLE_PREFIXES) {
    if (re.test(s)) { style = name; break; }
  }
  return variant ? style + ' ' + variant : style;
}

const IMG_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

function toBackground(label, imgPath) {
  const abs = path.resolve(root, imgPath);
  if (!fs.existsSync(abs)) { console.error('图片不存在: ' + abs); process.exit(1); }
  const ext = path.extname(abs).slice(1).toLowerCase();
  const mime = ext === 'jpg' ? 'jpeg' : ext;
  const src = `data:image/${mime};base64,` + fs.readFileSync(abs).toString('base64');
  return { label, src };
}

const backgrounds = [];

// 1. 文件夹里的全部图片
if (imagesDir) {
  const dirAbs = path.resolve(root, imagesDir);
  if (!fs.existsSync(dirAbs) || !fs.statSync(dirAbs).isDirectory()) {
    console.error('图片文件夹不存在: ' + dirAbs); process.exit(1);
  }
  const files = fs.readdirSync(dirAbs)
    .filter(f => IMG_EXTS.has(path.extname(f).toLowerCase()))
    .sort();
  if (files.length === 0) { console.error('文件夹内没有图片: ' + dirAbs); process.exit(1); }
  for (const f of files) backgrounds.push(toBackground(labelForFile(f), path.join(dirAbs, f)));
}

// 2. 手动指定的图片（追加在后）
for (const arg of bgArgs) {
  const eq = arg.indexOf('=');
  let label, imgPath;
  if (eq > -1) { label = arg.slice(0, eq).trim(); imgPath = arg.slice(eq + 1).trim(); }
  else { label = path.basename(arg, path.extname(arg)); imgPath = arg; }
  backgrounds.push(toBackground(label, imgPath));
}

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
