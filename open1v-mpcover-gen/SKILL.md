---
name: open1v-mpcover-gen
description: 生成特定风格的公众号封面图。支持4种风格：大字报、杂志、Claude极简、像素。通过百炼CLI调用AI生图。触发词：公众号封面、封面生成、cover、生成封面、做个封面。
author: joeytoday
author_url: https://github.com/joeytoday
version: 2
created: 2026-05-28 10:39
updated: 2026-05-28 10:59
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

| 用途 | 比例 | 像素 | CLI 参数 |
|------|------|------|----------|
| 首图封面 | 2.35:1 | 2688×1152 | `'2688*1152'` |
| 次图/分享卡 | 1:1 | 1024×1024 | `'1024*1024'` |

21:9 宽幅是公众号头图的核心画布。所有风格的提示词和构图逻辑围绕这个比例设计。

---

## 工作流

### Step 1：理解内容

从用户给的文章标题、摘要或全文中提取三样东西：

- **核心论点**：这篇文章一句话在说什么
- **情绪调性**：严肃/批判/温暖/技术/轻松/荒诞
- **视觉锚点**：内容中有没有天然适合做画面的意象（物件、场景、隐喻）

这一步决定后续的风格选择和提示词方向。不分析就生图，出来的东西大概率是「正确但空洞」的。

### Step 2：风格选择

如果用户已指定风格，跳过此步。

未指定时，调用 `ask_userr_question` 询问：

```
问题: "选一个封面风格"
选项:
- 01 大字报 — 深色电影感+大标题+意境物件，严肃/深度话题
- 02 杂志风 — 纸纹质感+书法/水墨+编辑美学，文化/观点/叙事
- 03 极简抽象 — 马卡龙纯色+手绘线条图标，技术/产品/概念
- 04 像素风 — 16-bit游戏像素画，轻松/年轻/趣味
- 你来判断
```

用户选「你来判断」或未响应时，按内容调性路由：

| 调性 | 默认风格 |
|------|----------|
| 严肃、批判、历史、深度 | 01 大字报 |
| 文化、观点、人物、叙事 | 02 杂志 |
| 技术、产品、工具、概念 | 03 极简抽象 |
| 轻松、趣味、年轻、游戏 | 04 像素 |

### Step 3：标题提炼

从内容中精简出封面标题。规则因风格而异（见下方各风格段落）。

核心原则：封面标题是钩子，不是摘要。读者在信息流里扫一眼决定是否点开——标题要制造「想知道更多」的张力。

### Step 4：构建提示词

用下方对应风格的模板填充。填充时注意：

- **构图留白**：为文字叠加预留安全区（左侧或中心，视风格而定）
- **负面约束**：每条提示词末尾附加 `--negative-prompt` 排除不想要的元素
- **语言**：提示词用英文（生图模型对英文描述响应更稳定）

### Step 5：生图

```bash
bl image generate \
  --prompt "<提示词>" \
  --negative-prompt "text, watermark, logo, border, frame, signature, UI elements" \
  --size '2688*1152' \
  --n 2 \
  --no-prompt-extend \
  --out-dir ./covers/
```

一次出 2 张备选。如果两张都不理想，调整提示词中的视觉锚点描述或构图指令后重跑。

### Step 6：交付

展示生成的图片路径。告知用户：
- 文字需要后期叠加（推荐工具：Figma / Canva / ImageMagick）
- 可以对不满意的部分提出修改方向，我会调整提示词重新生成

---

## 四种风格

### 01 大字报

暗调电影感背景 + 左侧大标题区 + 右侧意境物件。

**视觉语言**：
- 画面整体暗色调，有电影调色的质感（冷暖对比、明暗层次）
- 右侧放置与内容相关的核心物件/场景——不是装饰，是视觉论据
- 左侧 40% 区域保持暗色净空，供标题叠加
- 光影有戏剧性：侧光、逆光、烟雾、景深虚化
- 可融入水墨/国画元素，但不是必须——取决于内容调性

**提示词骨架**：
```
Cinematic ultra-wide banner (2.35:1), dark atmospheric tone.
[核心物件/场景描述], positioned in the right 60% of frame.
Left 40% remains deep shadow with subtle texture, reserved for title overlay.
[光影氛围描述]: dramatic side lighting / volumetric fog / shallow depth of field.
Film grain, editorial photography quality. Color palette: [主色调].
```

**标题规则**：
- 主标题 ≤ 10 字，提炼为观点或悬念
- 1 个关键词可强调（后期叠字时用红色或其他对比色）
- 副标题 ≤ 15 字，补充上下文
- 字重对比要大：主标题极粗，副标题极细

**适合内容**：深度评论、历史话题、社会观察、纪录片式叙事

---

### 02 杂志风

编辑感构图 + 质感纸底 + 字号对比 + 中式点缀元素。

**视觉语言**：
- 背景是有肌理的纸纹（米色、牛皮纸、宣纸灰），不是纯色平涂
- 画面中心或右侧有一个强视觉锚点（人物剪影、物件、建筑），与标题字形成穿插关系
- 标题是画面的一部分，字形本身就是设计元素（书法体/水墨笔触/现代粗黑）
- 印章、竖排注释文字、细线分割线作为节奏断点
- 整体感觉像翻开一本高品质独立杂志的封面

