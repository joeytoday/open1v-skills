# open1v-skills

Personal AI skill collection for Qwen Code / Claude Code / Cursor and other AI agents.

## What's This

A set of structured skills that extend AI agents with specialized workflows — cover image generation, writing style guides, code review standards, weekly reviews, and more.

Each skill is a self-contained `SKILL.md` file that AI agents can read and follow as instructions.

## Skills

| Skill | Description |
|-------|-------------|
| `open1v-mpcover-gen` | WeChat Official Account cover generation (4 visual styles + Bailian CLI) |
| `open1v-write` | Blog writing in joey's personal style |
| `open1v-work-write` | Professional/work writing style |
| `open1v-code-sop` | Code development SOP and conventions |
| `open1v-skills-manage` | Skills library management rules |
| `open1v-weekly-review` | Weekly review template and workflow |
| `open1v-monthly-review` | Monthly review template and workflow |
| `open1v-counselor` | Self-reflection and coaching prompts |
| `open1v-ai-rules` | AI operation safety rules for this vault |
| `open1v-qwencode-post` | Personal blog posts about Qwen Code |
| `open1v-qa-before-start` | Pre-task Q&A checklist |
| `open1v-dingtalks` | DingTalk message drafting |
| `qwencode-*` | Qwen Code product-related skills |

## Usage

### With Qwen Code

```bash
# Call a skill directly
/skills open1v-mpcover-gen 帮我做个公众号封面，主题是「xxx」

# Or just describe what you need — the agent will match the right skill
帮我写一篇博客
```

### With Other Agents

Copy the skill directory to your agent's skill path (e.g. `~/.claude/skills/`) or point the agent to read the `SKILL.md` file directly.

## Structure

```
open1v-skills/
├── open1v-mpcover-gen/SKILL.md   ← Cover image generation
├── open1v-write/SKILL.md         ← Blog writing style
├── open1v-code-sop/SKILL.md      ← Dev conventions
├── ...
└── README.md                     ← This file
```

## Author

**joeytoday** — [GitHub](https://github.com/joeytoday)

## License

MIT
