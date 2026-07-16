---
name: open1v-product-visual
description: 从拍照到成品的一站式电商商品图生成。支持拍照/发图 → 自动识别商品主体 → 生成标准商品图（白底/场景/促销/科技感）→ HTML叠加营销文字 → 导出最终PNG → 可选生成展示视频。可配合飞书频道使用（发照片 @机器人直接出图/视频）。当用户提到商品图、产品图、主图、白底图、促销图、商品视频、拍照生图、图生图、图生视频、产品展示视频、商品精修时使用此技能。
author: joeytoday
author_url: https://github.com/joeytoday
version: 1.0
published: true
---

# 商品图片 & 视频生成

从拍照到成品的一站式电商商品图流水线：**拍照 → 识别商品 → 生成标准图 → 叠加文字 → 导出成品**。

## 核心流程总览

```
用户拍照/发图
    ↓
❶ 识别商品主体（自动判断品类、外观、材质）
    ↓
❷ 创建项目文件夹（统一管理所有产出）
    ↓
❸ 生成标准商品图（白底/场景/促销，存入 product/）
    ↓
❹ 叠加营销文字（HTML模板渲染，存入 final/）
    ↓
❺ 生成展示视频（可选，存入 video/）
    ↓
❻ 交付确认 & 迭代
```

## 工作流程

### ❶ 接收素材 & 识别商品主体

**素材来源**（自动判断）：

| 来源 | 识别方式 |
|---|---|
| 飞书群/私聊发图 | 用户发照片并 @机器人，图片自动下载 |
| 本地文件路径 | 如 `./photos/product.jpg` |
| URL 链接 | 如 `https://example.com/photo.png` |
| 无照片 | 进入纯文生图模式（跳过识别步骤） |

**当用户提供了照片时，必须先识别商品主体**：

使用百炼视觉模型分析照片内容：

```bash
bl chat \
  --model qwen-vl-max \
  --image <照片路径> \
  --prompt "请分析这张照片中的商品主体，返回以下信息（JSON格式）：
{
  \"product_name_cn\": \"商品中文名\",
  \"product_name_en\": \"商品英文描述（用于生图prompt）\",
  \"category\": \"品类（3C数码/美妆护肤/食品饮料/服饰箱包/家居用品/其他）\",
  \"color\": \"主色调\",
  \"material\": \"材质\",
  \"features\": [\"可见的外观特征1\", \"特征2\"],
  \"brand\": \"品牌（如果可见）\"
}"
```

识别结果用于：
- 自动构造生图 prompt（不用用户手动描述产品外观）
- 匹配合适的场景和灯光模板
- 提炼营销文字时参考

> **如果识别失败或不准确**，向用户确认商品名称和品类后继续。

### ❷ 创建项目文件夹

每次任务创建独立的项目文件夹，所有产出有序存放：

```bash
mkdir -p ./product-<商品短名>-<MMDD>/{raw,product,final,video}
```

**命名规则**：
- `<商品短名>`：从识别结果提取，2-4 个英文单词，如 `charger`、`lipstick-set`、`earbuds-pro`
- `<MMDD>`：当天日期，如 `0610`
- 示例：`./product-charger-0610/`

**目录用途**：

```
product-charger-0610/
├── raw/          ← 用户原始照片（拍照原图，可能背景杂乱）
├── product/      ← 生成的标准商品图（无文字，纯视觉）
├── final/        ← 加文字后的最终商品图（可直接上架）
└── video/        ← 商品展示视频
```

**第一步操作**：将用户原始照片复制/移动到 `raw/` 目录：

```bash
cp <用户照片路径> ./product-<name>-<MMDD>/raw/original.jpg
```

### ❸ 生成标准商品图

根据识别结果自动构造 prompt，生成标准商品图，存入 `product/` 目录。

#### 图生图模式（有照片 → 推荐）

```bash
bl image edit \
  --image ./product-<name>-<MMDD>/raw/original.jpg \
  --prompt "<根据模板构造的英文 prompt>" \
  --size <宽>*<高> \
  --n 3 \
  --out-dir ./product-<name>-<MMDD>/product/
```

#### 文生图模式（无照片）

```bash
bl image generate \
  --prompt "<根据模板构造的英文 prompt>" \
  --size <宽>*<高> \
  --n 3 \
  --out-dir ./product-<name>-<MMDD>/product/
```

