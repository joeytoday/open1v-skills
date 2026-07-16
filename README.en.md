# open1v-skills

![GitHub stars](https://img.shields.io/github/stars/joeytoday/open1v-skills?style=flat-square)
![License](https://img.shields.io/github/license/joeytoday/open1v-skills?style=flat-square)
![Skill](https://img.shields.io/badge/Skill-Agent-111111?style=flat-square)
![Qwen Code](https://img.shields.io/badge/Qwen%20Code-Supported-6366f1?style=flat-square)
![Claude Code](https://img.shields.io/badge/Claude%20Code-Supported-6B5B95?style=flat-square)
![Cursor](https://img.shields.io/badge/Cursor-Supported-222222?style=flat-square)

[中文](./README.md)

Personal AI skill collection for Qwen Code / Claude Code / Cursor and other AI agents.

## What's This

A set of structured skills that extend AI agents with specialized workflows — product weekly writing, content generation, and more.

Each skill is a self-contained `SKILL.md` file that AI agents can read and follow as instructions.

## Published Skills

| Skill | Description |
|-------|-------------|
| `open1v-qwencode-weekly` | Qwen Code weekly product update blog (MDX format, includes data collection, source verification, and writing) |
| `open1v-qwencode-translate` | Qwen Code docs multi-language translation (zh→en/de/fr/ja/pt-BR/ru, with style alignment and terminology preservation) |
| `open1v-qwencode-showcases` | Qwen Code Showcase video demo management (5-scenario categories, feature tags, 7-language sync) |
| `open1v-product-visual` | E-commerce product image generation (photo → identify → generate → add text → video), supports Feishu photo-to-image |
| `open1v-product-copy` | Multi-channel product copywriting (WeChat MP / Xiaohongshu / product detail page), with one-click WeChat MP draft publishing |

More skills coming soon.

## Usage

### Install Skills

Tell your AI Agent:

```
Install open1v-skills: git clone https://github.com/joeytoday/open1v-skills.git ~/.agents/skills/open1v-skills, then install dependencies
```

The agent will handle cloning and dependency installation automatically.

### Use Skills

After installation, just talk to your AI agent in natural language:

**Product Image Generation (open1v-product-visual)**:
```
Generate a white-background product photo for this charger
Turn this photo into an e-commerce main image with selling points
Create a 5-second showcase video from this product image
```

**Product Copywriting (open1v-product-copy)**:
```
Write promotional copy for a portable charger — WeChat MP, Xiaohongshu, and product detail page
Publish the WeChat MP article to drafts
```

**Qwen Code Weekly (open1v-qwencode-weekly)**:
```
/skills open1v-qwencode-weekly 0.16.x
/open1v-qwencode-weekly 2026-03-01
```

**Qwen Code Translation (open1v-qwencode-translate)**:
```
翻译周报、translate blog、translate weekly
```

**Qwen Code Showcases (open1v-qwencode-showcases)**:
```
添加 showcase、add showcase、新增演示
```

### Manual Install

If you prefer manual setup:

```bash
# Clone to local skills directory
git clone https://github.com/joeytoday/open1v-skills.git ~/.agents/skills/open1v-skills

# Install Node dependencies for skills that need them
cd ~/.agents/skills/open1v-skills/open1v-product-visual && npm install
cd ~/.agents/skills/open1v-skills/open1v-product-copy && npm install
```

Claude Code / Cursor users can also copy the skill directory to their agent's skill path (e.g. `~/.claude/skills/`).

## Structure

```
open1v-skills/
├── open1v-qwencode-weekly/SKILL.md     ← Qwen Code weekly writing
├── open1v-qwencode-translate/SKILL.md  ← Qwen Code multi-language translation
├── open1v-qwencode-showcases/SKILL.md  ← Qwen Code Showcase management
├── open1v-product-visual/              ← E-commerce product image & video
│   ├── SKILL.md
│   ├── assets/template.html            ← 4-layout HTML template
│   ├── scripts/render.cjs              ← Playwright @2x render script
│   └── package.json
├── open1v-product-copy/                ← Product copywriting & WeChat MP publishing
│   ├── SKILL.md
│   ├── assets/product-post.css         ← Magazine-style CSS theme
│   ├── scripts/publish.mjs             ← WeChat MP publish script
│   └── package.json
├── README.md                           ← 中文版
└── README.en.md                        ← This file
```

## Author

**joeytoday** — [GitHub](https://github.com/joeytoday)

## License

AGPL-3.0
