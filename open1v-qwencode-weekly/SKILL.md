---
name: open1v-qwencode-weekly
description: 为 Qwen Code 创建每周产品更新博客文章（周报）。技能负责数据收集（GitHub releases/PRs）、文件生成、写作规范与质量自检。触发词：写周报、qwencode 周报、产品更新、版本发布说明、功能迭代记录。
author: joeytoday
author_url: https://github.com/joeytoday
version: 2.24
pub-to: GitHub
published: true
created: 2026-07-31 11:33
updated: 2026-08-05
---

# Qwen Code 周报写作技能

为 Qwen Code 创建每周更新博客文章，记录产品迭代与功能优化。

## 使用方式

```
/skills qwencode-weekly <参数>
```

参数支持两种格式：

### 1. 日期格式

```
/qwencode-weekly 2026-02-24
```

- 开始日期：`YYYY-MM-DD` 格式
- 结束日期：今天
- 收集该时间范围内的 GitHub Releases 和 Merged PRs

### 2. 版本格式

```
/qwencode-weekly 0.11.x
/qwencode-weekly 0.11.2
```

- **模糊匹配**（如 `0.11.x`）：匹配所有包含该前缀的版本（`0.11.0`、`0.11.1`、`0.11.2` 等）
- **精确匹配**（如 `0.11.2`）：只匹配指定版本
- 收集匹配版本的所有 Releases 和相关 Merged PRs

## 数据收集

### 重要：使用 curl 命令获取数据

**不要使用 web_fetch**，它不稳定且经常返回无关内容。使用 `run_shell_command` 执行 curl 命令直接调用 GitHub API：

```bash
# 获取指定版本的 release notes
curl -s "https://api.github.com/repos/QwenLM/qwen-code/releases/tags/v0.12.4" | jq -r '.body'

# 获取最近的 releases 列表
curl -s "https://api.github.com/repos/QwenLM/qwen-code/releases" | jq '.[] | {tag_name, published_at, body}'

# 获取已合并的 PR 列表
curl -s "https://github.com/QwenLM/qwen-code/pulls?q=is%3Apr+is%3Amerged+sort%3Aupdated-desc"
```

### GitHub Releases

使用 curl 获取 release 数据：

- **日期模式**：筛选发布日期在 `[start-date, 今天]` 范围内的版本
- **版本模式**：筛选标题包含指定版本号的版本（如 `0.11.x` 匹配 `0.11.0`、`0.11.1` 等）

提取内容：

- 版本号与发布日期
- 新功能（What's Changed 章节）
- Bug 修复
- 截图/视频等素材

### Merged PRs

使用 curl 获取 PR 数据：

- **日期模式**：筛选合并日期在 `[start-date, 今天]` 范围内的 PR
- **版本模式**：筛选与匹配版本相关的 PR（通过 PR 标题或关联 release 判断）

提取内容：

- PR 编号与标题
- 功能描述
- 相关标签（enhancement/bug 等）

### 内容分类

- 新增特性：新功能、功能增强
- 重要修复：影响用户体验的 bug 修复
- 平台适配：Windows/macOS/Linux 专项修复

### 版本功能校验（必须执行）

**周报覆盖范围**：周报只写已发布到稳定版的 PR。未进稳定版的 PR 不写入周报——避免用户更新后找不到功能。

**校验方法**：

1. 获取本周覆盖的最新稳定版发布时间（如 `curl -s "https://api.github.com/repos/QwenLM/qwen-code/releases" | jq '.[] | select(.prerelease == false) | {tag_name, published_at}'`）
2. 对每个要写进周报的 PR，获取其 `merged_at` 时间
3. 比较：PR merge 时间 ≤ 最新稳定版发布时间 → **可以写入**
4. 如果 PR merge 时间 > 最新稳定版发布时间 → **不写入周报**

**处理方式**：

