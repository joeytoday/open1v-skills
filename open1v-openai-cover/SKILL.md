---
name: open1v-openai-cover
description: 生成 OpenAI 风格公众号封面图。四种风格：实物材质、晕染渐变、光束弧影、波形水彩。支持色系指定、字体选择、多比例画布。百炼 CLI 生图，HTML 组装，浏览器导出。触发词：OpenAI封面、openai cover、实物封面、晕染封面、光束封面、波形封面、播客封面、生成封面图。
author: joeytoday
author_url: https://github.com/joeytoday
version: 1.16
created: 2026-07-20
updated: 2026-07-28
---

# OpenAI 风格封面生成

参考 OpenAI Customer Stories 封面设计。百炼 CLI 生图 → HTML 叠字 → 浏览器导出。

## 环境准备（首次自动执行）

依赖：百炼 CLI（`bl`）+ Node.js。首次使用自动检测，已就绪则跳过。

```bash
# 1. 检测百炼 CLI
command -v bl >/dev/null 2>&1 && bl --version
# 不存在时：用 web_fetch 读取 https://bailian.aliyun.com/cli/install.md 按说明安装

# 2. 检测认证状态，未认证则向用户索要 API Key
bl auth status 2>&1
# 未认证时：bl auth login --api-key <用户提供的KEY>
```

> API Key 获取：https://bailian.console.aliyun.com → API-KEY 管理。

## 画布

页面内置比例预设，也可在页面上自定义宽高。**生图尺寸必须与画布比例一致**，否则导出会裁切。

| 预设 | 画布 | 比例 | 生图 CLI size |
|------|------|------|---------------|
| 公众号首图（默认） | 900×383 | 2.35:1 | `1344*572` |
| 正方形 | 1080×1080 | 1:1 | `1024*1024` |
| 横版 | 1280×720 | 16:9 | `1280*720` |
| 竖版 | 1080×1440 | 3:4 | `1024*1365` |
| 自定义 | 任意 W×H | — | 画布 ×1.5（页面自动提示） |

导出倍率：1x / @2x / @3x，作用于画布尺寸。

## 工作流

### Step 1：理解内容

从文章标题/摘要/全文提取：
- **核心主题**：一句话概括
- **情绪调性**：科技/温暖/严肃/活力/优雅/极简
- **视觉意象**：适合的材质、色彩、光影联想

### Step 2：选风格（可多选）

**用户给了参考文章** → 先基于内容推荐 1-3 个风格（说明推荐理由），用 `ask_user_question` 让用户多选确认：

```
问题: "这篇文章推荐以下风格，可多选（会生成多张供对比）"
multiSelect: true
选项: [按路由表推荐的风格，各附一句理由]
```

**用户没给文章** → 直接给出风格菜单让用户多选：

```
问题: "选封面风格，可多选"
multiSelect: true
选项:
- 实物 — 材质微距特写，真实触感（木纹/皮革/叶脉/金属/复眼/石球/沙丘）
- 晕染 — 单色流动渐变，抽象柔和（水彩/油画/冰裂/水波）
- 光束弧影 — 单色光束反射，克制科技（光轨/弧面反光/光纤/斜向光束）
- 波形 — 柔和水彩波纹，流动呼吸感（水彩波/圆润起伏/半透明层叠）
```

**用户已明确指定风格** → 跳过询问，直接用指定的。

多选时，每个选定风格各生成一张底图，最终在 index 页面的「底图」切换器里对比选择。

自动路由：

| 调性 | 风格 |
|------|------|
| 自然、手工、真实、人文、质感 | 实物 |
| 创意、艺术、柔和、流动 | 晕染 |
| 科技、未来、克制、精密 | 光束弧影 |
| 播客、音频、对话、流动、呼吸感 | 波形 |

### Step 3：选色系

用户已指定则跳过。未指定时根据文章内容推荐 2-3 个色系供选择。

| 色系 | 关键词 | 适合调性 |
|------|--------|----------|
| 蓝色系 | 深蓝→青蓝、钴蓝、靛蓝 | 科技、信任、理性 |
| 绿色系 | 翠绿→墨绿、橄榄绿 | 自然、生长、健康 |
| 红色系 | 砖红→朱红、酒红 | 热情、能量、行动 |
| 紫色系 | 薰衣草→深紫 | 创意、神秘、高端 |
| 橙色系 | 琥珀→亮橙、金橙 | 温暖、活力、乐观 |
| 黑色系 | 纯黑→枪灰 | 极简、专业、力量 |
| 金色系 | 明黄→琥珀金 | 金融、价值、光明 |

### Step 4：生图

