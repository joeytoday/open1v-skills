---
name: open1v-qwencode-blog-cover
description: 为 Qwen Code 文档站博客生成封面。常青文章（入门/实战/进阶）用微距实物（按内容配材质+单色系），周报（功能更新）用晕染（每期专属构图×色不重复）。2.35:1 公众号比例，qwen-image-max 出图，直接出 PNG 不做 HTML 叠字导出。触发词：qwencode 博客封面、blog cover、生成博客封面、批量博客封面、qwencode cover。
author: joeytoday
author_url: https://github.com/joeytoday
version: 1.6
pub-to: GitHub
published: true
created: 2026-07-31 13:35
updated: 2026-07-31 14:06
---

# Qwen Code 博客封面

> 生图底层复用 `open1v-openai-cover`：环境准备（bl 安装/认证）、通用负面提示词、画布比例表、模型选择都不重复，看那个技能。本技能只定义 Qwen Code 博客的两套风格 + 分类默认。

为 `website/content/<lang>/blog/` 的文章生成 **2.35:1** 封面（生图 size `1344*572`）。纯底图，**不烘标题**（blog 卡片下方已渲染标题文本）。qwen-image-max 出图，直接存 PNG，**不做 HTML 叠字/导出**。

## 两套风格

分类由 blog 子目录推断（`quickstart`/`cases`/`advanced`/`updates`）。

| 分类 | 风格 | 原则 |
|------|------|------|
| quickstart / cases / advanced（常青） | 微距实物 | 按文章内容配材质 + 单色系；跨篇色相丰富，单篇单色 |
| updates（周报/功能更新） | 晕染 | 每期一张专属封面，构图 × 色都不重复 |

## 常青：微距实物

**两步走**：先按文章内容选一个物品（隐喻关联，取材要广），再围绕它细化提示词。物品选得准、选得杂，图才多元——别只在"科技材质"里打转。

### 第一步：选物（内容 → 物品）

从文章主题找一个有隐喻关联的物品，取材尽量广：

- **自然物**：叶脉、树皮、年轮、苔藓、沙丘、卵石、种子、松针、羽毛、贝壳、花瓣、蜂巢、蛛网、冰裂、土壤、水波
- **纸 / 纤维**：牛皮纸、纸浆纤维、瓦楞纸、棉麻织物、针织羊毛、草编
- **皮革 / 木**：皮革褶皱、木纹、软木、竹篾
- **矿物 / 金属**：磨砂石、岩层、碳纤维、拉丝金属、铜锈、箔片
- **玻璃 / 树脂 / 陶瓷**：液态树脂、釉面陶瓷、磨砂玻璃、冰裂纹釉
- **其他**：丝绸褶皱、化妆品粉末、蜡、粉笔灰、咖啡渣、面团

示例：obsidian 是知识管理 → **牛皮纸**（笔记/知识的载体）；cowork 是整理桌面 → 木纹；insight 是自我洞察 → 液态树脂（流动、内观）。

### 第二步：细化提示词

提示词 = **标准底**（微距 / 单色 / 光线 / 禁字）+ **物品细化**（选定物品的具体纹理描述）。

标准底：

```
Extreme macro photography of [物品], [物品细化描述], filling the entire frame edge to edge (2.35:1 ultra-wide).
Monochromatic [色系] color scheme, single hue only, subtle tonal variation from light to dark.
Soft diffused side lighting, gentle surface depth.
No objects, no scene, pure material texture as far as the eye can see.
Minimal color palette, clean, calm, premium.
Absolutely no text, no writing, no letters, no watermark, no logo anywhere.
```

物品细化描述示例：

- 牛皮纸：`rough fibrous kraft paper grain, visible pulp strands and subtle creases`
- 叶脉：`delicate leaf veins branching like a fine network, translucent membrane`
- 年轮：`concentric tree rings with fine annual grain lines`
- 液态树脂：`glossy swirling liquid resin, slow flowing translucent folds`

色系跟着物品气质走（单色）。完整材质/色系库另见 `open1v-openai-cover` 实物模板。

### 分类默认指引（选物的方向参考，不是硬规则）

| 分类 | 气质 | 选物方向 | 色系方向 |
|------|------|----------|----------|
| quickstart 入门 | 清爽、起点、可信 | 纸/纤维、陶瓷等干净材质 | 冷色：蓝、绿 |
| cases 实战 | 真实、hands-on | 按场景：木纹/皮革/牛皮纸/针织 | 暖色为主，随内容 |
| advanced 进阶 | 精密、高级、科技 | 碳纤维、金属、树脂、化妆品粉末 | 深色：黑、紫、金、绯红 |

### 现有 13 篇参照（重做/新增时对齐）

| slug | 物品 · 色系 |
|------|-------------|
| getting-started | 纸纤维 · 钴蓝 |
| channels-weixin-launch-announcement | 陶瓷 · 微信绿 |
| thinks-like-a-programmer | 磨砂石球 · 石墨黑 |
| coding-development-practices | 碳纤维 · 翠绿 |
| how-to-use-qwencode-cowork | 木纹 · 琥珀橙 |
| how-to-use-qwencode-insight | 液态树脂 · 深紫 |
| obsidian | 牛皮纸 · 牛皮棕（知识管理隐喻） |
| qwencode-bailian-skill-openai-cover-gen | 丝绸 · 薰衣草紫 |
| qwencode-coding-plan-guide-build-website | 黑板 · 黑板绿 |
| qwencode-for-university-students | 针织羊毛 · 暖橙 |
| feat-skills-oss-styles | 玻璃镜头+金属 · 深靛蓝 |
| qwencode-bailian-ai-marketing | 化妆品粉末 · 绯红 |
| qwencode-mpcover-skill-guide | 釉面陶瓷 · 玫瑰粉 |

