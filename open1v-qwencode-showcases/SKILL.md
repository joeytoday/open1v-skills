---
name: open1v-qwencode-showcases
description: 向 Qwen Code 文档站添加新的 showcase 视频演示。从周报或功能说明中提取演示内容，按5个工作场景分类、功能标签标注，添加到中文版 showcase index 文件，然后翻译成6种语言版本。触发词：添加 showcase、新增演示、showcase 添加、qwencode showcase、视频演示添加。
author: joeytoday
version: 2.1
created: 2026-06-22
updated: 2026-07-03
---

# Qwen Code Showcase 添加流程

## 适用场景

当有新的 Qwen Code 功能发布（如周报中的新功能）时，需要将这些功能的视频演示添加到文档站的 showcase 页面，让用户可以通过观看视频快速了解功能用法。

## 前置条件

- 已准备好演示的视频 URL 或缩略图 URL
- 已从周报或功能说明中提取了完整的演示信息（标题、描述、步骤等）
- 确认要添加的演示数量和顺序

## 分类与标签体系

### category 字段——5个工作场景

每个 showcase 条目必须归入以下5个场景之一：

| 场景 | 说明 | 典型条目 |
|------|------|---------|
| **入门起步** | 安装、配置、第一次对话、基础操作 | 脚本安装、API配置、首次对话、会话恢复 |
| **项目开发** | 编码、调试、重构、代码审查、项目探索 | Agent模式编码、LSP感知、PR Review、解决Issue、Plan模式 |
| **团队协作** | 多Agent协作、PR/Issue、Git操作、Arena | Arena模式、Worktree、子Agent、规则配置 |
| **办公效率** | 日常自动化、文件处理、数据看板、终端优化 | 周报生成、文件整理、压缩优化、Hooks、Channels |
| **创意设计** | 视频创作、网站搭建、论文阅读、图片生成 | Remotion视频、网站克隆、论文阅读、MCP图片生成 |

**选择原则**：按用户使用场景归类，而非按功能本身归类。例如 `/fork` 命令在项目开发场景下使用 → category 为"项目开发"，而非按功能归类为"Agent模式"。

### features 字段——功能标签

每个条目标注1-3个功能标签，从以下标签池中选择：

| 类别 | 标签 | 说明 |
|------|------|------|
| **核心模式** | Agent模式 | Agent对话模式 |
| | Plan模式 | Plan规划模式 |
| | Arena | Arena竞技模式 |
| **集成能力** | Skills | Skills技能扩展 |
| | MCP | MCP协议集成 |
| | Web Search | 网络搜索能力 |
| | LSP | 语言服务协议 |
| | Computer Use | 桌面自动化操作 |
| | Channels | 频道集成（飞书等） |
| | 图片识别 | 图片/截图识别 |
| **协作工具** | GitHub | GitHub PR/Issue操作 |
| | Git | Git分支/差异操作 |
| | Hooks | Hooks自动化钩子 |
| **交互体验** | 终端操作 | 终端界面相关功能 |
| | VSCode | VSCode集成相关 |
| | Explore | Explore探索模式 |
| | Insight | Insight洞察分析 |

**选择原则**：标注该条目**核心依赖**的功能，而非所有提及的功能。最多3个标签。

## 执行流程

### 第一步：在中文版添加演示条目

1. **读取源文件**
   - 读取 `website/content/zh/showcase/index.mdx` 文件
   - 找到 `showcaseItems` 数组的末尾位置（在 `];` 之前）

2. **准备演示数据**
   每个演示条目必须包含以下字段：
   ```typescript
   {
     id: "唯一标识符（小写+连字符）",
     title: "演示标题",
     description: "简短描述（一句话）",
     category: "工作场景分类（入门起步/项目开发/团队协作/办公效率/创意设计）",
     features: ["功能标签（从标签池中选择，最多3个）"],
     thumbnail: "缩略图 URL",
     videoUrl: "视频 URL 或 null",
     model: "使用的模型（如 qwen3.6-plus）",
     overview: "详细概述段落",
     steps: [
       { title: "步骤标题", description: "步骤描述", command: "可选的命令示例" },
       // ... 更多步骤
     ],
   }
   ```