#### 支持的图片尺寸

| 类型 | 尺寸 | 适用场景 | render.cjs 参数 |
|---|---|---|---|
| 电商主图 | 1024×1024（1:1） | 淘宝/京东首图、促销图 | `--size=1x1` |
| 详情页图 | 1024×1366（3:4） | 详情页单屏展示 | `--size=3x4` |
| 启动页 | 1080×1920（9:16） | App 开屏广告 | `--size=9x16` |
| 横幅广告 | 1344×756（16:9） | PC 端 Banner | `--size=16x9` |

#### Prompt 模板库（根据 ❶ 识别结果自动匹配）

`[Product]` 用识别结果的 `product_name_en` 替换。生图 prompt 末尾**必须加**：`Absolutely no text, no writing, no letters, no numbers anywhere in the image.`

**白底商品主图**：
```
[Product] centered on pure white background, professional e-commerce product photography, soft diffused studio lighting, subtle ground shadow, clean and minimal composition, high-end commercial quality, 8k resolution. Absolutely no text.
```

**场景化商品图**：
```
[Product] in a [Scene], lifestyle product photography, [Lighting], shallow depth of field, bokeh background, natural and inviting atmosphere, commercial quality. Absolutely no text.
```

| 品类 | 场景建议 | 灯光建议 |
|---|---|---|
| 3C 数码 | modern minimalist desk, next to laptop | cool neutral studio lighting |
| 美妆护肤 | marble bathroom counter, with flowers | soft warm golden hour light |
| 食品饮料 | rustic wooden table, kitchen background | warm natural window light |
| 服饰箱包 | urban street, fashion editorial style | dramatic side lighting |
| 家居用品 | cozy living room, Scandinavian interior | soft ambient daylight |

**促销氛围图**：
```
[Product] with dynamic promotional atmosphere, [Color_Theme] gradient background, geometric shapes and light streaks, energetic composition, bold commercial design. Absolutely no text.
```

色彩主题：618 → `warm orange to red` / 双11 → `purple to magenta, golden accents` / 年货节 → `rich red, gold elements`

**科技感/高端感主图**：
```
[Product] floating in mid-air, dark gradient background, subtle [Color] glow and light reflections, futuristic tech aesthetic, premium feel, cinematic photography, 8k. Absolutely no text.
```

**为文字预留空间的构图策略**（当需要加文字时，在 prompt 中加入位置约束）：

| 文字量 | prompt 中加入 | 产品位置 |
|---|---|---|
| 少（1 个主标题） | "product positioned in the lower center, top area clean" | 居中偏下 |
| 中（主标题 + 卖点） | "product on the right 60%, left side clean solid/gradient background" | 右侧 |
| 多（标题 + 副标题 + 标签） | "product in the bottom half, top half clean" | 底部 |
| 环绕标注 | "product centered, generous margins on all sides" | 居中 |

### ❺ 叠加营销文字（HTML 合成模式）

当用户需要带文字的商品图时（卖点标注、价格、slogan），采用 HTML 叠加方式确保文字精确可控。

#### Step A：提炼营销文字

根据 ❶ 识别结果 + 用户补充的产品信息，自动提炼：

| 文字类型 | 规则 | 示例 |
|---|---|---|
| 主标题 | ≤8 字，核心卖点或 slogan | "'钛'薄 '钛'好用" / "一年只充 1 次电" |
| 副标题 | ≤15 字，补充说明 | "钛合金机身 · 极速双向快充" |
| 卖点标签 | 每个 ≤6 字，最多 4 个 | "可上飞机" "智能数显" "小巧便携" |
| 规格数据 | 突出数字 | "120W 超级快充" "10000mAh" |
| 认证标识 | 简短 | "3C认证" "Magsafe磁吸" |

**按品类自动匹配文字方向**：

| 品类 | 主标题方向 | 常用标签 |
|---|---|---|
| 充电宝 | 容量/快充/轻薄 | 可上飞机、快充协议、自带线、数显 |
| 手机壳 | 材质/防摔/手感 | 军工防摔、磁吸充电、轻薄贴合 |
| 耳机 | 降噪/音质/续航 | 主动降噪、无感佩戴、超长续航 |
| 护肤品 | 功效/成分 | 医研共创、敏肌可用、国妆特证 |
| 食品 | 口感/产地/工艺 | 0 添加、非遗工艺、顺丰包邮 |
| 家电 | 功能/节能/容量 | 一级能效、大容量、静音运行 |
| 服饰 | 面料/版型/场景 | 真丝面料、显瘦版型、通勤百搭 |