- 未进稳定版的 PR：直接排除，不写入周报的任何部分（独立段落、表格、贡献者均不写）
- 如果一个段落中有部分 PR 未进稳定版，只写已进稳定版的 PR，在 PR 链接中只列已进的
- 如果一个段落的所有 PR 都未进稳定版，整个段落不写

## 内容过滤

**必须过滤**：CodingPlan 引用、ATA 文章链接、内部增长数据、钉钉协作信息等非公开内容。百炼是 DashScope 的中文公开产品名，正常使用不过滤

**保留内容**：GitHub Star 数、趋势排名、公开版本号、开源功能、社区集成、文档改进

## 文件命名与模板

### 输出位置

```
1-projects/work/qwencode/weekly-update/weekly-update-YYYY-MM-DD.md
```

文件名格式：`weekly-update-YYYY-MM-DD.md`，其中日期为周报发布日期（通常是周四或周五）。

### Frontmatter 格式（产品更新类）

遵循 work-post 产品更新的 frontmatter 规范：

```markdown
---
tags:
  - 工作/产品/产品更新
  - 工作/运营/内容
status:
  - 🟢 Done
publishDate: YYYY-MM-DD
pub-to:
  - 🟪 QC-blog
page-views: 0
URL: https://qwenlm.github.io/qwen-code-docs/zh/blog/weekly-update-YYYY-MM-DD/
type:
  - work-post
project: "[[qwencode产品运营]]"
year: "[[YYYY]]"
archived: false
created: YYYY-MM-DD HH:mm
updated: YYYY-MM-DD HH:mm
---
```

**Frontmatter 说明**：

- `tags`: 使用 `工作/产品/产品更新` 作为主标签，符合 work-post 分类
- `status`: 🟢 Done 表示已完成
- `pub-to`: 🟪 QC-blog 表示发布到 Qwen Code 博客
- `page-views`: 发布后更新浏览量
- `URL`: 发布后填写实际链接
- `type`: work-post 表示工作类文章
- `project`: 关联到 qwencode 产品运营项目

### 正文模板

使用 `4-ref/template/05-qc-blog-temp.md`，正文保持 mdx 格式。开头 MDX 内容（frontmatter + imports + BlogPostHeader）必须包裹在 ````mdx` 代码块内，末尾 Callout + GitHub Issues 不加代码块：

```mdx
---
title: "Qwen Code 周报：Feature1、Feature2、Feature3"
date: "YYYY-MM-DD"
description: "本周发布 vX.Y.Z 版本，新增 Feature1、Feature2 等功能。"
author: "Qwen Team"
tags: ["Product Updates", "release", "weekly"]
---

import { BlogPostHeader } from '@/components/blog-post-header'
import { Callout } from 'nextra/components'

<BlogPostHeader
  title="Qwen Code 周报：Feature1、Feature2、Feature3"
  date="YYYY-MM-DD"
  author="Qwen Team"
