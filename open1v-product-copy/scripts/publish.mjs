#!/usr/bin/env node

/**
 * 微信公众号发布脚本
 * 命令: token | upload-thumb | upload-image | convert | draft | publish
 */

import { readFileSync, writeFileSync, existsSync, statSync } from 'fs';
import { resolve, dirname, basename, extname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SKILL_DIR = resolve(__dirname, '..');
const TOKEN_CACHE_PATH = join(SKILL_DIR, '.token_cache.json');
const SKILL_CONFIG_PATH = join(SKILL_DIR, '.mp-config.json');

// ========== 配置读取 ==========

/**
 * 配置优先级（从高到低）：
 * 1. 环境变量 MP_APP_ID / MP_APP_SECRET
 * 2. 命令行参数 --app-id / --app-secret（通过 globalOptions 传入）
 * 3. 本 Skill 独立配置文件 .mp-config.json
 * 4. Obsidian mp-publisher 插件配置（如存在）
 */
function loadConfig(accountName) {
  // 来源 1：环境变量
  if (process.env.MP_APP_ID && process.env.MP_APP_SECRET) {
    console.log('✓ 使用环境变量配置');
    return { appId: process.env.MP_APP_ID, appSecret: process.env.MP_APP_SECRET };
  }

  // 来源 2：命令行参数（通过全局变量传入）
  if (globalThis.__mpCliOptions?.appId && globalThis.__mpCliOptions?.appSecret) {
    console.log('✓ 使用命令行参数配置');
    return { appId: globalThis.__mpCliOptions.appId, appSecret: globalThis.__mpCliOptions.appSecret };
  }

  // 来源 3：本 Skill 独立配置文件
  if (existsSync(SKILL_CONFIG_PATH)) {
    const skillConfig = JSON.parse(readFileSync(SKILL_CONFIG_PATH, 'utf-8'));
    if (skillConfig.appId && skillConfig.appSecret) {
      console.log(`✓ 使用本地配置: ${SKILL_CONFIG_PATH}`);
      return { appId: skillConfig.appId, appSecret: skillConfig.appSecret };
    }
  }

  // 来源 4：Obsidian mp-publisher 插件配置（兼容已有用户）
  const pluginConfigPath = '/Users/joeytoday/Documents/joey-notes/.obsidian/plugins/mp-publisher/data.json';
  if (existsSync(pluginConfigPath)) {
    const data = JSON.parse(readFileSync(pluginConfigPath, 'utf-8'));
    const accounts = data.wechatAccounts || [];
    let account;

    if (accountName) {
      account = accounts.find(a => a.name === accountName || a.id === accountName);
    } else if (data.activeWechatAccountId) {
      account = accounts.find(a => a.id === data.activeWechatAccountId);
    }

    const appId = account?.appId || data.wechatAppId;
    const appSecret = account?.appSecret || data.wechatAppSecret;

    if (appId && appSecret) {
      console.log(`✓ 使用 mp-publisher 插件配置 (${account?.name || '默认'})`);
      return { appId, appSecret };
    }
  }

  // 全部未找到 → 引导用户配置
  throw new Error(
    '未找到公众号配置。请通过以下任一方式提供 appId 和 appSecret：\n\n' +
    '方式 1（推荐）：运行初始化命令\n' +
    '  node scripts/publish.mjs init --app-id <你的appId> --app-secret <你的appSecret>\n\n' +
    '方式 2：设置环境变量\n' +
    '  export MP_APP_ID=你的appId\n' +
    '  export MP_APP_SECRET=你的appSecret\n\n' +
    '方式 3：命令行参数\n' +
    '  node scripts/publish.mjs publish <md> --app-id <appId> --app-secret <appSecret> --cover <img>'
  );
}

// ========== Access Token 管理 ==========

function getCachedToken() {
  if (!existsSync(TOKEN_CACHE_PATH)) return null;
  const cache = JSON.parse(readFileSync(TOKEN_CACHE_PATH, 'utf-8'));
  if (Date.now() < cache.expiresAt - 300000) {
    return cache.accessToken;
  }
  return null;
}

function saveTokenCache(accessToken, expiresIn) {
  const cache = {
    accessToken,
    expiresAt: Date.now() + expiresIn * 1000,
    updatedAt: new Date().toISOString()
  };
  writeFileSync(TOKEN_CACHE_PATH, JSON.stringify(cache, null, 2));
}

async function fetchAccessToken(accountName) {
  const cached = getCachedToken();
  if (cached) {
    console.log('✓ 使用缓存的 access_token');
    return cached;
  }

  const { appId, appSecret } = loadConfig(accountName);
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.errcode) {
    throw new Error(`获取 access_token 失败: [${data.errcode}] ${data.errmsg}`);
  }

  saveTokenCache(data.access_token, data.expires_in);
  console.log(`✓ 获取 access_token 成功，有效期 ${data.expires_in}s`);
  return data.access_token;
}