> 如果用户没有提供卖点信息，根据识别结果 + 品类常识自动生成合理的文字，然后向用户确认。

#### Step B：用 HTML 模板组装

本 Skill 目录下内置模板和渲染工具链：

1. 复制模板到项目文件夹：`cp assets/template.html ./product-<name>-<MMDD>/index.html`
2. 只保留需要的布局（删除其他 `<section>`）
3. 将 `[产品图路径]` 替换为 `product/` 目录中的商品图路径
4. 填入营销文字
5. 按需加主题 class

> HTML 文件保留在项目文件夹中，方便用户后续手动修改文字和样式。

**4 种布局**：

| 布局 | class | 适合 | 文字位 | 产品位 |
|---|---|---|---|---|
| A 左文右图 | `layout-left-text` | 多卖点 | 左侧 45% | 右侧 |
| B 上文下图 | `layout-top-text` | 大数字冲击 | 顶部 40% | 底部 |
| C 中心对称 | `layout-center` | 简洁 slogan | 居中上方 | 居中偏下 |
| D 环绕标注 | `layout-surround` | 多功能参数 | 四角 | 居中 |

**3 种主题**：默认白底 / `dark-theme`（深色科技）/ `promo-theme`（促销氛围）

**遮罩**：`overlay-left` / `overlay-top`（加 `dark` 变深色遮罩）

#### Step C：渲染导出

```bash
cd <skill目录>
node scripts/render.cjs ./product-<name>-<MMDD>/index.html ./product-<name>-<MMDD>/final/ --scale=2 --size=1x1
```

导出的 PNG 存入项目的 `final/` 目录。

### ❻ 生成商品视频（可选）

从 `product/` 或 `final/` 目录中选一张满意的图，生成展示视频存入 `video/`：

**图生视频**：
```bash
bl video generate \
  --image ./product-<name>-<MMDD>/product/001.png \
  --prompt "Slow cinematic reveal, camera orbiting around the product, studio lighting, white background, smooth motion" \
  --duration 5 \
  --download ./product-<name>-<MMDD>/video/showcase.mp4
```

**文生视频**：
```bash
bl video generate \
  --prompt "<产品展示场景描述>" \
  --ratio 16:9 \
  --duration 5 \
  --download ./product-<name>-<MMDD>/video/promo.mp4
```

### ❼ 交付确认 & 迭代

展示最终项目文件夹内容：

```
product-charger-0610/
├── raw/
│   └── original.jpg          ← 用户拍照原图
├── product/
│   ├── white-bg-001.png      ← 白底商品图
│   ├── white-bg-002.png
│   └── scene-001.png         ← 场景化商品图
├── index.html                ← HTML 源文件（保留，可手动修改文字和样式）
├── final/
│   ├── card-left-text.png    ← 带文字的最终图（左文右图布局）
│   └── card-top-text.png     ← 带文字的最终图（上文下图布局）
└── video/
    └── showcase.mp4          ← 5 秒展示视频
```

**快速迭代**：

| 问题 | 操作 | 耗时 |
|---|---|---|
| 改文字内容 | 编辑项目文件夹中的 index.html → 重新 render 到 final/ | 2s |
| 换布局/主题 | 从 template.html 复制另一个布局 → render | 5s |
| 产品图不满意 | 调 prompt 重新生图到 product/ → 替换路径 → render | 30s |
| 重新识别商品 | 用户发新照片 → 重走 ❶ | 10s |

## 飞书场景（推荐用法）

配合 Qwen Code 飞书频道使用时，全流程在手机上完成：

1. 手机拍一张产品照片 → 发到飞书群
2. @Qwen Code 说："帮我做商品图"
3. 机器人自动：下载图片 → 识别商品 → 生成标准图 → 叠加文字 → 返回成品
4. 不满意？继续 @机器人 说"换个布局"或"改文字"即可

整个过程**不用开电脑、不用打开终端**，手机拍照发群里就行。

### 图片上传到飞书云空间

每次生成图片后，**立即上传到飞书云空间并返回链接**，方便用户在飞书中预览。