/>
```

[正文内容]

末尾固定内容（必须包含，不加代码块）：

<Callout type="info">
  **升级方式**：运行 `npm i @qwen-code/qwen-code@latest -g` 即可升级到最新版本。
</Callout>

如有问题或建议，欢迎在 [GitHub Issues](https://github.com/QwenLM/qwen-code/issues) 反馈！

## 功能间逻辑递进

周报不是孤立的功能罗列。相邻几周的功能如果有逻辑递进关系，**必须在描述中显式关联**，让读者看到产品迭代的连贯性。

### 规则

1. **跨周递进**：本周功能如果是上周某功能的延伸（如上周做了对话级隔离，本周做文件级隔离），在描述中用 1-2 句话点出关联——" 上周我们做了 X，这周往下走一层：Y"
2. **同周组合**：同一周内功能点如果有明确的配合关系（如 `/goal` + Worktree = 自主跑 + 安全跑），在各自描述中交叉提及，或用单独的 " 组合使用 " 段落说明
3. **同类合并**：功能定位高度一致的特性（如 `/stuck` 会话诊断 + `/doctor` 内存诊断 = 诊断工具组），合并为一个章节说明，避免碎片化

### 判断标准

- 功能 A 解决的问题是功能 B 的子集或延伸 → 跨周递进
- 功能 A 和 B 配合使用效果 > 单独使用 → 同周组合
- 功能 A 和 B 属于同一类别且单独说明过于单薄 → 同类合并

## 写作风格

- **用户视角**：每个功能从用户痛点讲起，不是功能驱动
- **白话解释**：技术术语首次出现时给一句通俗解释
- **不堆砌**：避免纯功能罗列，每个功能有场景和体验描述
- **去 AI 味**：无排比三连、无上价值、无 " 不是…而是…" 过度使用、无感叹号、无 " 我们 " 模糊主语
- **功能排序**：全新且解决痛点的功能排前面
- **演示占位符**：独立段落标注 `[📸]` 或 `[🎥]`

## 格式规范

| 项目 | 规范 |
|------|------|
| 标题 | 使用 `BlogPostHeader` 组件，正文无 `#` 标题。标题中的斜杠命令不加反引号（写 `/learn` 不写 `` `/learn` ``），正文中正常加反引号 |
| 日期 | `YYYY-MM-DD` 格式 |
| 作者 | 周报用 `Qwen Team` |
| PR 链接 | 每段内容先流畅叙述，段落末尾统一列 `详见 PR [#xxx](URL)、[#yyy](URL)`；不在每句话后逐个插入 PR 链接，也不在整个章节末尾集中列出 |
| 分隔线 | 正文内不使用 `---` |
| 章节标题 | **h2（`##`）为章节分隔，带 emoji**，固定顺序：`## ✨ 新增特性` → `## 📊 更多新功能` → `## 👏 体验优化` → `## 🔧 重要修复` → `## 👥 贡献者`。**h3（`###`）为独立功能标题，不带 emoji**：`### 功能名：用户价值描述`。独立段落和模块集中段落作为 `### ` 子节放在 `## ✨ 新增特性` 下；体验优化作为独立 `## 👏 体验优化` 章节 |
| 同类聚合 | 更多新功能和体验优化段落中，同一模块/产品的条目必须相邻排列（如所有钉钉相关、所有 MCP 相关、所有 Web Shell 相关），不按 PR 编号或合入时间排序 |
| 更多新功能 | 段落格式（与体验优化一致）：`**功能名。** 功能描述 + 用户影响。详见 PR [#xxx](URL)`，不用表格。每条 1-2 句，说清功能做了什么、对用户有什么影响，不要过长 |
| 重要修复表格 | 三列格式：`\| 修复 \| PR \| 对你的影响 \|`。修复列用 `**加粗描述**` 格式，不单独列模块列 |

## 贡献者规范

每期周报必须包含贡献者章节。

### `## 👥 贡献者`（全体贡献者）

列出本周所有有 PR 合入的贡献者，按贡献数量降序排列。使用表格格式：

```
| 贡献者 | 贡献内容 | 参考 PR 链接 |
|--------|---------|-------------|
| **[@username](https://github.com/username)** | 功能简述1、功能简述2、功能简述3 | [#PR1](link), [#PR2](link) |
| 🆕 **[@newuser](https://github.com/newuser)** | 🎉 首次贡献：贡献内容 | [#PR3](link) |
```

要求：

- 用户名必须链接到 GitHub 主页（`[@username](https://github.com/username)`）
- 每个贡献者必须标注具体贡献（功能名或 PR 标题简化版），不能只写 PR 编号
- 贡献数量相同按字母序排列
- 所有 PR 链接必须指向 GitHub，从 API 获取，不编造
- 首次贡献者在贡献者列名前加 🆕 标记，不再单独开新贡献者章节

新贡献者的判断标准：其 GitHub 用户名在 QwenLM/qwen-code 仓库中之前没有 merged PR。

## 工作流程

