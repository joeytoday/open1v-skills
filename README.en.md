# open1v-skills

<div align="center">

![GitHub stars](https://img.shields.io/github/stars/joeytoday/open1v-skills?style=for-the-badge&logo=github)
![License](https://img.shields.io/github/license/joeytoday/open1v-skills?style=for-the-badge&color=blue)
![Skills](https://img.shields.io/badge/Skills-6-6366f1?style=for-the-badge)

**Personal AI Skill Collection** · For Qwen Code / Claude Code / Cursor and other AI agents

[中文](./README.md)

</div>

---

## 📖 What's This

A set of structured **AI skill files** that extend AI agents with specialized workflows — product copywriting, cover image generation, requirement clarification, multi-language translation, and more.

Each skill is a self-contained `SKILL.md` file that AI agents can read and follow as instructions, with no additional configuration needed.

## ✨ Published Skills

### 🎨 Visual & Content Generation

| Skill | Description | Triggers |
|-------|-------------|----------|
| [`open1v-product-visual`](./open1v-product-visual/) | E-commerce product image generation (photo → identify → generate → add text → video), supports Feishu photo-to-image | product image, main image, white background, promo image, product video |
| [`open1v-mpcover-gen`](./open1v-mpcover-gen/) | WeChat MP cover image generation (headline/magazine/Claude minimal/pixel styles), powered by Bailian CLI | cover, generate cover, 公众号封面 |
| [`open1v-openai-cover`](./open1v-openai-cover/) | OpenAI-style WeChat MP cover (material/gradient/light/watercolor styles), supports color scheme and multi-ratio canvas | OpenAI cover, material cover, gradient cover, light cover, watercolor cover |
| [`open1v-product-copy`](./open1v-product-copy/) | Multi-channel product copywriting (WeChat MP / Xiaohongshu / product detail page), with one-click WeChat MP draft publishing | write copy, promotional copy, product intro, marketing copy, publish to WeChat MP |

### 📝 Documentation & Writing

| Skill | Description | Triggers |
|-------|-------------|----------|
| [`open1v-qwencode-weekly`](./open1v-qwencode-weekly/) | Qwen Code weekly product update blog (MDX format, includes data collection, source verification, and writing workflow) | weekly report, qwencode weekly, product update, release notes |
| [`open1v-qwencode-docs-trans`](./open1v-qwencode-docs-trans/) | Qwen Code docs blog/weekly multi-language translation (zh→en/de/fr/ja/pt-BR/ru) | translate blog, translate weekly, multi-language translation |
| [`open1v-qwencode-showcases`](./open1v-qwencode-showcases/) | Qwen Code Showcase video demo management (5-scenario categories, feature tags, 7-language sync) | add showcase, new demo, showcase |

### 🤔 Thinking & Decision Making

| Skill | Description | Triggers |
|-------|-------------|----------|
| [`open1v-qa-before-start`](./open1v-qa-before-start/) | Socratic requirement clarification (6-dimension questioning to help users clarify true intent, boundaries, priorities, and success criteria) | qa-before-start, clarify requirements, help me think through this |

> 💡 **More skills coming soon**, Star ⭐ to stay updated

## 🚀 Usage

### Option 1: Auto Install (Recommended)

Tell your AI Agent:

```bash
Install open1v-skills: git clone https://github.com/joeytoday/open1v-skills.git ~/.agents/skills/open1v-skills, then install dependencies
```

The agent will handle cloning and dependency installation automatically.

### Option 2: Manual Install

```bash
# Clone to local skills directory
git clone https://github.com/joeytoday/open1v-skills.git ~/.agents/skills/open1v-skills

# Install Node dependencies for skills that need them
cd ~/.agents/skills/open1v-skills/open1v-product-visual && npm install
cd ~/.agents/skills/open1v-skills/open1v-product-copy && npm install
cd ~/.agents/skills/open1v-skills/open1v-mpcover-gen && npm install
```

Claude Code / Cursor users can also copy the skill directory to their agent's skill path (e.g. `~/.claude/skills/`).

### Using Skills

After installation, just talk to your AI agent in natural language:

**📸 Product Image Generation**:
```
Generate a white-background product photo for this charger
Turn this photo into an e-commerce main image with selling points
Create a 5-second showcase video from this product image
```

**🎨 Cover Image Generation**:
```
Create a magazine-style WeChat MP cover
Generate a headline-style cover image
```

**✍️ Product Copywriting**:
```
Write promotional copy for a portable charger — WeChat MP, Xiaohongshu, and product detail page
Publish the WeChat MP article to drafts
```

**📰 Qwen Code Weekly**:
```
/skills open1v-qwencode-weekly 0.16.x
/open1v-qwencode-weekly 2026-03-01
```

**🌍 Multi-language Translation**:
```
translate blog, translate weekly, multi-language translation
```

**🎬 Showcase Management**:
```
add showcase, new demo, showcase
```

**🤔 Requirement Clarification**:
```
help me think through this, clarify requirements, qa-before-start
```

## 📁 Structure

```
open1v-skills/
├── open1v-product-visual/              ← E-commerce product image & video
│   ├── SKILL.md
│   ├── assets/template.html            ← 4-layout HTML template
│   ├── scripts/render.cjs              ← Playwright @2x render script
│   └── package.json
├── open1v-mpcover-gen/                 ← WeChat MP cover image generation
│   ├── SKILL.md
│   └── package.json
├── open1v-openai-cover/                ← OpenAI-style cover image generation
│   ├── SKILL.md
│   ├── assets/template.html            ← HTML template
│   └── scripts/build.cjs               ← Build script
├── open1v-product-copy/                ← Product copywriting & WeChat MP publishing
│   ├── SKILL.md
│   ├── assets/product-post.css         ← Magazine-style CSS theme
│   ├── scripts/publish.mjs             ← WeChat MP publish script
│   └── package.json
├── open1v-qwencode-weekly/             ← Qwen Code weekly writing
│   └── SKILL.md
├── open1v-qwencode-docs-trans/         ← Qwen Code multi-language translation
│   └── SKILL.md
├── open1v-qwencode-showcases/          ← Qwen Code Showcase management
│   └── SKILL.md
├── open1v-qa-before-start/             ← Socratic requirement clarification
│   └── SKILL.md
├── README.md                           ← 中文版
└── README.en.md                        ← This file
```

## 👤 Author

**joeytoday** — [GitHub](https://github.com/joeytoday)

## 📄 License

AGPL-3.0
