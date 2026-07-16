---
name: open1v-qwencode-weekly
description: 为 Qwen Code 创建每周产品更新博客文章（周报）。技能负责数据收集（GitHub releases/PRs）、文件生成。写作风格规范统一由 open1v-qwencode-write skill 管理。触发词：写周报、qwencode 周报、产品更新、版本发布说明、功能迭代记录。
author: joeytoday
author_url: https://github.com/joeytoday
version: 2.10
created: 2026-06-23
updated: 2026-07-03
published: true
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

## 内容过滤

**必须过滤**：百炼/CodingPlan 引用、ATA 文章链接、内部增长数据、钉钉协作信息等非公开内容

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
achieved: false
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

使用 `4-res/template/work-post.md`，正文保持 mdx 格式：

```mdx
---
title: "Qwen Code 周报：Feature1、Feature2、Feature3"
date: "YYYY-MM-DD"
description: "本周发布 vX.Y.Z 版本，新增 Feature1、Feature2 等功能。"
author: "Qwen Team"
tags: ["Product Updates", "release", "weekly"]
---


```
import { BlogPostHeader } from '@/components/blog-post-header'
import { Callout } from 'nextra/components'

<BlogPostHeader
  title="Qwen Code 周报：Feature1、Feature2、Feature3"
  date="YYYY-MM-DD"
  author="Qwen Team"
/>
```

[正文内容]

[末尾固定内容（必须包含）]

```mdx
<Callout type="info">
  **升级方式**：运行 `npm i @qwen-code/qwen-code@latest -g` 即可升级到最新版本。
</Callout>