1. 解析命令参数：判断是日期格式（`YYYY-MM-DD`）还是版本格式（如 `0.11.x`）
2. 获取 GitHub releases，按日期或版本筛选
3. 获取 merged PRs，按日期或关联版本筛选
4. 过滤敏感内容
5. **源码验证**（写入周报前必须完成）：对每个独立段落的功能，通过 GitHub API 获取 PR body 中的完整描述（`curl -s "https://api.github.com/repos/QwenLM/qwen-code/pulls/<N>" | jq '{title, body}'`），逐条对照周报描述与源码实际行为，修正所有不准确的地方。详见下方「源码验证规范」
6. 创建中文周报（文件日期为今天，日期格式统一为 `YYYY-MM-DD`）
7. 检查格式合规性
8. 写作质量自检（参照下方检查清单）

### 源码验证规范

**原则**：周报中的每一句功能描述，都必须能在 PR body、commit message 或源码 diff 中找到依据。没有依据的断言（如性能数据、行为推测）必须移除或标注为未验证。

**执行方式**：

1. 对每个独立段落功能，用 `curl -s "https://api.github.com/repos/QwenLM/qwen-code/pulls/<N>" | jq '{title, body}'` 获取 PR 的完整描述
2. 逐句对照周报描述与 PR body，检查以下维度：

| 检查维度 | 常见错误 | 正确做法 |
|---------|---------|---------|
| **触发条件** | 省略了 opt-in/opt-out、最低数量等前提条件 | 写明 "≥2 个并行 agent 时触发 "" 需在 settings 中配置 " |
| **默认行为** | 把 opt-in 功能描述成默认行为 | 明确标注 " 默认关闭，需配置 "" 默认开启 " |
| **机制本质** | 把 " 预算参数 " 描述成 " 行为检测 "，把 " 触发时机 " 描述成 " 压缩深度 " | 准确描述实际机制 |
| **性能数据** | 编造具体数字（如 " 从分钟级降到秒级 "） | 只写 PR 中有依据的数据，无依据则不写 |
| **Breaking changes** | 忽略废弃的配置项或 SDK 变更 | 在段落或修复表格中提及 |

3. 修正所有不符合源码的描述后，才能进入下一步

## 写作质量自检清单

完成初稿后，逐条检查以下清单。

### 通用写作检查

- [ ] **用户视角**：每个功能是否从用户痛点出发，而非功能驱动？
- [ ] **白话解释**：技术术语首次出现时是否有通俗解释？
- [ ] **不堆砌**：是否避免了纯功能罗列，每个功能有场景和体验描述？
- [ ] **去 AI 味**：无排比三连、无上价值、无 " 不是…而是…" 过度使用、无感叹号、无 " 我们 " 模糊主语
- [ ] **PR 链接准确**：所有 PR 链接是否从 GitHub API 获取，未编造？
- [ ] **敏感内容过滤**：是否过滤了 CodingPlan/ATA/钉钉协作等内部内容？（百炼为公开产品名不过滤）
- [ ] **演示素材**：独立段落是否标注了演示占位符（视频/截图）？

### Qwen Code 专属检查

