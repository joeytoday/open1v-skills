---
name: open1v-qwencode-docs-trans
description: Qwen Code 文档站博客/周报多语言翻译。包含翻译规范和并行执行流程。触发词：翻译周报、翻译博客、多语言翻译、translate blog、translate weekly、docs trans。
author: joeytoday
version: 2.4
pub-to: GitHub
published: true
created: 2026-07-31 13:35
updated: 2026-08-05
---

# Qwen Code 博客多语言翻译

## 翻译配置

- **源语言**：zh（中文为实际写作语言）
- **目标语言**：en、de、fr、ja、pt-BR、ru
- **源文件路径**：`website/content/zh/blog/updates/{filename}.mdx`
- **输出路径**：`website/content/{lang}/blog/updates/{filename}.mdx`

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

**术语规则**：
- 技术术语保持英文（Agent、Token、Worktree、MCP、prompt cache）
- 产品名称不翻译（Qwen Code、Claude Code、Codex、ModelScope）
- 命令名不翻译（`/goal`、`/branch`、`/learn`、`/stats`）
- PR 编号如 `[#5890]` 保持不变

**语言风格（必须匹配中文原文的调性）**：

中文原文的写作风格是：结论先行、句子短、不铺垫、不用被动语态、不用企业腔。翻译必须保留这种节奏感，而不是默认写成冗长正式的说明文。

具体规则：
- **结论先行**：段落第一句给结论或核心信息，不绕弯子
- **句子短**：能用短句就不用长句，一句一个信息点
- **主动语态**：避免被动句式（"was implemented by" → "X implemented"）
- **不堆修饰语**：不写 "this powerful new feature that enables users to..." 这种膨胀句式
- **不用企业腔**：禁止 "leverage"、"utilize"、"facilitate"、"streamline"、"empower"、"seamlessly"、"robust"、"cutting-edge" 这类空泛大词
- **不用 AI 味句式**：禁止 "It's worth noting that..."、"This represents a significant improvement..."、"By doing X, users can now..."  这类模板开头
- **具体胜过抽象**：说 "粘贴 260K 字符从 1.7 秒降到 8ms" 而不是 "paste performance has been significantly improved"
- **对话感**：像在跟一个开发者同事说话，不是在写产品白皮书
- **不加原文没有的解释**：不替读者拆解、不加 "in other words" 式的补充说明

**反面示例 → 正面示例**：

| ❌ 翻译腔 | ✅ 正确风格 |
|-----------|------------|
| This update introduces a new capability that allows users to reference historical session contexts directly. | Type `@` to pull in a past session's context — no resume, no fork. |
| The background agent runtime is now persisted within the parent session upon completion. | Background Agents stick around after they finish. `send_message` keeps the conversation going. |
| It is worth noting that the video input feature enables automatic skill distillation. | Drop in an MP4, `/learn` distills it into a reusable Skill. |

## 执行流程

### 前置条件

- 中文源文件已存在于 `website/content/zh/blog/`
- 至少一期历史翻译已存在（用作风格参考）

### Step 1：确认源文件

读取源文件，确认内容完整（frontmatter、正文、贡献者表格、Callout）。

### Step 2：查找风格参考

对每种目标语言，找到最近一期该语言的翻译作为参考：
```
website/content/{lang}/blog/updates/weekly-update-{最近日期}.mdx
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

### Step 5：注册侧边栏 _meta.ts

在**所有 7 种语言**的 `website/content/{lang}/blog/updates/_meta.ts` 中注册新条目，插入到 `index` 行之后、上一条周报之前（最新在最前）。

各语言的标签格式：
| 语言 | 格式 |
|------|------|
| zh | `'weekly-update-2026-07-23': '07-23 产品周报'` |
| en | `'weekly-update-2026-07-23': '07-23 Product Update'` |
| de | `'weekly-update-2026-07-23': '07-23 Produkt-Update'` |
| fr | `'weekly-update-2026-07-23': '07-23 Mise à jour produit'` |
| ja | `'weekly-update-2026-07-23': '07-23 製品アップデート'` |
| pt-BR | `'weekly-update-2026-07-23': '07-23 Atualização do Produto'` |
| ru | `'weekly-update-2026-07-23': '07-23 Обновление продукта'` |

### Step 6：生成博客数据

翻译完成后，在 `website/` 目录下运行 `npm run generate` 重新生成博客索引数据（`blog-dates.json`、`page-registry.js`），确保新翻译的文章被正确索引。

```bash
cd website && npm run generate
```

注意：generate 脚本可能会修改中文源文件的 title（如去掉反引号），这是预期行为，需要一并提交。

### Step 7：提交

将翻译文件、_meta.ts 和生成的数据一起提交：

```bash
git add website/content/**/blog/updates/{filename}.mdx website/content/**/blog/updates/_meta.ts website/public/blog-dates.json
git commit -m "docs: add {filename} blog in 6 languages (en, de, fr, ja, pt-BR, ru)"
```

## 注意事项

- 博客文章不走 `sync` 自动翻译流程（`sync` 只处理 `docs/` 目录）
- 翻译方向是 zh → 其他语言
- 周报文件放在 `content/{lang}/blog/updates/` 子目录中，每种语言的 `_meta.ts` 都需要手动注册新条目