如有问题或建议，欢迎在 [GitHub Issues](https://github.com/QwenLM/qwen-code/issues) 反馈！
```

## 功能间逻辑递进

周报不是孤立的功能罗列。相邻几周的功能如果有逻辑递进关系，**必须在描述中显式关联**，让读者看到产品迭代的连贯性。

### 规则

1. **跨周递进**：本周功能如果是上周某功能的延伸（如上周做了对话级隔离，本周做文件级隔离），在描述中用 1-2 句话点出关联——"上周我们做了 X，这周往下走一层：Y"
2. **同周组合**：同一周内功能点如果有明确的配合关系（如 `/goal` + Worktree = 自主跑 + 安全跑），在各自描述中交叉提及，或用单独的"组合使用"段落说明
3. **同类合并**：功能定位高度一致的特性（如 `/stuck` 会话诊断 + `/doctor` 内存诊断 = 诊断工具组），合并为一个章节说明，避免碎片化

### 判断标准

- 功能 A 解决的问题是功能 B 的子集或延伸 → 跨周递进
- 功能 A 和 B 配合使用效果 > 单独使用 → 同周组合
- 功能 A 和 B 属于同一类别且单独说明过于单薄 → 同类合并

## 写作风格

> 写作风格、功能排序、演示占位符、去 AI 味等规范统一由 `open1v-qwencode-write` skill（`5-ref/ai/skills/open1v-qwencode-write/SKILL.md`）管理。执行周报写作前，必须先读取该 skill 并遵循其「周报写作（子场景）」章节的全部规范。

## 格式规范

| 项目 | 规范 |
|------|------|
| 标题 | 使用 `BlogPostHeader` 组件，正文无 `#` 标题 |
| 日期 | `YYYY-MM-DD` 格式 |
| 作者 | 周报用 `Qwen Team` |
| PR 链接 | `详见 PR [#xxx](https://github.com/QwenLM/qwen-code/pull/xxx)` |
| 分隔线 | 正文内不使用 `---` |
| 章节标题 | 仅在 `## ✨ 新增特性` 和 `## 🔧 重要修复` 使用 emoji |

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
| **触发条件** | 省略了 opt-in/opt-out、最低数量等前提条件 | 写明"≥2 个并行 agent 时触发""需在 settings 中配置" |
| **默认行为** | 把 opt-in 功能描述成默认行为 | 明确标注"默认关闭，需配置""默认开启" |
| **机制本质** | 把"预算参数"描述成"行为检测"，把"触发时机"描述成"压缩深度" | 准确描述实际机制 |
| **性能数据** | 编造具体数字（如"从分钟级降到秒级"） | 只写 PR 中有依据的数据，无依据则不写 |
| **Breaking changes** | 忽略废弃的配置项或 SDK 变更 | 在段落或修复表格中提及 |

3. 修正所有不符合源码的描述后，才能进入下一步

## 写作质量自检清单

完成初稿后，先按 `joey-work-write` 技能中「产品更新类：写作质量自检清单」逐条检查，然后补充以下 Qwen Code 专属检查项：

### Qwen Code 专属检查
- [ ] **源码验证**：每个功能的描述是否已通过源码验证？（禁止凭猜测描述功能行为，必须 clone 源码或通过 GitHub API 查看实际实现后再写）
- [ ] **可演示性筛选**：写入周报独立段落的功能是否全部通过了下方「功能可演示性准入」检查？不可演示的功能只能放在「更多新功能」表格中，不给独立段落
- [ ] 功能排序是否以用户感知为核心？（用户体感变化最大的功能最优先）
- [ ] PR 链接是否准确？（必须从 GitHub API 获取，不要编造）
- [ ] 是否过滤了内部敏感内容？（百炼/CodingPlan/ATA/钉钉协作等）
- [ ] 贡献者列表是否完整？每位贡献者是否标注了具体贡献？

### 独立段落数量限制

**每期周报最多挑选 7 个新功能作为独立段落详细介绍。** 其余功能全部放入「更多新功能」表格。

选择标准（按优先级排序）：
1. 用户体感变化最大的功能（新命令、新 UI、新交互）
2. 解决高频痛点的功能
3. 有现成截图/视频素材的功能

如果某周新功能超过 7 个且质量都很高，仍然只选 7 个——宁可把余下功能留给「更多新功能」表格，也不要让独立段落过多导致读者疲劳。

### 功能可演示性准入

**只有通过以下全部检查的功能，才能获得周报独立段落 + demo。** 不通过的功能放入「更多新功能」表格即可。

| 检查项 | 要求 | 反例 |
|--------|------|------|
| **用户可感知** | 用户操作后能看到 UI 变化、输出变化或新命令/快捷键 | Explore fastModel：后台静默切换模型，用户看不到任何差异 |
| **当前环境可演示** | 在用户当前的 auth provider / 系统 / 配置下能产出可截图的结果 | fastModel 在 codingPlan 下没有可用的快速模型，静默回退 |
| **不依赖特殊配置** | 不需要特殊后端配置、特定模型或 debug 模式才能看到效果 | 需要 `--debug` + 特定 fastModel 才能在日志里看到差异 |
| **功能在当前版本可用** | 功能已在用户可安装的版本中发布 | /delete 批量删除在下个版本才上线 |

**判断不确定时的原则**：能不能用一句话告诉用户「你做 X，就会看到 Y」？如果 Y 依赖隐藏条件或可能不出现，就不适合做独立 demo。

## 完成状态协议

执行完成后，报告以下状态之一：
- **DONE**：周报已完成，所有自检项通过，PR 链接准确
- **DONE_WITH_CONCERNS**：已完成，但部分功能缺少演示素材（已标注 `[📸]` 或 `[🎥]`）
- **BLOCKED**：无法继续（如 GitHub API 不可用、无 release 数据等）
- **NEEDS_CONTEXT**：缺少必要信息（如日期范围、版本号等）

## 关联技能

- 周报完成后，建议使用 `qwencode-social` 生成社交媒体版本（Twitter + 微信社群）
- 周报发布后，建议使用 `qwencode-thanks-mail` 发送贡献者感谢邮件
- 如需同步更新文档站，建议使用 `qwencode-docs-sync`

## Skill 版本管理（通用）

此规范适用于所有 skill 文件的版本管理，不限于本 skill。

- **版本号格式**：`主版本.次版本`，如 `1.2`
- **次版本迭代**：小优化、新增约束条目、措辞调整 → `1.1` → `1.2` → `1.3`
- **主版本迭代**：大幅重构、结构重组、核心原则变更 → `1.x` → `2.0`
- **记录位置**：frontmatter 的 `version` 字段
- **每次修改 skill 时必须更新版本号**，不管改动大小