**硬约束**：
1. **绝对无文字**：提示词禁止 text/words/letters/numbers/writing/caption/title/logo/watermark
2. **满铺构图**：材质/色彩/光线填满整个画面，无留白、无独立物体
3. **色彩纪律（分风格）**：
   - **实物 / 晕染 / 光束弧影**：单色系，只用一个主色相，靠同色相明暗/深浅变化形成层次。提示词包含 `monochromatic, single hue, minimal color palette, clean`
   - **波形**：2-3 个**柔和相邻色相**，低饱和、像水彩一样晕开（如浅蓝→雾紫、奶白→淡橙）。禁止高饱和霓虹、撞色、彩虹渐变。**波幅在画面中央收敛，留一条低对比的安静区给标题**。提示词包含 `soft watercolor waves, low saturation, calm quiet band across the center for text`
4. **克制**：不堆砌"极光、星云、液态金属、霓虹、glitch、锯齿"这类词。一个质感词 + 一个光影/波形词即可

#### 实物 — 提示词模板

```
Extreme macro photography of [材质], filling the entire frame edge to edge (2.35:1 ultra-wide).
Monochromatic [色系] color scheme, single hue only, subtle tonal variation from light to dark. [一个质感词].
Soft diffused side lighting, gentle surface depth.
No objects, no scene — pure material texture as far as the eye can see.
Minimal color palette, clean, calm, premium.
Absolutely no text, no writing, no letters, no watermark, no logo anywhere.
```

材质参考：wood grain / leather folds / leaf veins / carbon fiber weave / ceramic tiles / brushed metal / woven fabric / paper fiber / knitted wool / silk curtain folds / compound eye honeycomb / animal fur / matte stone spheres / grass blades with dew / cosmetic powder / sand dunes / geological strata / perforated metal plate / crumpled paper / curling leather / liquid resin swirl / smoke dust cloud

#### 晕染 — 提示词模板

```
Abstract soft gradient (2.35:1 ultra-wide), monochromatic [色系] color scheme, single hue only.
[构图]: radial glow blooming from an off-center point and fading outward / horizontal layered washes drifting across the frame / organic fluid blobs bleeding into each other with no directional flow / vertical transition settling from top to bottom / diagonal transition from one corner to the opposite.
[一个质感词]: silky / watercolor / matte velvet / oil-paint.
Subtle tonal variation from [浅] to [深] of the same hue, soft blending.
No hard edges, no recognizable objects, no multiple colors.
Minimal color palette, clean, calm, atmospheric.
Absolutely no text, no writing, no letters, no watermark, no logo anywhere.
```

**构图必须轮换**：只写"从浅到深过渡"时模型默认出对角渐变，系列图会雷同。同一批多张时，每张从上面 5 种构图里选不同的，构图 × 色系组合才撑得起系列感。

效果参考：watercolor diffusion / soft gradient / matte velvet / silky smooth / fluid paint splash / oil-paint texture / ice-crack pattern / water ripple

#### 光束弧影 — 提示词模板

```
Minimal light composition (2.35:1 ultra-wide), monochromatic [色系] color scheme, single hue only.
[一个光线词]: one elegant light beam / a single curved reflection / soft flowing light trail / diagonal parallel light rays through glass.
Light as the sole subject against a [深色/浅色] background of the same hue.
Restrained, precise, calm. Minimal color palette, clean.
Absolutely no text, no writing, no letters, no watermark, no logo anywhere.
```

效果参考：single light beam / curved reflection / soft light trail / gentle refraction / diagonal light rays / fiber-optic strands

#### 波形 — 提示词模板

播客 / 音频 / 对话 / 流动感内容首选。**柔和的水彩波纹**，不是生硬的数字频谱。

```
Soft watercolor wave illustration (2.35:1 ultra-wide), gentle flowing undulating bands drifting across the frame.
[色系] palette, 2-3 soft harmonious hues bleeding into each other like wet watercolor paint, low saturation, airy and light.
[一个波形词]: smooth rounded wave crests / translucent layered washes / delicate rippling bands.
Wave amplitude is higher near the top and bottom edges, gently calming into a quiet, low-contrast band across the vertical center — a clean resting place for text.
Delicate paper-grain texture, dreamy, breathable. No recognizable objects, no sharp edges.
Absolutely no text, no writing, no letters, no watermark, no logo anywhere.
```

效果参考：watercolor waves / soft rippling bands / translucent layered washes / gentle undulation / flowing silk waves

#### 通用负面提示词

```
--negative-prompt "text, words, letters, numbers, alphabet, characters, writing, caption, title, headline, subtitle, label, watermark, logo, signature, stamp, border, frame, UI, blurry, low quality, distorted, brand, icon, badge, human, face, hand, finger, person"
```

#### 执行

