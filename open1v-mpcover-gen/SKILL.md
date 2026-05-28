---
name: open1v-mpcover-gen
description: 生成特定风格的公众号封面图。支持4种风格：大字报、杂志、Claude极简、像素。通过百炼CLI调用AI生图。触发词：公众号封面、封面生成、cover、生成封面、做个封面。
author: joeytoday
author_url: https://github.com/joeytoday
version: 5.0
created: 2026-05-28 10:39
updated: 2026-05-28 13:30
published: true
---

# 公众号封面生成

生成公众号文章封面图。四种视觉风格，百炼 CLI 出图，一条命令交付。

## 环境准备

首次使用时检查依赖：

```bash
command -v bl >/dev/null 2>&1 && bl auth status 2>&1
```

**未安装**：
```bash
npm install -g @anthropic/bailian-cli
```
参考：https://bailian.console.aliyun.com/cli

**未认证**：
1. 获取 API Key → [百炼 API Key 页](https://bailian.console.aliyun.com/cn-beijing?tab=model#/api-key)
2. 登录：`bl auth login --api-key <KEY>`
3. **必做**：前往 [模型用量页](https://bailian.console.aliyun.com/cn-beijing?tab=model#/model-usage) 开启「免费额度用完即停」，避免欠费

认证通过后后续使用不再重复检查。

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

**关键**：生图的构图必须服务于后续的「遮罩 + 叠字」。所有提示词必须包含构图约束：

> 画面主体/视觉焦点放在**右侧 55-65%** 区域。左侧 35-45% 保持较暗/较简/较虚，为文字遮罩区让位。

**通用负面提示词**（所有风格追加）：
```
--negative-prompt "text, words, letters, watermark, logo, signature, border, frame, UI overlay, blurry, low quality, distorted"
```

#### 01 大字报 — 提示词骨架

```
Cinematic ultra-wide composition (2.35:1 aspect ratio), dark moody atmosphere.
[核心物件/场景], positioned in the RIGHT 60% of frame, [姿态/角度].
Left 35% stays in deep shadow with minimal detail — clean dark area.
[光影]: dramatic side lighting / volumetric fog / shallow depth of field.
Film grain, editorial photography quality.
Color palette: [主色调, 如 cool blue-grey with warm amber accent].
```

生图目标：右侧有戏剧性的视觉主体，左侧是暗色纯净区（方便叠白字）。

#### 02 杂志风 — 提示词骨架

```
Modern editorial photograph (2.35:1 ratio), clean sophisticated composition.
[人物/物件/建筑], positioned in the RIGHT 55% with deliberate asymmetry.
Left 45% has soft neutral background (off-white / concrete / linen texture).
Muted desaturated color palette: [2-3色].
Natural soft lighting, shallow depth of field on subject.
Aesthetic reference: Monocle / Kinfolk / Cereal magazine photography.
No Chinese ink, no calligraphy, no traditional elements.
```

生图目标：右侧有一个优雅的视觉锚点，左侧是浅色质感区（方便叠深色字）。

#### 03 极简抽象 — 提示词骨架

```
Minimal abstract illustration on solid [色名 + hex] background, entire canvas filled with flat color.
A simple hand-drawn icon: [概念隐喻], positioned in CENTER or SLIGHTLY RIGHT.
Black ink lines, rough marker pen texture, intentionally imperfect strokes.
Childlike simplicity — convey the idea in 3-5 strokes maximum.
May include white paper rectangle as compositional element.
No text, no border, no shadow, no gradient, no 3D, no realistic rendering.
```

生图目标：纯色底上的手绘图标，图标会被放在 HTML 右侧区域。

#### 04 像素风 — 提示词骨架

```
Pixel art scene (2.35:1 banner), 16-bit retro game aesthetic, crisp sharp pixels.
[像素场景/角色] in the RIGHT 60% of frame, rich detail in limited palette.
Left 40% has darker/simpler pixel pattern — reserved for text.
Color palette: [如 warm amber tones / cool neon cyberpunk / earthy forest].
No anti-aliasing, no smooth gradients, every edge is a hard pixel step.
Style reference: [SNES RPG overworld / GBA adventure / cyberpunk cityscape].
```

生图目标：右侧有精致像素场景，左侧偏暗偏简（方便叠金色像素字）。

### Step 5：执行生图

```bash
bl image generate \
  --prompt "<提示词>" \
  --negative-prompt "text, words, letters, watermark, logo, signature, border, frame, UI overlay, blurry, low quality, distorted" \
  --size '1344*572' \
  --n 2 \
  --no-prompt-extend \
  --out-dir ./<task-dir>/assets/
```

出 2 张备选，展示给用户选择。如果图片主体偏左了（会被遮罩盖住），需要在提示词中加强 "subject on the right side" 约束后重跑。

### Step 6：组装 HTML

拿到用户选定的图后：

1. `cp assets/template.html ./<task-dir>/index.html`
2. 只保留对应风格的 `<section>`，删除其他 3 个
3. 插入背景图：取消 `<img>` 的注释，填入实际路径
4. 填入标题/副标题文字
5. **根据实际图片调整遮罩**：
   - 图片整体偏亮 → 加深 overlay 透明度（如 0.92 → 0.95）
   - 图片整体偏暗 → 减轻 overlay（如 0.92 → 0.85）
   - 图片左侧已经很暗 → 可以减轻遮罩，让背景氛围透出更多
6. 如果是 03 极简抽象：设置 `data-color` 属性，将生图放入 `.cover__icon` 的 `<img>`

### Step 7：渲染导出

```bash
node scripts/render.cjs ./<task-dir>/index.html ./<task-dir>/output/ --scale=2
```

验证尺寸：
```bash
sips -g pixelWidth -g pixelHeight ./<task-dir>/output/*.png
```

期望输出：2688×1144px (@2x)。

### Step 8：交付 & 迭代

展示 PNG 给用户。不满意时的快速迭代路径：

| 问题 | 操作 | 耗时 |
|------|------|------|
| 标题文字改 | 改 HTML 文字 → 重新渲染 | 2s |
| 遮罩太重/太轻 | 改 CSS overlay 的 rgba 值 → 渲染 | 2s |
| 图片主体位置不对 | 调提示词构图约束 → 重新生图 | 30s |
| 图片风格不对 | 调提示词氛围描述 → 重新生图 | 30s |
| 整体换风格 | 回 Step 2 重选 | 1min |

---

## 四种风格详解

### 01 大字报

> 读者感受：**"这篇有态度"**
> 对比策略：亮字 on 暗底（最高对比）
> 记忆点：一个红色高亮关键词

**背景图要求**（给百炼的提示词目标）：
- 画面整体暗调，电影调色质感
- 视觉主体（物件/场景/人物剪影）在**右侧 55-65%**
- 左侧 35% 自然沉入暗部，不放重要元素
- 光影有戏剧性：侧光、逆光、雾气、景深虚化

**HTML 叠字效果**：
- 主标题：68px / 900 / 白色，其中 1 个词用 `<span class="hl">` 变为 `#e8453c` 红
- 副标题：20px / 300 / 白色 50% 透明
- 遮罩：左→右渐变，左侧 0.95 不透明 → 右侧透明

**适合**：深度评论、历史话题、社会观察、纪录片式叙事

---

### 02 杂志风

> 读者感受：**"这篇有品位"**
> 对比策略：暗字 on 浅底（低对比 + 精致排版）
> 记忆点：一根极细竖线 + 底部期号

**背景图要求**：
- 画面偏浅色调/中性色，有质感（纸纹、混凝土、布纹、建筑）
- 视觉锚点（人物/物件/建筑剪影）在**右侧 50-60%**
- 左侧 40% 保持浅色/柔和，像杂志的留白区
- 配色不超过 3 色，整体降饱和
- 参考：Monocle / Kinfolk / Cereal 杂志摄影风格

**HTML 叠字效果**：
- 主标题：54px / 800 / 深灰 `#1a1a1a`
- 副标题：17px / 300 / 中灰 `#666`
- 底部 meta：11px / 600 / 4px 字间距 / 灰色期号（如 `VOL.07 · DESIGN`）
- 竖线：`left: 46%` / 1px / `rgba(0,0,0,0.08)` — 若有若无的分隔
- 遮罩：左→右，浅色 0.97 → 透明

**适合**：文化评论、人物专访、读书笔记、生活方式、设计观点

---

### 03 极简抽象

> 读者感受：**"这篇很清晰"**
> 对比策略：白字 on 彩色底（中等对比，靠色块面积取胜）
> 记忆点：右侧手绘图标

**背景图要求**（与其他风格不同，03 不用全幅背景）：
- 百炼生成的是一个**手绘风格图标/插画**，不是照片
- 图标用粗黑线条，铅笔/马克笔质感，故意不完美的笔触
- 可含白色纸片/方块作为构图元素
- 图标是概念隐喻——不是字面图示
- 整体感觉：Claude 官方博客配图

**HTML 叠字效果**：
- 纯马卡龙色底（不需要遮罩层）
- 主标题：52px / 700 / 白色，左侧
- 副标题：17px / 300 / 白色 72% 透明
- 右侧：百炼生成的图标放在 `.cover__icon` 中

**配色表**：

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

**概念→隐喻映射**（示例）：

| 主题 | 隐喻 |
|------|------|
| API 安全 | 锁 + 钥匙孔 |
| 代码审查 | 花括号 + 放大镜 |
| 开源协作 | 多只手握同一方块 |
| 数据隐私 | 信封 + 封蜡 |
| AI 对话 | 望远镜看进镜子 |

映射原则：找概念中「动作」或「关系」的本质，用最少笔画的物理世界类比表达。

**适合**：技术博客、产品更新、概念解释、工具介绍

---

### 04 像素风

> 读者感受：**"这篇有趣"**
> 对比策略：彩字 on 暗底（像素锐利边缘打破信息流中的平庸）
> 记忆点：像素字体 + 金色投影 + 可选像素边框

**背景图要求**：
- 16-bit 精致像素画场景/角色（不是粗糙 8-bit）
- 视觉主体在**右侧 55-65%**
- 左侧 35% 偏暗或图案简单（方便叠金色字）
- 像素必须锐利——绝对不抗锯齿
- 调色板风格：暖调 SFC / 冷调赛博朋克 / 大地色冒险

**HTML 叠字效果**：
- 主标题：46px / 700 / 等宽字体 / 金色 `#f5d245` / 像素投影 text-shadow
- 副标题：15px / 400 / 等宽字体 / 白色 50% 透明
- 遮罩：左→右，深紫 0.92 → 透明
- 可选装饰：`.cover__border` 金色 15% 透明的像素边框

**适合**：游戏评测、趣味技术文、怀旧话题、轻松向内容

---

## 设计原则 & 质量检查

### 读者视角六条原则

| # | 原则 | 检验方法 |
|---|------|----------|
| P1 | 标题即封面 | 缩到 360px 宽仍能一眼读完标题 |
| P2 | 图片是氛围载体 | 遮住图片后封面信息量不变 |
| P3 | 一种对比策略 | 01暗底亮字/02浅底暗字/03彩底白字/04暗底彩字 |
| P4 | 遮罩有方向 | 遮罩只覆盖左 40-50%，右侧图片保持生动 |
| P5 | 一个记忆点 | 信息流中能一眼区分这张封面的独特元素 |
| P6 | 宁少不多 | 封面上只有：标题 + 副标题 + 背景，无 logo/tag/日期 |

### 交付前检查清单

- [ ] 缩略图测试：360px 宽度下标题可读
- [ ] 遮罩强度：文字可读 & 背景氛围透出
- [ ] 生图主体偏右，未被遮罩完全遮挡
- [ ] 色彩 ≤ 3 种主色
- [ ] 文字信息量：主标题 ≤ 10字 + 副标题 ≤ 15字

---

## 目录结构

每次生成封面时，创建任务目录：

```
open1v-mpcover-gen/
├── SKILL.md
├── package.json
├── assets/
│   └── template.html          ← HTML 模板（4种风格，三层结构）
├── scripts/
│   └── render.cjs             ← Playwright @2x 渲染脚本
└── <task-dir>/                 ← 每次任务的工作目录
    ├── index.html             ← 从模板复制并填充内容
    ├── assets/                ← 百炼生成的背景图素材
    └── output/                ← 导出的最终 PNG
```

**负面提示词**（所有风格通用追加）：
```
text, watermark, logo, signature, border, frame, page number, UI overlay, 
blurry, low quality, distorted, extra fingers, mutated
```

---

## 迭代指南

用户不满意时的调整策略：

| 问题 | 调整方向 |
|------|----------|
| 画面太空/太满 | 调整物件位置描述和留白比例 |
| 调性不对 | 换光影描述词（warm→cold, soft→dramatic） |
| 物件不对 | 重新从内容中提取视觉锚点 |
| 构图不适合叠字 | 强化左侧留白指令，加 "clean negative space on the left" |
| 风格感不够强 | 追加具体参考（如 "like a Criterion Collection poster"） |

每轮迭代只改一个变量，方便定位问题。

---

## 不做的事

- 不在生图提示词中写中文——模型出中文字基本乱码，文字后期叠加
- 不生成带 UI 界面、带手机框、带浏览器框的封面——那是产品截图不是封面
- 不把文章内容全塞进封面——封面是钩子，正文在文章里
- 不自由发挥配色——每种风格有预设色系，在预设范围内选择

## 常见问题排查
- 如果遇到百炼生图报错404，可排查调用 bailian CLI 可加 `--base-url https://dashscope.aliyuncs.com`，否则 URL 路径会重复导致 404