# open1v-skills

<div align="center">

![GitHub stars](https://img.shields.io/github/stars/joeytoday/open1v-skills?style=for-the-badge&logo=github)
![License](https://img.shields.io/github/license/joeytoday/open1v-skills?style=for-the-badge&color=blue)
![Skills](https://img.shields.io/badge/Skills-6-6366f1?style=for-the-badge)

**个人 AI 技能集合** · 适配 Qwen Code / Claude Code / Cursor 等 AI Agent 环境

[English](./README.en.md)

</div>

---

## 📖 这是什么

一组结构化的 **AI 技能文件**，让 Agent 拥有特定领域的工作流能力——产品文案写作、封面图生成、需求澄清、多语言翻译等。

每个技能是一个独立的 `SKILL.md` 文件，Agent 读取后即可按指令执行，无需额外配置。

## ✨ 已发布技能

### 🎨 视觉与内容生成

| 技能 | 说明 | 触发词 |
|------|------|--------|
| [`open1v-product-visual`](./open1v-product-visual/) | 一站式电商商品图生成（拍照→识别→生图→叠文字→视频），支持飞书拍照出图 | 商品图、产品图、主图、白底图、促销图、商品视频 |
| [`open1v-mpcover-gen`](./open1v-mpcover-gen/) | 公众号封面图生成（大字报/杂志/Claude极简/像素风格），百炼 CLI 出图 | 公众号封面、封面生成、cover、生成封面 |
| [`open1v-product-copy`](./open1v-product-copy/) | 多渠道产品推广文案（公众号/小红书/详情页），支持一键发布公众号草稿箱 | 写文案、推广文案、产品介绍、营销文案、发布公众号 |

### 📝 文档与写作

| 技能 | 说明 | 触发词 |
|------|------|--------|
| [`open1v-qwencode-weekly`](./open1v-qwencode-weekly/) | Qwen Code 每周产品更新博客（MDX 格式，含数据收集、源码验证、正文写作全流程） | 写周报、qwencode 周报、产品更新、版本发布说明 |
| [`open1v-qwencode-docs-trans`](./open1v-qwencode-docs-trans/) | Qwen Code 文档站博客/周报多语言翻译（中文→en/de/fr/ja/pt-BR/ru） | 翻译周报、翻译博客、多语言翻译、translate blog |
| [`open1v-qwencode-showcases`](./open1v-qwencode-showcases/) | Qwen Code Showcase 视频演示管理（5场景分类、功能标签、7语言同步） | 添加 showcase、新增演示、showcase 添加 |

### 🤔 思考与决策

| 技能 | 说明 | 触发词 |
|------|------|--------|
| [`open1v-qa-before-start`](./open1v-qa-before-start/) | 苏格拉底式需求澄清（六维提问法帮用户明确真实意图、边界、优先级和成功标准） | qa-before-start、需求澄清、帮我想清楚、先问问我 |

> 💡 **更多技能持续发布中**，欢迎 Star ⭐ 关注更新

## 🚀 使用方式

### 方式一：自动安装（推荐）

对你的 AI Agent 说：

```bash
帮我安装 open1v-skills 技能包：git clone https://github.com/joeytoday/open1v-skills.git ~/.agents/skills/open1v-skills，然后安装依赖
```

Agent 会自动完成克隆和依赖安装。

### 方式二：手动安装

```bash
# 克隆到本地技能目录
git clone https://github.com/joeytoday/open1v-skills.git ~/.agents/skills/open1v-skills

# 安装有 Node 依赖的技能
cd ~/.agents/skills/open1v-skills/open1v-product-visual && npm install
cd ~/.agents/skills/open1v-skills/open1v-product-copy && npm install
cd ~/.agents/skills/open1v-skills/open1v-mpcover-gen && npm install
```

Claude Code / Cursor 用户也可以把技能目录复制到 Agent 的 skills 路径（如 `~/.claude/skills/`）。

### 使用技能

安装后，直接对 AI Agent 说自然语言即可触发：

**📸 商品图生成**：
```
帮我生成一张充电宝的白底商品图
帮我把这张照片做成电商主图，加上卖点文字
用这张商品图做一个 5 秒展示视频
```

**🎨 封面图生成**：
```
帮我做个公众号封面，杂志风格
生成一个大字报风格的封面图
```

**✍️ 产品推广文案**：
```
帮我写一篇充电宝的推广文案，渠道：公众号、小红书、详情页
把公众号文案发布到草稿箱
```

**📰 Qwen Code 周报**：
```
/skills open1v-qwencode-weekly 0.16.x
/open1v-qwencode-weekly 2026-03-01
```

**🌍 多语言翻译**：
```
翻译周报、translate blog、多语言翻译
```

**🎬 Showcase 管理**：
```
添加 showcase、新增演示、showcase 添加
```

**🤔 需求澄清**：
```
帮我想清楚这个需求、先问问我、qa-before-start
```

## 📁 目录结构

```
open1v-skills/
├── open1v-product-visual/              ← 电商商品图 & 视频生成
│   ├── SKILL.md
│   ├── assets/template.html            ← 4 种布局的 HTML 模板
│   ├── scripts/render.cjs              ← Playwright @2x 渲染脚本
│   └── package.json
├── open1v-mpcover-gen/                 ← 公众号封面图生成
│   ├── SKILL.md
│   └── package.json
├── open1v-product-copy/                ← 产品推广文案 & 公众号发布
│   ├── SKILL.md
│   ├── assets/product-post.css         ← 杂志风格排版 CSS
│   ├── scripts/publish.mjs             ← 公众号发布脚本
│   └── package.json
├── open1v-qwencode-weekly/             ← Qwen Code 周报写作
│   └── SKILL.md
├── open1v-qwencode-docs-trans/         ← Qwen Code 多语言翻译
│   └── SKILL.md
├── open1v-qwencode-showcases/          ← Qwen Code Showcase 管理
│   └── SKILL.md
├── open1v-qa-before-start/             ← 苏格拉底式需求澄清
│   └── SKILL.md
├── README.md                           ← 中文版
└── README.en.md                        ← English version
```

## 👤 作者

**joeytoday** — [GitHub](https://github.com/joeytoday)

## 📄 License

AGPL-3.0