// ========== 素材上传 ==========

async function uploadThumb(imagePath, accessToken) {
  const absolutePath = resolve(imagePath);
  if (!existsSync(absolutePath)) {
    throw new Error(`封面图片不存在: ${absolutePath}`);
  }

  const stat = statSync(absolutePath);
  if (stat.size > 2 * 1024 * 1024) {
    throw new Error(`封面图片超过 2MB 限制: ${(stat.size / 1024 / 1024).toFixed(2)}MB`);
  }

  const fileBuffer = readFileSync(absolutePath);
  const fileName = basename(absolutePath);
  const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);

  const ext = extname(fileName).toLowerCase();
  const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';

  const header = `--${boundary}\r\nContent-Disposition: form-data; name="media"; filename="${fileName}"\r\nContent-Type: ${mimeType}\r\n\r\n`;
  const footer = `\r\n--${boundary}--\r\n`;

  const headerBuffer = Buffer.from(header, 'utf-8');
  const footerBuffer = Buffer.from(footer, 'utf-8');
  const body = Buffer.concat([headerBuffer, fileBuffer, footerBuffer]);

  const url = `https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=${accessToken}&type=thumb`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
    body
  });

  const result = await response.json();
  if (result.errcode) {
    throw new Error(`上传封面失败: [${result.errcode}] ${result.errmsg}`);
  }

  console.log(`✓ 封面上传成功 media_id: ${result.media_id}`);
  return result.media_id;
}

async function uploadImage(imagePath, accessToken) {
  const absolutePath = resolve(imagePath);
  if (!existsSync(absolutePath)) {
    throw new Error(`图片不存在: ${absolutePath}`);
  }

  const fileBuffer = readFileSync(absolutePath);
  const fileName = basename(absolutePath);
  const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);

  const ext = extname(fileName).toLowerCase();
  const mimeType = ext === '.png' ? 'image/png' : ext === '.gif' ? 'image/gif' : 'image/jpeg';

  const header = `--${boundary}\r\nContent-Disposition: form-data; name="media"; filename="${fileName}"\r\nContent-Type: ${mimeType}\r\n\r\n`;
  const footer = `\r\n--${boundary}--\r\n`;

  const headerBuffer = Buffer.from(header, 'utf-8');
  const footerBuffer = Buffer.from(footer, 'utf-8');
  const body = Buffer.concat([headerBuffer, fileBuffer, footerBuffer]);

  const url = `https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token=${accessToken}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
    body
  });

  const result = await response.json();
  if (result.errcode) {
    throw new Error(`上传图片失败: [${result.errcode}] ${result.errmsg}`);
  }

  console.log(`✓ 图片上传成功 url: ${result.url}`);
  return result.url;
}

// ========== Markdown → HTML 转换 ==========

async function convertMarkdown(mdPath, accessToken) {
  const absolutePath = resolve(mdPath);
  if (!existsSync(absolutePath)) {
    throw new Error(`Markdown 文件不存在: ${absolutePath}`);
  }

  const { marked } = await import('marked');
  const juice = (await import('juice')).default;

  let markdown = readFileSync(absolutePath, 'utf-8');

  // 去除 frontmatter
  if (markdown.startsWith('---')) {
    const endIndex = markdown.indexOf('---', 3);
    if (endIndex !== -1) {
      markdown = markdown.slice(endIndex + 3).trim();
    }
  }

  // 解析 Markdown → HTML
  const rawHtml = marked.parse(markdown);

  // 读取自定义 CSS
  // 优先使用本 Skill 内置的杂志风格 CSS，其次回退到 mp-publisher 插件的自定义 CSS
  const skillCssPath = join(SKILL_DIR, 'assets', 'product-post.css');
  const pluginCssPath = '/Users/joeytoday/Documents/joey-notes/.obsidian/plugins/mp-publisher/custom/post.css';
  const cssPath = existsSync(skillCssPath) ? skillCssPath : pluginCssPath;
  let css = '';
  if (existsSync(cssPath)) {
    css = readFileSync(cssPath, 'utf-8');
  } else {
    console.warn('⚠ 自定义样式文件不存在，使用无样式 HTML');
  }

  // 包裹 HTML 并内联 CSS
  const wrappedHtml = `<section class="mp-content-section">${rawHtml}</section>`;
  const fullHtml = `<style>${css}</style>${wrappedHtml}`;
  const inlinedHtml = juice(fullHtml);

  // 处理本地图片：上传到微信图床
  const mdDir = dirname(absolutePath);
  const imgRegex = /<img\s+[^>]*src="([^"]+)"[^>]*>/g;
  let finalHtml = inlinedHtml;
  const localImages = [];

  let match;
  while ((match = imgRegex.exec(inlinedHtml)) !== null) {
    const src = match[1];
    if (!src.startsWith('http://') && !src.startsWith('https://')) {
      localImages.push(src);
    }
  }

  for (const localSrc of localImages) {
    const imgAbsPath = resolve(mdDir, localSrc);
    if (existsSync(imgAbsPath)) {
      console.log(`  上传正文图片: ${localSrc}`);
      const wxUrl = await uploadImage(imgAbsPath, accessToken);
      finalHtml = finalHtml.replace(new RegExp(escapeRegex(localSrc), 'g'), wxUrl);
    } else {
      console.warn(`  ⚠ 图片不存在，跳过: ${imgAbsPath}`);
    }
  }

  // 保存转换结果
  const outputPath = join(SKILL_DIR, 'output.html');
  writeFileSync(outputPath, finalHtml);
  console.log(`✓ HTML 转换完成: ${outputPath}`);
  return { html: finalHtml, outputPath };
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ========== 草稿发布 ==========

async function createDraft(options, accessToken) {
  const { title, digest, thumbMediaId, content } = options;

  let htmlContent = content;
  if (existsSync(content)) {
    htmlContent = readFileSync(content, 'utf-8');
  }

  const article = {
    title,
    author: '',
    digest: digest || '',
    content: htmlContent,
    thumb_media_id: thumbMediaId,
    need_open_comment: 1,
    only_fans_can_comment: 0
  };

  const url = `https://api.weixin.qq.com/cgi-bin/draft/add?access_token=${accessToken}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ articles: [article] })
  });

  const result = await response.json();
  if (result.errcode) {
    throw new Error(`创建草稿失败: [${result.errcode}] ${result.errmsg}`);
  }

  console.log(`✓ 草稿创建成功！media_id: ${result.media_id}`);
  console.log('  请前往公众号后台查看草稿箱。');
  return result.media_id;
}

