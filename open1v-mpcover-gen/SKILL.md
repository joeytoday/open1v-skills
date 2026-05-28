---
name: open1v-mpcover-gen
description: 生成特定风格的公众号封面图。支持4种风格：大字报、杂志、Claude极简、像素。通过百炼CLI调用AI生图。触发词：公众号封面、封面生成、cover、生成封面、做个封面。
author: joeytoday
author_url: https://github.com/joeytoday
version: 5.5
created: 2026-05-28 10:39
updated: 2026-05-28 16:41
published: true
---

# 公众号封面生成

生成公众号文章封面图。四种视觉风格，百炼 CLI 出图，一条命令交付。

## 环境准备（首次自动执行）

首次使用时，按以下流程自动检测并配置环境。依赖安装和认证通过后后续使用不再重复。

### 自动检测流程

**第零步：安装 Node 依赖**

```bash
cd <skill目录>/open1v-mpcover-gen && npm install
```

- `package.json` 已声明 `playwright` 依赖，用于 HTML → PNG 渲染
- 如果 `node_modules` 已存在则跳过
- 安装后自动执行 `npx playwright install chromium`（Playwright 需要浏览器内核）

**第一步：检测百炼 CLI 是否安装**

```bash
command -v bl >/dev/null 2>&1
```

- 如果命令存在 → 跳到第二步
- 如果命令不存在 → 自动安装：
  ```bash
  npm install -g @anthropic/bailian-cli
  ```
  安装失败则提示用户参考 https://bailian.console.aliyun.com/cli 手动安装。

**第二步：检测是否已认证**

```bash
bl auth status 2>&1
```

- 如果输出包含 "authenticated" 或显示用户信息 → 环境就绪，直接进入工作流
- 如果未认证 → 进入第三步

**第三步：向用户索要 API Key 并自动配置**

向用户询问百炼 API Key：

```
请提供你的百炼 API Key，我来帮你自动配置。

获取方式：打开 https://bailian.console.aliyun.com/cn-beijing?tab=model#/api-key ，创建或复制一个 API Key。

⚠️ 建议同时前往模型用量页（https://bailian.console.aliyun.com/cn-beijing?tab=model#/model-usage）开启「免费额度用完即停」，避免欠费。
```

用户提供 Key 后，自动执行登录：

```bash
bl auth login --api-key <用户提供的KEY>
```

登录成功后验证：

```bash
bl auth status 2>&1
```

确认认证成功后告知用户"环境配置完成"，进入工作流。

---

## 画布规格

| 用途 | 比例 | CSS 画布 | 导出 @2x | CLI 生图参数 |
|------|------|----------|----------|--------------|
| 首图封面 | 2.35:1 | 1344×572 | 2688×1144 | `'1344*572'` |
| 次图/分享卡 | 1:1 | 512×512 | 1024×1024 | `'1024*1024'` |

HTML 模板按 1344×572 布局，Playwright 以 `deviceScaleFactor=2` 截图输出 @2x 高清 PNG。

---

## 工作流

流程核心：**先生图 → 再用 HTML 叠字 → Playwright 导出 PNG**。
图片决定遮罩强度和文字配色，所以必须先拿到图。

### Step 1：理解内容

从用户给的文章标题、摘要或全文中提取：

- **核心论点**：一句话说清这篇文章在讲什么
- **情绪调性**：严肃/批判/温暖/技术/轻松/荒诞
- **视觉锚点**：内容中适合做背景画面的意象（物件、场景、隐喻）

### Step 2：风格选择

用户已指定则跳过。未指定时询问：

```
问题: "选一个封面风格"
选项:
- 01 大字报 — 电影海报感，暗底+大白字，严肃/深度
- 02 杂志风 — 独立杂志美学，浅底+精致排版，文化/观点
- 03 极简抽象 — 纯色底+手绘图标，认知负荷最低，技术/产品
- 04 像素风 — 16-bit游戏画面，打破常规，轻松/趣味
- 你来判断
```

自动路由表：

| 调性 | 风格 |
|------|------|
| 严肃、批判、历史、深度 | 01 大字报 |
| 文化、观点、人物、叙事 | 02 杂志 |
| 技术、产品、工具、概念 | 03 极简抽象 |
| 轻松、趣味、年轻、游戏 | 04 像素 |