- [ ] **源码验证**：每个功能的描述是否已通过源码验证？
- [ ] **段落组织**：是否根据本周功能特点灵活组织（体验优化短段落、模块集中段落、场景驱动段落）？
- [ ] **模块集中段落放最后**：如果有模块集中段落，是否放在独立段落的末尾？
- [ ] **模块集中段落无列表**：模块集中段落是否没有 " 你能用它做什么 " 列表，每个子功能包含用户场景感知？
- [ ] **功能排序**：全新且解决痛点的功能是否排在前面？
- [ ] **标题价值描述**：标题中每个功能是否带上了完整的用户价值描述，而非纯功能名罗列？
- [ ] **PR 链接是否准确**？（必须从 GitHub API 获取，不要编造）
- [ ] **是否过滤了内部敏感内容**？（CodingPlan/ATA/钉钉协作等，百炼为公开产品名不过滤）
- [ ] **贡献者列表是否完整**？每位贡献者是否标注了具体贡献？
- [ ] **MDX 代码块格式**：开头 MDX 内容（frontmatter + imports + BlogPostHeader）是否包裹在 ````mdx` 代码块内？末尾 Callout + GitHub Issues 是否没有代码块包裹？
- [ ] **版本功能校验**：周报中所有 PR 是否已包含在已发布的稳定版中？未进稳定版的 PR 是否已从周报中排除？

### 段落组织规范

周报段落不固定为 "7 个独立段落 + 表格 "，根据本周功能特点灵活组织，段落类型与选择标准见下。

**段落类型**：

- **完整独立段落**：单个重要功能，含功能描述 + " 你能用它做什么 " 列表 + PR 链接 + 演示占位符，作为 `### ` 放在 `## ✨ 新增特性` 下
- **模块集中段落**：某模块本周更新 ≥4 个 PR 时合并，按子功能分段描述（每段含场景感知），不加列表和演示占位符，作为 `### ` 放在 `## ✨ 新增特性` 末尾
- **体验优化章节**：多个小功能合并，每个 2-3 句 + PR 链接，不加列表和演示占位符，作为独立 `## 👏 体验优化` 章节（不在新增特性下）
- **场景驱动段落**：多个 PR 构成一个用户场景时合并，按场景流程描述

**`## ✨ 新增特性` 下的独立段落数量上限为 7**，模块集中段落算 1 个名额。体验优化为独立 h2 章节，不占新增特性名额。

**选择标准（按优先级排序）**：

1. 全新功能且解决痛点（新命令、新能力）
2. 直接可见的交互改进（UI 变化、新按钮）
3. 解决具体痛点的小功能（不一定最亮眼但用户实际遇到）
4. 有现成截图/视频素材的功能

### 功能可演示性准入

**完整独立段落需要通过可演示性检查。** 体验优化短段落和模块集中段落不需要演示占位符。

| 检查项 | 要求 | 反例 |
|--------|------|------|
| **用户可感知** | 用户操作后能看到 UI 变化、输出变化或新命令/快捷键 | Explore fastModel：后台静默切换模型，用户看不到任何差异 |
| **当前环境可演示** | 在用户当前的 auth provider / 系统 / 配置下能产出可截图的结果 | fastModel 在 codingPlan 下没有可用的快速模型，静默回退 |
| **不依赖特殊配置** | 不需要特殊后端配置、特定模型或 debug 模式才能看到效果 | 需要 `--debug` + 特定 fastModel 才能在日志里看到差异 |
| **功能在当前版本可用** | 功能已在用户可安装的版本中发布 | /delete 批量删除在下个版本才上线 |

## 完成状态协议

执行完成后，报告以下状态之一：

- **DONE**：周报已完成，所有自检项通过，PR 链接准确
- **DONE_WITH_CONCERNS**：已完成，但部分功能缺少演示素材（已标注 `[📸]` 或 `[🎥]`）
- **BLOCKED**：无法继续（如 GitHub API 不可用、无 release 数据等）
- **NEEDS_CONTEXT**：缺少必要信息（如日期范围、版本号等）

## 关联技能

- 周报完成后，用 `open1v-qwencode-docs-trans` 翻译成 6 语言（en/de/fr/ja/pt-BR/ru）
- 周报封面用 `open1v-qwencode-blog-cover` 生成（周报走晕染风格）

## Skill 版本管理（通用）

此规范适用于所有 skill 文件的版本管理，不限于本 skill。

- **版本号格式**：`主版本.次版本`，如 `1.2`
- **次版本迭代**：小优化、新增约束条目、措辞调整 → `1.1` → `1.2` → `1.3`
- **主版本迭代**：大幅重构、结构重组、核心原则变更 → `1.x` → `2.0`
- **记录位置**：frontmatter 的 `version` 字段
- **每次修改 skill 时必须更新版本号**，不管改动大小