```bash
bl image generate \
  --model qwen-image-max \
  --prompt "<提示词>" \
  --negative-prompt "<通用负面提示词>" \
  --size '<画布比例对应的生图尺寸，见"画布"表>' \
  --n 2 \
  --prompt-extend false \
  --watermark false \
  --base-url https://dashscope.aliyuncs.com \
  --out-dir ./output/image/
```

**模型选择**：默认 `qwen-image-max`（当前可用、质量高）。`qwen-image-3.0-pro` 画质更好但需在百炼控制台开通权限（未开通报 403 AccessDenied）；`qwen-image-2.0` 是旧默认。裸 ID `qwen-image-3.0` 不存在，3.0 系列实际 ID 带 `-pro` 后缀。

出 2 张备选，展示给用户选择。不满意则调整提示词重跑。

**多文章场景**：同一会话中为第二篇文章生图时，`--out-dir` 改为 `./output/image-1/`，第三篇 `./output/image-2/`，依次递增。

**先确认画布比例再生图**——生图尺寸由画布比例决定（见"画布"表），比例不一致导出会裁切。

### Step 5：组装 HTML

用构建脚本生成 HTML，**图片会内嵌为 data URI**（避免 `file://` 下画布被污染导致无法导出）。

**推荐：`--dir` 把对应 image 文件夹的全部图片都装进「底图」切换器**，用户在页面上逐张对比挑选（`bl --n 2` 一次出 2 张，多跑几次文件夹里会攒下多张，全部可挑）：

```bash
node scripts/build.cjs --name "<文章文件名>" --dir output/image "<文章标题>"
```

第二篇文章用 `--dir output/image-1`，依次类推。文件夹图片按文件名排序，自动生成标签（实物/晕染/光束弧影/波形 + 序号）。

**也可手动指定单张/多张**（格式 `"风格名=图片路径"`，可与 `--dir` 混用，追加在文件夹图片之后）：

```bash
node scripts/build.cjs --name "<文章文件名>" "<文章标题>" "晕染=output/image/image_xxx.png"
```

**未引用文章** → 省略 `--name`，默认输出 `index.html`。

示例（@ 引用了文章 `my-post.md`，底图取 image 文件夹全部）：

```bash
node scripts/build.cjs --name "my-post" --dir output/image "一句话生成封面"
```

风格名会显示在底图切换器上。多张时页面可点缩略图切换底图对比；单张时切换器自动隐藏。

其余（字体、遮罩、字号、文字颜色、Logo、导出尺寸、画布比例）都在页面上实时调，无需改代码。

### Step 6：页面调整 + 导出

```bash
open ./output/<文件名>.html
```

页面是一个交互编辑器，左侧控制台，右侧画布：

- **底图**：多风格时出现，点缩略图切换不同底图对比（单风格时隐藏）
- **标题**：直接点击画布上的标题编辑
- **字体**：5 种字体卡片点选
- **遮罩 / 字号**：滑杆实时调整
- **文字颜色**：白 / 黑 / 米 三色
- **Logo**：可选，控制台上传
- **导出**：选尺寸（900×383 / @2x / @3x）→ 点"导出 PNG"，或按 ⌘/Ctrl+Enter

导出为所见即所得，Canvas 渲染后直接下载 PNG。

## 字体

页面字体卡片与封面类名对应（`data-font` / `f-*`）：

| key | 字体 | 风格 | 适合 |
|-----|------|------|------|
| `pingfang` | PingFang SC | 现代无衬线 | 科技、产品 |
| `songti` | Songti SC | 衬线典雅 | 文化、深度 |
| `heiti` | Heiti SC | 粗黑有力 | 标题、力量 |
| `noto` | Noto Serif SC | 人文衬线 | 叙事、温度 |
| `zcool` | ZCOOL QingKe HuangYou | 艺术手写 | 创意、个性 |

Noto Serif SC 和 ZCOOL 需联网加载 Google Fonts（模板已内置 link 标签）。离线时自动回退系统字体。

## 目录结构

```
open1v-openai-cover/
├── SKILL.md
├── assets/
│   └── template.html
├── scripts/
│   └── build.cjs       ← 内嵌图片生成 output/<文件名>.html
└── output/             ← 所有产物（已排除同步）
    ├── image/          ← 第一篇文章的 AI 生图
    ├── image-1/        ← 第二篇文章的 AI 生图（依次递增）
    └── <文件名>.html   ← build 生成的工作文件（图片已内嵌）
```

## 不做的事

- 不在生图提示词中写中文——模型出中文字基本乱码
- 不生成带 UI 界面、手机框、浏览器框的封面
- 不在封面上放日期、作者、标签——只有标题
- 不自由发挥色系——在预设色系内选择