## 周报：晕染

提示词模板（**构图必填**，否则模型默认全出对角）：

```
Abstract soft gradient (2.35:1 ultra-wide), monochromatic [色系] color scheme, single hue only.
[构图]. [一个质感词] texture.
Subtle tonal variation from [浅] to [深] of the same hue, soft blending.
Purely abstract, no hard edges, no recognizable objects, no multiple colors.
Minimal color palette, clean, calm, atmospheric.
Absolutely no text, no writing, no letters, no watermark, no logo anywhere.
```

8 种构图（每期选不同的，轮换；连续 3 期不用同一构图）：

- `Soft light glow emanating from an off-center point, fading outward to the edges`（径向光晕）
- `Horizontal layered washes drifting across the frame in soft bands`（横向水痕）
- `Organic fluid blobs bleeding into each other with no directional flow`（有机流体）
- `Vertical transition settling from top to bottom`（垂直沉降）
- `Diagonal transition flowing from one corner to the opposite`（对角）
- `Ink drops diffusing in still water, soft tendrils spreading outward from multiple points`（墨滴扩散）
- `Marbled swirl pattern with gentle curving veins of lighter tone threading through`（大理石纹）
- `Soft smoke wisps curling and layering with no fixed direction, ethereal and weightless`（烟雾缭绕）

8 种质感词（每期搭配不同构图，避免连续重复）：

- `watercolor diffusion`（水彩晕开）
- `silky smooth`（丝绸顺滑）
- `matte velvet`（哑光丝绒）
- `oil-paint`（厚涂油画）
- `ink wash bleed`（水墨渗透）
- `marbled veining`（大理石脉纹）
- `frosted crystalline`（磨砂结晶）
- `granular sand-like`（颗粒砂感）

**禁花形**：晕染（尤其径向光晕）极易出花朵/花瓣。negative 在通用词之外**额外加** `flower, petals, blossom, botanical, floral, plant, leaves, scribbles`，提示词强调 `purely abstract`。`blooming` 这类词会诱导出花，禁用（径向已改用 `emanating`）。

**每期专属，不重复**：用「8 构图 × 8 质感 × 12+ 色系」凑出唯一组合（色系如 紫/雾蓝/鼠尾草绿/蜜桃/玫瑰/青绿/琥珀金/薰衣草/珊瑚/薄荷/靛蓝/灰紫）。连续 3 期不用同一构图或同一质感。文件名 = 文章 slug（`weekly-update-YYYY-MM-DD.png`）。

## 生图

产物统一输出到技能 `output/` 目录，**命名为文章 slug**（文件名去掉 `.mdx`，如 `obsidian.png`、`weekly-update-2026-07-23.png`）。bl 默认命名 `image_xxx.png`，生成后立即重命名。

```bash
bl image generate \
  --model qwen-image-max \
  --prompt "<模板填好的提示词>" \
  --negative-prompt "<openai-cover 的通用负面提示词>" \
  --size '1344*572' \
  --n 1 --prompt-extend false --watermark false \
  --base-url https://dashscope.aliyuncs.com \
  --out-dir output/

mv output/image_*.png output/<slug>.png   # 重命名为 slug
```

**批量限流**：连续快发会 403/失败，每张间隔 ≥3s 并带重试（周报 22 张尤其注意）。不并行。批量时逐张生成 + 立即重命名，避免多张 `image_*.png` 混淆。

## 挂载

技能只出 PNG，**不动 frontmatter**。手动：上传 PNG 到 CDN（gw.alicdn.com）→ 在文章 frontmatter 加 `image: <cdn url>`。封面语言无关，6 语言同名文章挂同一 CDN 路径。

## 铁律 / 踩过的坑

- **全英文提示词**，不写中文（模型出中文字乱码）。
- **单篇单色**：微距实物一篇只用一个色相，靠明暗出层次；"色系丰富"指跨篇多色，不是一篇多色。
- **防撞色**：相邻文章、与 hero 别用同色相（踩坑：coding-dev 拉丝金属钴蓝撞 hero → 改碳纤维翠绿）。
- **周报别全紫**：全紫被判死板，要多色系轮换。
- **晕染别全对角**：模板只写"从浅到深"时模型默认对角，必须显式指定构图并轮换。
- **晕染禁花形**：径向光晕 + "blooming" 会出花朵，改用 `emanating` 且 negative 加 flower/petals/botanical（踩坑：0203/0320/0507/0611/0716 五期径向构图全出花，重做）。

## 不做的事

- 不做 HTML 叠字 / 浏览器导出（blog 卡片自己渲染标题，封面只要底图）。
- 不在提示词写中文。
- 不自动改 frontmatter（挂载手动）。
- 不并行生图（限流）。
