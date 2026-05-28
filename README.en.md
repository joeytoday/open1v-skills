# open1v-skills

[中文](./README.md)

Personal AI skill collection for Qwen Code / Claude Code / Cursor and other AI agents.

## What's This

A set of structured skills that extend AI agents with specialized workflows — cover image generation, writing style guides, code review standards, and more.

Each skill is a self-contained `SKILL.md` file that AI agents can read and follow as instructions.

## Published Skills

| Skill | Description |
|-------|-------------|
| `open1v-mpcover-gen` | WeChat Official Account cover generation (4 visual styles + Bailian CLI) |
| `open1v-code-sop` | Code development SOP and conventions |

More skills coming soon.

## Usage

### With Qwen Code

```bash
# Call a skill directly
/skills open1v-mpcover-gen Generate a cover for my article about "xxx"

# Or just describe what you need — the agent will match the right skill
Make me a cover image
```

### With Claude Code / Cursor

Copy the skill directory to your agent's skill path (e.g. `~/.claude/skills/`) or point the agent to read the `SKILL.md` file directly.

### Quick Install

```bash
git clone https://github.com/joeytoday/open1v-skills.git ~/.agent/skills/open1v-skills
```

## Structure

```
open1v-skills/
├── open1v-mpcover-gen/SKILL.md   ← Cover image generation
├── open1v-code-sop/SKILL.md      ← Dev conventions
├── README.md                     ← 中文版
└── README.en.md                  ← This file
```

## Author

**joeytoday** — [GitHub](https://github.com/joeytoday)

## License

MIT