3. **添加新条目**
   - 在 `showcaseItems` 数组的 `];` 之前添加新的演示条目
   - 使用 `file_replace` 工具进行精确替换
   - 确保 JSON 格式正确（逗号、括号匹配）
   - 如果添加多个演示，可以用注释分组（如 `// === 6月11日周报演示 ===`）

4. **验证格式**
   - 检查是否有语法错误（多余的逗号、缺失的括号等）
   - 确保所有字符串都正确转义
   - 确认 `videoUrl` 为 `null` 时没有引号
   - **重点检查 category 和 features 引号**：确保 `category: "项目开发"` 无多余引号（之前出现过 `"项目开发""` 的bug）

### 第二步：等待用户确认

- 告知用户已在中文版添加了哪些演示
- 列出新增的演示 ID、标题、category 和 features
- 等待用户确认内容正确后再继续翻译

### 第三步：翻译成其他语言（用户确认后执行）

根据 `qwencode-translate` skill 的规则，将新增的演示翻译成以下语言：

**目标语言**：en、de、fr、ja、pt-BR、ru

**翻译规则**：
- 保持 frontmatter 结构不变
- 保持 import 语句不变
- 保持 JSX 组件标签及其属性名不变（如 `<VideoShowcaseIndex>`）
- 保持图片 URL、视频 URL 不变
- 保持 PR 链接、GitHub 链接不变
- 保持代码块中的代码不变
- 保持命令名不变（如 `/fork`、`/stats`、`/compress-fast`）

**需要翻译的内容**：
- `title` 字段值
- `description` 字段值
- `overview` 字段值
- `steps` 数组中的 `title` 和 `description`
- `category` 字段值（翻译为对应语言的工作场景名称）
- `features` 数组中的文本（翻译为对应语言的功能标签名）

**category 翻译对照表**：

| zh | en | de | fr | ja | pt-BR | ru |
|----|----|----|----|----|-------|----|
| 入门起步 | Getting Started | Erste Schritte | Démarrage | 入門起步 | Primeiros Passos | Начало работы |
| 项目开发 | Project Development | Projektentwicklung | Développement de projet | プロジェクト開発 | Desenvolvimento de Projeto | Разработка проектов |
| 团队协作 | Team Collaboration | Teamzusammenarbeit | Collaboration d'équipe | チーム協働 | Colaboração em Equipe | Совместная работа |
| 办公效率 | Office Efficiency | Office-Effizienz | Efficacité bureautique | オフィス効率 | Eficiência no Trabalho | Эффективность работы |
| 创意设计 | Creative Design | Kreatives Design | Design créatif | クリエイティブデザイン | Design Criativo | Творческий дизайн |

**features 翻译对照表**：

| zh | en | de | fr | ja | pt-BR | ru |
|----|----|----|----|----|-------|----|
| Agent模式 | Agent Mode | Agent-Modus | Mode Agent | Agentモード | Modo Agent | Режим Agent |
| Plan模式 | Plan Mode | Plan-Modus | Mode Plan | Planモード | Modo Plan | Режим Plan |
| Arena | Arena | Arena | Arena | Arena | Arena | Arena |
| Skills | Skills | Skills | Skills | Skills | Skills | Skills |
| MCP | MCP | MCP | MCP | MCP | MCP | MCP |
| Web Search | Web Search | Web Search | Recherche Web | Web Search | Busca Web | Веб-поиск |
| LSP | LSP | LSP | LSP | LSP | LSP | LSP |
| Computer Use | Computer Use | Computer Use | Computer Use | Computer Use | Computer Use | Computer Use |
| Channels | Channels | Channels | Channels | Channels | Canais | Каналы |
| 图片识别 | Image Recognition | Bilderkennung | Reconnaissance d'image | 画像認識 | Reconhecimento de Imagem | Распознавание изображений |
| GitHub | GitHub | GitHub | GitHub | GitHub | GitHub | GitHub |
| Git | Git | Git | Git | Git | Git | Git |
| Hooks | Hooks | Hooks | Hooks | Hooks | Hooks | Hooks |
| 终端操作 | Terminal | Terminal | Terminal | Terminal | Terminal | Terminal |
| 语音输入 | Voice Input | Spracheingabe | Saisie vocale | 音声入力 | Entrada de Voz | Голосовой ввод |
| Token 统计 | Token Stats | Token-Statistik | Statistiques Token | Token 統計 | Estatísticas de Token | Статистика Token |
| Workflows | Workflows | Workflows | Workflows | Workflows | Workflows | Workflows |
| Artifact | Artifact | Artifact | Artifact | Artifact | Artifact | Artifact |
| Vision Bridge | Vision Bridge | Vision Bridge | Vision Bridge | Vision Bridge | Vision Bridge | Vision Bridge |
| VSCode | VSCode | VSCode | VSCode | VSCode | VSCode | VSCode |
| Explore | Explore | Explore | Explore | Explore | Explore | Explore |
| Insight | Insight | Insight | Insight | Insight | Insight | Insight |

