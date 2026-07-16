---
name: open1v-qwencode-docs-trans
description: Qwen Code 文档站博客/周报多语言翻译。包含翻译规范和并行执行流程。触发词：翻译周报、翻译博客、多语言翻译、translate blog、translate weekly、docs trans。
author: joeytoday
version: 2.0
created: 2026-05-22
updated: 2026-07-15
published: true
---

# Qwen Code 博客多语言翻译

> 写作风格遵循 SOUL

## 翻译配置

- **源语言**：zh（中文为实际写作语言）
- **目标语言**：en、de、fr、ja、pt-BR、ru
- **源文件路径**：`website/content/zh/blog/{filename}.mdx`
- **输出路径**：`website/content/{lang}/blog/{filename}.mdx`

## 翻译规则

### 保持不变的内容

- frontmatter 结构（`---` 包裹的 YAML）
- import 语句、JSX 组件标签及其属性名
- 图片/视频 URL、PR/GitHub 链接
- 代码块、命令、Markdown 表格结构
- tags 数组

### 需要翻译的内容

- frontmatter 中的 `title`、`description`
- `<BlogPostHeader>` 的 `title` 属性值
- 正文段落、标题、列表项、表格文本、`<Callout>` 文本
- 贡献者表格的"贡献内容"列

### 翻译风格

- 技术术语保持英文（Agent、Token、Worktree、MCP、prompt cache）
- 产品名称不翻译（Qwen Code、Claude Code、Codex、ModelScope）
- 命令名不翻译（`/goal`、`/branch`）
- 语气自然流畅，避免翻译腔
- PR 编号如 `[#5890]` 保持不变

## 执行流程

### 前置条件

- 中文源文件已存在于 `website/content/zh/blog/`
- 至少一期历史翻译已存在（用作风格参考）

### Step 1：确认源文件

读取源文件，确认内容完整（frontmatter、正文、贡献者表格、Callout）。

### Step 2：查找风格参考

对每种目标语言，找到最近一期该语言的翻译作为参考：
```
website/content/{lang}/blog/weekly-update-{最近日期}.mdx
```

### Step 3：并行翻译（6 个 agent 同时启动）

用 `agent` 工具在同一消息中并行启动 6 个 background agent（`run_in_background: true`），每个负责一种语言。

每个 agent 的 prompt 包含：
1. 读取中文源文件
2. 读取该语言的风格参考文件
3. 按翻译规则翻译并写入目标路径

### Step 4：验证

```
glob: website/content/**/blog/{filename}.mdx
确认返回 7 个文件（zh + 6 目标语言）
```

抽查 frontmatter、正文、import/JSX 保持不变。

### Step 5：提交

```
git add website/content/**/blog/{filename}.mdx
git commit -m "docs: add {filename} blog in 6 languages (en, de, fr, ja, pt-BR, ru)"
```

## 注意事项

- 博客文章不走 `sync` 自动翻译流程（`sync` 只处理 `docs/` 目录）
- 翻译方向是 zh → 其他语言