**文档 ID 管理**：上传图片需要一个飞书文档 ID 作为 `parent_node`。首次使用时自动创建一个文档，将 `document_id` 保存到项目文件夹的 `.feishu_doc_id` 文件中，后续复用。

```bash
# 检查是否已有文档 ID
DOC_ID_FILE="./product-<name>-<MMDD>/.feishu_doc_id"
if [ -f "$DOC_ID_FILE" ]; then
  DOC_ID=$(cat "$DOC_ID_FILE")
else
  # 首次使用，创建文档
  DOC_ID=$(curl -s -X POST "https://open.feishu.cn/open-apis/docx/v1/documents" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"title":"商品图 - <商品名> - <MMDD>"}' | node -e "process.stdout.write(JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).data.document.document_id)")
  echo "$DOC_ID" > "$DOC_ID_FILE"
fi
```

**上传方法**（Node.js 原生 fetch + 手动拼 multipart）：

```javascript
const fs = require('fs');
const path = require('path');

const APP_ID = 'cli_aaad19b14c3adbc4';
const APP_SECRET = 'xcQqyte84Gj4QMszpQ5GPfFKPjGMvUFU';

// 获取 token
async function getToken() {
  const resp = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: APP_ID, app_secret: APP_SECRET }),
  });
  return (await resp.json()).tenant_access_token;
}

// 上传图片（docId 从 .feishu_doc_id 文件读取）
async function uploadImage(imagePath, docId, token) {
  const fileName = path.basename(imagePath);
  const fileBuffer = fs.readFileSync(imagePath);
  const fileSize = fs.statSync(imagePath).size;
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).slice(2);

  const parts = [];
  for (const [name, value] of [['file_name', fileName], ['parent_type', 'docx_image'], ['parent_node', docId], ['size', String(fileSize)]]) {
    parts.push(Buffer.from('--' + boundary + '\r\nContent-Disposition: form-data; name="' + name + '"\r\n\r\n' + value + '\r\n'));
  }
  parts.push(Buffer.from('--' + boundary + '\r\nContent-Disposition: form-data; name="file"; filename="' + fileName + '"\r\n\r\n'));
  parts.push(fileBuffer);
  parts.push(Buffer.from('\r\n--' + boundary + '--\r\n'));

  const resp = await fetch('https://open.feishu.cn/open-apis/drive/v1/medias/upload_all', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'multipart/form-data; boundary=' + boundary },
    body: Buffer.concat(parts),
  });
  return await resp.json();
}
```

**图片链接格式**：`https://feishu.cn/drive/file/{file_token}`

**上传时机**：
- ❸ 每次生成商品图后 → 上传 `product/` 目录中的图片，返回链接
- ❺ 叠加文字导出后 → 上传 `final/` 目录中的成品图，返回链接
- 用户迭代调整后 → 上传新图片，返回链接

**关键规则**：
- 每个项目首次上传时创建一个文档，`document_id` 存到项目文件夹的 `.feishu_doc_id`，后续复用
- 每张图上传后立即返回链接给用户，格式：`✓ <图片名> https://feishu.cn/drive/file/<file_token>`
- 使用 Node.js 原生 `fetch` + 手动拼 multipart boundary，不要用 `form-data` 库或 `curl -F`

## 注意事项

- 图片默认使用 `qwen-image-2.0`，高质量用 `--model qwen-image-2.0-pro`
- 单次最多生成 6 张（`--n 6`）
- **AI 生图绝对不写文字**：所有文字通过 HTML 叠加
- **白底图技巧**：prompt 中强调 "pure white background, no props, no text"
- **批量生成建议**：先白底 → 再场景 → 再促销，每次一种风格
- 视频为异步任务，默认等待完成后下载
- 视频时长 2-10 秒，默认 5 秒

## 环境准备（首次自动执行）

```bash
cd <skill目录>/open1v-product-visual && npm install
npx playwright install chromium
command -v bl >/dev/null 2>&1 || echo "请先安装百炼 CLI"
bl auth status 2>&1
```

## 目录结构

```
open1v-product-visual/
├── SKILL.md                    ← 本文件
├── package.json                ← Node 依赖（playwright）
├── assets/
│   └── template.html           ← HTML 模板（4 布局 × 3 主题）
├── scripts/
│   └── render.cjs              ← Playwright @2x 渲染脚本
└── output/                     ← 临时输出（项目文件夹在用户工作目录下）
```