### Step 3：标题提炼

封面标题是钩子，不是摘要。规则：

| 风格 | 主标题 | 副标题 | 特殊 |
|------|--------|--------|------|
| 01 大字报 | ≤10字，观点或悬念 | ≤15字 | 1个关键词用 `<span class="hl">` 红色高亮 |
| 02 杂志 | ≤10字 | ≤15字 | 底部加 `meta`（如 VOL.07 · DESIGN）|
| 03 极简 | ≤8字 | ≤12字 | 无装饰 |
| 04 像素 | ≤6字，动词优先 | ≤10字 | 短促有力，游戏感 |

### Step 4：构建提示词 & 生图

**两个硬约束**（所有风格的提示词必须遵守）：

1. **构图偏右**：画面视觉主体/焦点必须在**右侧 55-70%** 区域。01/04 风格需要左侧留暗/留简给遮罩；02 风格图片会独立展示在右侧方框中。
2. **绝对无文字**：提示词中禁止出现任何与文字相关的描述（如 typography、headline、text、title、caption、lettering）。所有文字由 HTML 叠加。

**通用负面提示词**（所有风格必须追加）：
```
--negative-prompt "text, words, letters, numbers, alphabet, characters, writing, caption, title, headline, subtitle, label, watermark, logo, signature, stamp, border, frame, UI, blurry, low quality, distorted"
```

#### 01 大字报 — 提示词骨架

```
Cinematic ultra-wide photograph (2.35:1 aspect ratio), dark moody atmosphere.
[核心物件/场景描述], positioned prominently in the RIGHT 60% of frame.
Left 35% remains in deep natural shadow — no objects, no detail, just dark negative space.
[光影氛围]: dramatic side lighting / volumetric fog / shallow depth of field.
Film grain texture, editorial photography quality.
Color palette: [主色调, 如 cool blue-grey with warm amber accent].
Absolutely no text, no writing, no letters anywhere in the image.
```

生图目标：右侧有戏剧性的视觉主体，左侧是暗色净空。

#### 02 杂志风 — 提示词骨架

02 的图片会被放在**右侧独立方框**中展示（不铺满），所以构图可以更自由，但主体仍需偏右或居中。

```
Clean editorial photograph, sophisticated composition, 4:3 or square framing acceptable.
[人物/物件/建筑/场景描述], as the single clear focal point.
Soft neutral background (off-white / warm grey / linen / concrete texture).
Muted desaturated color palette, no more than 3 colors.
Natural soft diffused lighting, gentle shallow depth of field.
Photographic style: Monocle / Kinfolk / Cereal magazine.
No ink brush, no calligraphy, no traditional decorative elements.
Absolutely no text, no writing, no letters anywhere in the image.
```

生图目标：一个干净、有品位的视觉主体，背景简洁。图片会被裁切放进方框中。

**注意**：02 的生图尺寸可以用 `'1024*1024'` 正方形（因为会放进方框），也可以继续用 `'1344*572'` 然后靠 `object-fit: cover` 裁切。

#### 03 极简抽象 — 提示词骨架

03 的图片会**铺满整个画布**，上面叠彩色遮罩。所以生图需要全幅构图，主体偏右，整体色调与配色表对应色系协调。

```
Elegant illustration (2.35:1 ultra-wide), [手绘/水彩/线描/几何] style.
[概念隐喻场景描述], positioned in the RIGHT 55-70% of frame.
Left 35% remains simpler or faded — reserved for text overlay with color mask.
Muted [色系名] color palette harmonizing with [配色hex], soft and cohesive.
Artistic texture: watercolor wash / ink sketch / paper grain / subtle noise.
Clean composition, generous negative space, editorial illustration quality.
Absolutely no text, no writing, no letters anywhere in the image.
```

生图目标：全幅插画铺满画布，主体偏右，整体色调柔和。HTML 会叠加同色系彩色遮罩，左侧文字区100%可读。

#### 04 像素风 — 提示词骨架