// ========== 一键发布 ==========

async function publishArticle(mdPath, options = {}) {
  const absolutePath = resolve(mdPath);
  if (!existsSync(absolutePath)) {
    throw new Error(`文件不存在: ${absolutePath}`);
  }

  // 读取 frontmatter 提取标题和摘要
  const rawContent = readFileSync(absolutePath, 'utf-8');
  let title = options.title || '';
  let digest = options.digest || '';

  if (rawContent.startsWith('---')) {
    const endIndex = rawContent.indexOf('---', 3);
    if (endIndex !== -1) {
      const frontmatter = rawContent.slice(3, endIndex);
      if (!title) {
        const titleMatch = frontmatter.match(/title:\s*(.+)/);
        if (titleMatch) title = titleMatch[1].trim().replace(/^["']|["']$/g, '');
      }
      if (!digest) {
        const descMatch = frontmatter.match(/description:\s*(.+)/);
        if (descMatch) digest = descMatch[1].trim().replace(/^["']|["']$/g, '');
      }
    }
  }

  // 如果还没有标题，取第一个 # 标题
  if (!title) {
    const h1Match = rawContent.match(/^#\s+(.+)$/m);
    if (h1Match) title = h1Match[1].trim();
  }

  if (!title) {
    title = basename(absolutePath, extname(absolutePath));
  }

  // 如果没摘要，取正文前 120 字
  if (!digest) {
    let text = rawContent;
    if (text.startsWith('---')) {
      const endIdx = text.indexOf('---', 3);
      if (endIdx !== -1) text = text.slice(endIdx + 3);
    }
    text = text.replace(/[#*`\[\]()>_~\-|]/g, '').trim();
    digest = text.slice(0, 120);
  }

  console.log(`\n📝 发布文章: ${title}`);
  console.log(`📋 摘要: ${digest.slice(0, 50)}...`);

  // Step 1: 获取 token
  console.log('\n[1/4] 获取 access_token...');
  const accessToken = await fetchAccessToken();

  // Step 2: 上传封面
  console.log('[2/4] 上传封面图片...');
  let thumbMediaId;
  if (options.cover && existsSync(resolve(options.cover))) {
    thumbMediaId = await uploadThumb(options.cover, accessToken);
  } else {
    throw new Error('请指定封面图片路径（--cover <path>）');
  }

  // Step 3: 转换 HTML
  console.log('[3/4] 转换 Markdown → HTML...');
  const { html } = await convertMarkdown(mdPath, accessToken);

  // Step 4: 创建草稿
  console.log('[4/4] 创建草稿...');
  const mediaId = await createDraft({
    title,
    digest,
    thumbMediaId,
    content: html
  }, accessToken);

  console.log(`\n🎉 发布完成！草稿 media_id: ${mediaId}`);
  return mediaId;
}

// ========== CLI 入口 ==========

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log(`
微信公众号发布工具

用法: node scripts/publish.mjs <command> [options]

命令:
  init                         初始化配置（首次使用必须）
    --app-id <appId>
    --app-secret <appSecret>
  token                      获取/刷新 access_token
  upload-thumb <path>        上传封面图片（永久素材）
  upload-image <path>        上传正文图片（微信图床）
  convert <md_path>          Markdown → 内联样式 HTML
  draft                      创建草稿
    --title <标题>
    --digest <摘要>
    --thumb <thumb_media_id>
    --content <html文件路径或HTML字符串>
  publish <md_path>          一键发布（全流程）
    --cover <封面图路径>
    --title <自定义标题>
    --digest <自定义摘要>
    --app-id <appId>         可选，覆盖已保存的配置
    --app-secret <appSecret> 可选，覆盖已保存的配置
`);
    return;
  }

  try {
    // 提取全局参数 --app-id / --app-secret（所有命令通用）
    const globalParsed = parseNamedArgs(args);
    if (globalParsed['app-id'] || globalParsed['app-secret']) {
      globalThis.__mpCliOptions = {
        appId: globalParsed['app-id'],
        appSecret: globalParsed['app-secret'],
      };
    }

    switch (command) {
      case 'init': {
        // 初始化配置：保存 appId/appSecret 到本 Skill 的独立配置文件
        const opts = parseNamedArgs(args.slice(1));
        if (!opts['app-id'] || !opts['app-secret']) {
          throw new Error('用法: node scripts/publish.mjs init --app-id <appId> --app-secret <appSecret>');
        }
        const config = { appId: opts['app-id'], appSecret: opts['app-secret'], createdAt: new Date().toISOString() };
        writeFileSync(SKILL_CONFIG_PATH, JSON.stringify(config, null, 2));
        console.log(`✓ 配置已保存到 ${SKILL_CONFIG_PATH}`);
        console.log(`  appId: ${opts['app-id']}`);
        console.log('\n提示: 请确保出口 IP 已加入公众号白名单（curl -s ifconfig.me 查看 IP）');
        break;
      }

      case 'token': {
        const token = await fetchAccessToken();
        console.log(`access_token: ${token}`);
        break;
      }

      case 'upload-thumb': {
        const imagePath = args[1];
        if (!imagePath) throw new Error('请指定图片路径');
        const token = await fetchAccessToken();
        await uploadThumb(imagePath, token);
        break;
      }

      case 'upload-image': {
        const imagePath = args[1];
        if (!imagePath) throw new Error('请指定图片路径');
        const token = await fetchAccessToken();
        await uploadImage(imagePath, token);
        break;
      }

      case 'convert': {
        const mdPath = args[1];
        if (!mdPath) throw new Error('请指定 Markdown 文件路径');
        const token = await fetchAccessToken();
        await convertMarkdown(mdPath, token);
        break;
      }

      case 'draft': {
        const token = await fetchAccessToken();
        const options = parseNamedArgs(args.slice(1));
        if (!options.title) throw new Error('缺少 --title');
        if (!options.thumb) throw new Error('缺少 --thumb');
        if (!options.content) throw new Error('缺少 --content');
        await createDraft({
          title: options.title,
          digest: options.digest || '',
          thumbMediaId: options.thumb,
          content: options.content
        }, token);
        break;
      }

      case 'publish': {
        const mdPath = args[1];
        if (!mdPath) throw new Error('请指定 Markdown 文件路径');
        const options = parseNamedArgs(args.slice(2));
        await publishArticle(mdPath, options);
        break;
      }

      default:
        console.error(`未知命令: ${command}`);
        process.exit(1);
    }
  } catch (error) {
    console.error(`\n✗ ${error.message}`);
    process.exit(1);
  }
}

function parseNamedArgs(args) {
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--') && i + 1 < args.length) {
      const key = args[i].slice(2);
      result[key] = args[i + 1];
      i++;
    }
  }
  return result;
}

main();