**翻译风格**：
- 技术术语保持英文原文（如 Agent、Token、MCP、CLI）
- 产品名称不翻译（Qwen Code、Claude Code）
- 命令名不翻译（`/fork`、`/loop`、`/cd`）
- 语气自然流畅，避免翻译腔

**输出路径**：
- 英文：`website/content/en/showcase/index.mdx`
- 德语：`website/content/de/showcase/index.mdx`
- 法语：`website/content/fr/showcase/index.mdx`
- 日语：`website/content/ja/showcase/index.mdx`
- 葡萄牙语-巴西：`website/content/pt-BR/showcase/index.mdx`
- 俄语：`website/content/ru/showcase/index.mdx`

### 第四步：验证和提交

1. **验证构建**（可选）
   - 运行 `npm run build` 确保无报错
   - 或在开发环境中预览效果

2. **提交规范**（等待用户明确指示后执行）
   - commit message：`feat: add new showcases in 7 languages (zh, en, de, fr, ja, pt-BR, ru)`
   - PR title：`feat: add new Qwen Code showcases (7 languages)`
   - base branch：main

## 注意事项

1. **只修改 index 文件**：本 skill 仅涉及在 `index.mdx` 文件中添加演示条目，不涉及创建单独的 showcase 页面
2. **先中文后翻译**：必须先在中文版添加并得到用户确认后，才能翻译成其他语言
3. **保持结构一致**：新增的演示条目必须与现有条目的结构完全一致
4. **ID 唯一性**：确保每个演示的 `id` 字段在整个 `showcaseItems` 数组中唯一
5. **分类必须从5个场景中选择**：category 只能是入门起步、项目开发、团队协作、办公效率、创意设计之一，不可使用其他分类名
6. **features 最多3个标签**：从标签池中选择，标注核心依赖的功能
7. **警惕引号bug**：category 字段容易出现多余引号（如 `"项目开发""`），添加后务必检查
8. **删除 backup 文件**：webpack 会扫描 content/ 目录下所有 .mdx 文件，包括 backup 文件，必须删除所有 .mdx.backup.* 文件避免 ModuleParseError
9. **未经明确指示不得提交**：遵循用户的 git 操作约束，完成翻译后等待用户明确指示再执行 commit/push/pr create

## 示例

假设要从周报中添加一个关于 `/fork` 命令的演示：

```typescript
{
  id: "feature-fork-background-agent",
  title: "/fork 后台派活不等待",
  description: "在对话中途派一个后台 Agent 去干别的事，继承完整上下文、工具、模型配置，主对话继续工作，fork 跑完通过后台任务面板通知。",
  category: "项目开发",
  features: ["Agent模式"],
  thumbnail: "https://gw.alicdn.com/imgextra/i2/O1CN01yA16EU24E1OlX7QBZ_!!6000000007358-2-tps-3839-2160.png",
  videoUrl: null,
  model: "qwen3.6-plus",
  overview: "以前想让 AI 同时做两件事，要么开新对话丢失上下文，要么等当前任务完成。现在用 `/fork` 命令，可以在对话中途派生一个后台 Agent 去执行其他任务...",
  steps: [
    { title: "输入 /fork 命令", description: "在对话中输入 `/fork` 加上要执行的任务描述。", command: "/fork 帮我把这个模块的测试补上" },
    { title: "继续主对话", description: "主对话不阻塞，你可以继续做其他事情，不需要等待 fork 任务完成。" },
    { title: "查看结果", description: "fork 任务完成后，通过后台任务面板查看结果和通知。" },
  ],
},
```

category 选择"项目开发"（因为在开发场景下使用 `/fork`），features 选择 `["Agent模式"]`（核心依赖是 Agent 模式）。

然后按照翻译对照表将 category 和 features 翻译成其他语言版本。