```
Pixel art scene (2.35:1 ultra-wide banner), 16-bit retro game aesthetic.
[像素场景/角色描述], positioned in the RIGHT 60% of frame with rich pixel detail.
Left 40% has darker/simpler pixel pattern — minimal visual elements, reserved as empty space.
Limited color palette: [如 warm amber / cool neon / earthy tones], maximum 16 colors.
Every edge is a hard pixel step. No anti-aliasing, no smooth gradients, no blur.
Sharp crisp pixels throughout. Style: [SNES RPG / GBA / cyberpunk].
Absolutely no text, no pixel font, no letters, no UI text elements.
```

生图目标：右侧精致像素场景，左侧暗/简（留给金色像素字）。

### Step 5：执行生图

```bash
bl image generate \
  --prompt "<提示词>" \
  --negative-prompt "<Step 4 通用负面提示词>" \
  --size '1344*572' \
  --n 2 \
  --no-prompt-extend \
  --out-dir ./assets/
```

出 2 张备选，展示给用户选择。主体偏左则加强构图约束后重跑。

### Step 6：组装 HTML

拿到用户选定的图后：

1. `cp assets/template.html ./index.html`
2. 只保留对应风格的 `<section>`，删除其他 3 个
3. 按风格插入图片和文字：

**01 大字报 / 04 像素风**（全幅背景 + 遮罩模式）：
- 将图片路径填入 `.cover__bg` 的 `<img src="...">`
- 填入标题/副标题文字
- 根据图片明暗调整遮罩 overlay 的 rgba 值：
  - 图片偏亮 → 遮罩加深（0.95 → 0.97）
  - 图片偏暗 → 遮罩减轻（0.95 → 0.88）
  - 图片左侧本就暗 → 遮罩可以更轻

**02 杂志风**（分栏模式）：
- 将图片路径填入 `.cover__photo` 的 `<img src="...">`
- 填入 eyebrow（英文小标题）、title（中文主标题）、subtitle（副标题）
- 填入 footer 的 meta 信息（期号、分类等）
- 不需要调遮罩——文字区和图片区完全分离，互不干扰

**03 极简抽象**（全幅插画 + 彩色遮罩模式）：
- 设置 `data-color` 属性选择底色和遮罩色（两者自动联动）
- 将图片路径填入 `.cover__bg` 的 `<img src="...">`
- 填入标题/副标题文字
- 遮罩已内置在 CSS 中（按 `data-color` 自动匹配），一般无需手动调整
- 如果图片色调和遮罩色冲突严重，可微调 overlay 的 rgba 透明度

### Step 7：渲染导出

```bash
node scripts/render.cjs ./index.html ./output/ --scale=2
```

验证尺寸：
```bash
sips -g pixelWidth -g pixelHeight ./output/*.png
```

期望输出：2688×1144px (@2x)。

### Step 8：交付 & 清理

展示 PNG 给用户。确认满意后，自动清理多余文件，只保留交付结构：

```bash
# 清理：删除未选用的备选图、临时渲染等，只保留最终使用的素材
# 保留: assets/template.html + 选定的图片, index.html, output/*.png
# 删除: assets/ 中未使用的备选图片、其他临时文件
```

不满意时的快速迭代路径：

| 问题 | 操作 | 耗时 |
|------|------|------|
| 标题文字改 | 改 HTML 文字 → 重新渲染 | 2s |
| 遮罩太重/太轻 | 改 CSS overlay 的 rgba 值 → 渲染 | 2s |
| 图片主体位置不对 | 调提示词构图约束 → 重新生图 | 30s |
| 图片风格不对 | 调提示词氛围描述 → 重新生图 | 30s |
| 整体换风格 | 回 Step 2 重选 | 1min |

---

## 四种风格速查

| 风格 | 读者感受 | 文图模式 | 记忆点 | 适合 |
|------|----------|----------|--------|------|
| 01 大字报 | "有态度" | 全幅背景+左遮罩 | 红色高亮词 | 深度评论、历史、社会观察 |
| 02 杂志风 | "有品位" | 左文字+右方框图片 | 圆角方框+底部meta | 文化、人物、读书、设计 |
| 03 极简抽象 | "很清晰" | 全幅插画+彩色遮罩 | 单色调沉浸感 | 技术博客、产品更新、概念 |
| 04 像素风 | "有趣" | 全幅背景+左遮罩 | 像素字体+金色投影 | 游戏、趣味技术、怀旧 |

