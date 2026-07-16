# open1v-skills

![GitHub stars](https://img.shields.io/github/stars/joeytoday/open1v-skills?style=flat-square)
![License](https://img.shields.io/github/license/joeytoday/open1v-skills?style=flat-square)
![Skill](https://img.shields.io/badge/Skill-Agent-111111?style=flat-square)
![Qwen Code](https://img.shields.io/badge/Qwen%20Code-Supported-6366f1?style=flat-square)
![Claude Code](https://img.shields.io/badge/Claude%20Code-Supported-6B5B95?style=flat-square)
![Cursor](https://img.shields.io/badge/Cursor-Supported-222222?style=flat-square)

[English](./README.en.md)

个人 AI 技能集合，适配 Qwen Code / Claude Code / Cursor 等 AI Agent 环境。

## 这是什么

一组结构化的 AI 技能文件，让 Agent 拥有特定领域的工作流能力——产品周报写作、内容生成等。

每个技能是一个独立的 `SKILL.md` 文件，Agent 读取后即可按指令执行。

## 已发布技能

| 技能 | 说明 |
|------|------|
| `open1v-qwencode-weekly` | Qwen Code 每周产品更新博客（MDX 格式，含数据收集、源码验证、正文写作全流程） |
| `open1v-qwencode-translate` | Qwen Code 文档站多语言翻译（中文→en/de/fr/ja/pt-BR/ru，含风格对齐、术语保留规范） |
| `open1v-qwencode-showcases` | Qwen Code Showcase 视频演示管理（5场景分类、功能标签、7语言同步） |
| `open1v-product-visual` | 一站式电商商品图生成（拍照→识别→生图→叠文字→视频），支持飞书拍照出图 |
| `open1v-product-copy` | 多渠道产品推广文案（公众号/小红书/详情页），支持一键发布公众号草稿箱 |

更多技能持续发布中。

## 使用方式

### 安装技能

对你的 AI Agent 说：

```
帮我安装 open1v-skills 技能包：git clone https://github.com/joeytoday/open1v-skills.git ~/.agents/skills/open1v-skills，然后安装依赖
```

Agent 会自动完成克隆和依赖安装。

### 使用技能

安装后，直接对 AI Agent 说自然语言即可触发：

**商品图生成（open1v-product-visual）**：
```
帮我生成一张充电宝的白底商品图
帮我把这张照片做成电商主图，加上卖点文字
用这张商品图做一个 5 秒展示视频
```

**产品推广文案（open1v-product-copy）**：
```
帮我写一篇充电宝的推广文案，渠道：公众号、小红书、详情页
把公众号文案发布到草稿箱
```

**Qwen Code 周报（open1v-qwencode-weekly）**：
```
/skills open1v-qwencode-weekly 0.16.x
/open1v-qwencode-weekly 2026-03-01
```

**Qwen Code 多语言翻译（open1v-qwencode-translate）**：
```
翻译周报、translate blog、多语言翻译
```

**Qwen Code Showcase 管理（open1v-qwencode-showcases）**：
```
添加 showcase、新增演示、showcase 添加
```

### 手动安装

如果你更习惯手动操作：

```bash
# 克隆到本地技能目录
git clone https://github.com/joeytoday/open1v-skills.git ~/.agents/skills/open1v-skills

# 安装有 Node 依赖的技能
cd ~/.agents/skills/open1v-skills/open1v-product-visual && npm install
cd ~/.agents/skills/open1v-skills/open1v-product-copy && npm install
```

Claude Code / Cursor 用户也可以把技能目录复制到 Agent 的 skills 路径（如 `~/.claude/skills/`）。

## 目录结构

```
open1v-skills/
├── open1v-qwencode-weekly/SKILL.md     ← Qwen Code 周报写作
├── open1v-qwencode-translate/SKILL.md  ← Qwen Code 多语言翻译
├── open1v-qwencode-showcases/SKILL.md  ← Qwen Code Showcase 管理
├── open1v-product-visual/              ← 电商商品图 & 视频生成
│   ├── SKILL.md
│   ├── assets/template.html            ← 4 种布局的 HTML 模板
│   ├── scripts/render.cjs              ← Playwright @2x 渲染脚本
│   └── package.json
├── open1v-product-copy/                ← 产品推广文案 & 公众号发布
│   ├── SKILL.md
│   ├── assets/product-post.css         ← 杂志风格排版 CSS
│   ├── scripts/publish.mjs             ← 公众号发布脚本
│   └── package.json
├── README.md                           ← 本文件
└── README.en.md                        ← English version
```

## 作者

**joeytoday** — [GitHub](https://github.com/joeytoday)

## License

AGPL-3.0
