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

一组结构化的 AI 技能文件，让 Agent 拥有特定领域的工作流能力——封面图生成、写作风格指南、代码规范、复盘模板等。

每个技能是一个独立的 `SKILL.md` 文件，Agent 读取后即可按指令执行。

## 已发布技能

| 技能 | 说明 |
|------|------|
| `open1v-mpcover-gen` | 公众号封面生成（4种视觉风格 + 百炼 CLI 生图） |
| `open1v-code-sop` | 代码开发 SOP 和协作规范 |

更多技能持续发布中。

## 使用方式

### Qwen Code

```bash
# 直接调用技能
/skills open1v-mpcover-gen 帮我做个公众号封面，主题是「xxx」

# 或者直接描述需求，Agent 会自动匹配
帮我做个封面
```

### Claude Code / Cursor

把技能目录复制到 Agent 的 skills 路径（如 `~/.claude/skills/`），或让 Agent 直接读取 `SKILL.md` 文件。

### 一键安装

```bash
git clone https://github.com/joeytoday/open1v-skills.git ~/.agent/skills/open1v-skills
```

## 目录结构

```
open1v-skills/
├── open1v-mpcover-gen/SKILL.md   ← 公众号封面生成
├── open1v-code-sop/SKILL.md      ← 代码开发规范
├── README.md                     ← 本文件
└── README.en.md                  ← English version
```

## 作者

**joeytoday** — [GitHub](https://github.com/joeytoday)

## License

MIT