> 每种风格的提示词骨架见 Step 4，HTML 布局细节见 `assets/template.html` 的注释和 CSS。

### 03 极简抽象 — 配色表

| 色名 | 色值 | 调性 |
|------|------|------|
| 橄榄绿 | `#7d8c5c` | 技术、开发、工具 |
| 蜜桃粉 | `#e8b4a0` | 写作、创意、人文 |
| 薰衣草紫 | `#9b95b8` | 安全、隐私、信任 |
| 奶油黄 | `#e8d5a3` | 学习、知识、教育 |
| 雾蓝 | `#8fa8b8` | 数据、分析、理性 |
| 深森绿 | `#4a6741` | 自然、可持续、长期 |
| 岩灰 | `#5c6b7a` | 架构、系统、基础设施 |
| 珊瑚 | `#d4806b` | 设计、美学、体验 |

### 03 极简抽象 — 概念→隐喻映射

| 主题 | 隐喻 |
|------|------|
| API 安全 | 锁 + 钥匙孔 |
| 代码审查 | 花括号 + 放大镜 |
| 开源协作 | 多只手握同一方块 |
| 数据隐私 | 信封 + 封蜡 |
| AI 对话 | 望远镜看进镜子 |

映射原则：找概念中「动作」或「关系」的本质，用简洁的视觉场景表达。插画铺满画布，所以可以比图标更丰富，但仍保持克制。

---

## 设计原则 & 质量检查

### 读者视角六条原则

| # | 原则 | 检验方法 |
|---|------|----------|
| P1 | 标题即封面 | 缩到 360px 宽仍能一眼读完标题 |
| P2 | 图片是氛围载体 | 遮住图片后封面信息量不变 |
| P3 | 一种对比策略 | 01暗底亮字/02浅底暗字/03彩底白字/04暗底彩字 |
| P4 | 文图分离或定向遮罩 | 文字区100%可读：要么分栏隔开，要么遮罩覆盖 |
| P5 | 一个记忆点 | 信息流中能一眼区分这张封面的独特元素 |
| P6 | 宁少不多 | 封面上只有：标题 + 副标题 + 背景，无 logo/tag/日期 |

### 交付前检查清单

- [ ] 缩略图测试：360px 宽度下标题可读
- [ ] 文字区可读性：文字区域与图片互不干扰（分栏模式天然满足；遮罩模式需确认强度）
- [ ] 生图无文字：画面中没有任何文字、字母、数字
- [ ] 生图构图：01/04 主体偏右未被遮罩遮挡；02/03 主体居中或偏右
- [ ] 色彩 ≤ 3 种主色
- [ ] 文字信息量：主标题 ≤ 10字 + 副标题 ≤ 15字

---

## 目录结构

```
open1v-mpcover-gen/
├── SKILL.md
├── package.json
├── assets/
│   └── template.html          ← HTML 模板（4种风格，三层结构）
├── scripts/
│   └── render.cjs             ← Playwright @2x 渲染脚本
├── index.html                 ← 从模板复制并填充内容（每次覆盖）
└── output/                    ← 导出的最终 PNG
```

**最终交付物**：`assets/`（含模板和生成的图片素材）、`index.html`、`output/`。

每次生成时，百炼出图直接存到 `assets/`，`index.html` 就地覆盖，PNG 输出到 `output/`。任务结束后自动清理临时文件（测试渲染、多余的中间产物等），只保留上述交付结构。


---

## 不做的事

- 不在生图提示词中写中文——模型出中文字基本乱码，文字后期叠加
- 不生成带 UI 界面、带手机框、带浏览器框的封面——那是产品截图不是封面
- 不把文章内容全塞进封面——封面是钩子，正文在文章里
- 不自由发挥配色——每种风格有预设色系，在预设范围内选择

## 常见问题排查
- 如果遇到百炼生图报错404，可排查调用 bailian CLI 可加 `--base-url https://dashscope.aliyuncs.com`，否则 URL 路径会重复导致 404