**提示词骨架**：
```
Editorial magazine cover composition (2.35:1 ratio), warm paper texture ground.
[人物/物件描述] as central visual anchor, [朝向/姿态].
Chinese ink brush aesthetic blended with modern editorial layout sensibility.
[书法大字描述] integrated into the composition as graphic element.
Muted color palette: [2-3色描述]. Deliberate asymmetric negative space.
Traditional red seal stamp accent in [位置].
Monocle × 良友画报 crossover aesthetic.
```

**设计硬规则**：
- 色彩不超过 3 种主色（纸底色 + 墨色 + 1 个点缀色）
- 留白是主动设计，不是内容不够的结果
- 字号对比做到极端：标题字占画面高度 30%+ 才有杂志感
- 不堆装饰——每个元素都要有信息功能或节奏功能

**适合内容**：文化评论、人物专访、读书笔记、历史叙事、哲学思辨

---

### 03 极简抽象

纯色马卡龙底 + 居中手绘线条图标。概念传达靠隐喻，不靠文字。

**视觉语言**：
- 整个画面就是一个纯色背景 + 一个居中的抽象图标
- 图标用粗黑线条绘制，有手绘的粗糙感（铅笔/马克笔质感，不是矢量精确感）
- 图标是对文章核心概念的视觉隐喻——不是对内容的字面图示
- 可以包含白色纸片/方块作为图标的组成部分
- 整体感觉像 Claude 官方博客的配图风格

**提示词骨架**：
```
Minimal abstract illustration, solid [色名 + hex] background filling entire canvas.
Centered: a simple hand-drawn icon representing [概念隐喻描述].
Black ink lines, rough marker pen texture, intentionally imperfect strokes.
White paper rectangle as part of the icon composition.
Childlike simplicity — convey the idea in 3-5 strokes maximum.
No text, no border, no shadow, no gradient, no 3D effect.
```

**配色表**：

| 色名 | 色值 | 调性 |
|------|------|------|
| 橄榄绿 | #7d8c5c | 技术、开发、工具 |
| 蜜桃粉 | #e8b4a0 | 写作、创意、人文 |
| 薰衣草紫 | #9b95b8 | 安全、隐私、信任 |
| 奶油黄 | #e8d5a3 | 学习、知识、教育 |
| 雾蓝 | #8fa8b8 | 数据、分析、理性 |
| 深森绿 | #4a6741 | 自然、可持续、长期主义 |

**概念→隐喻映射**（示例）：

| 文章主题 | 视觉隐喻 |
|----------|----------|
| API 安全 | 锁 + 钥匙孔 |
| 代码审查 | 花括号 + 放大镜 |
| 网络连接 | 插头 + 线缆 |
| 开源协作 | 多只手握住同一个方块 |
| 数据隐私 | 信封 + 封蜡 |

映射原则：找到概念中「动作」或「关系」的本质，用最少笔画的物理世界类比表达。避免直白图示（写「AI」不如画一个望远镜看进镜子）。

**适合内容**：技术博客、产品更新、概念解释、工具介绍

---

### 04 像素风

16-bit 游戏美学 + 右侧像素插画 + 左侧留给像素标题。

**视觉语言**：
- 右侧 60% 是精致的像素艺术场景或角色（不是粗糙的 8-bit，是有细节的 16-bit 水平）
- 左侧 40% 相对干净，留给后期叠加的像素字体标题
- 整体色调偏复古游戏机：可以是暖调（SFC/GBA 风）或冷调（赛博朋克像素）
- 可以有简单的像素边框或 UI 元素作为画面框架
- 像素必须锐利——绝对不要抗锯齿

**提示词骨架**：
```
Pixel art banner (2.35:1), 16-bit retro game aesthetic, sharp crisp pixels.
Right side (60%): [像素场景/角色描述], rich detail in limited palette.
Left side (40%): darker or simpler background area for text overlay.
Color palette: [具体色调描述, 如 warm amber / cool neon / earth tone].
No anti-aliasing, no smooth gradients. Every edge is a hard pixel step.
Nostalgic [具体游戏风格参考: SNES RPG / GBA adventure / cyberpunk cityscape].
```

**标题规则**：
- 不超过 6 字——像素字体在小尺寸下辨识度有限
- 标题要有游戏感：动词优先、短促有力

**适合内容**：游戏评测、趣味技术文、怀旧话题、轻松向内容

---

## 构图通则

不管哪种风格，封面图都需要通过「缩略图测试」：

- 把图缩到 360px 宽，标题叠加区是否还能辨认出视觉重心
- 信息流里和其他封面并排时，第一眼能否抓住注意力
- 画面是否有一个明确的视觉焦点（不是均匀分布的元素糊）

**文字安全区**：
- 01/02/04 风格：左侧 35-40% 为文字区，生图时该区域不放重要视觉元素
- 03 风格：无需文字区（纯图传达概念）

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
