#!/usr/bin/env node
/**
 * 飞书云空间图片上传脚本
 *
 * 环境变量：
 *   FEISHU_APP_ID      飞书应用 App ID
 *   FEISHU_APP_SECRET  飞书应用 App Secret
 *
 * 用法：
 *   node scripts/feishu-upload.mjs <图片路径> <文档ID>
 *
 * 输出：上传成功返回 file_token，失败返回错误信息并 exit 1
 */

import { readFileSync, statSync } from 'fs';
import { basename } from 'path';

const APP_ID = process.env.FEISHU_APP_ID;
const APP_SECRET = process.env.FEISHU_APP_SECRET;

if (!APP_ID || !APP_SECRET) {
  console.error('请设置环境变量 FEISHU_APP_ID 和 FEISHU_APP_SECRET');
  process.exit(1);
}

const [imagePath, docId] = process.argv.slice(2);
if (!imagePath || !docId) {
  console.error('用法: node feishu-upload.mjs <图片路径> <文档ID>');
  process.exit(1);
}

async function getToken() {
  const resp = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: APP_ID, app_secret: APP_SECRET }),
  });
  const data = await resp.json();
  if (data.code !== 0) throw new Error(`获取 token 失败: ${data.msg}`);
  return data.tenant_access_token;
}

async function uploadImage(token) {
  const fileName = basename(imagePath);
  const fileBuffer = readFileSync(imagePath);
  const fileSize = statSync(imagePath).size;
  const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);

  const parts = [];
  for (const [name, value] of [
    ['file_name', fileName],
    ['parent_type', 'docx_image'],
    ['parent_node', docId],
    ['size', String(fileSize)],
  ]) {
    parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`));
  }
  parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\n\r\n`));
  parts.push(fileBuffer);
  parts.push(Buffer.from(`\r\n--${boundary}--\r\n`));

  const resp = await fetch('https://open.feishu.cn/open-apis/drive/v1/medias/upload_all', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body: Buffer.concat(parts),
  });
  const data = await resp.json();
  if (data.code !== 0) throw new Error(`上传失败: ${data.msg}`);
  return data.data.file_token;
}

try {
  const token = await getToken();
  const fileToken = await uploadImage(token);
  console.log(`https://feishu.cn/drive/file/${fileToken}`);
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
