# 更新日志

记录本项目的所有重要变更。

## [Unreleased]

### 变更
- `open1v-qwencode-weekly` (v2.23 → v2.24) - 移除对仓库外技能（open1v-qwencode-write、qwencode-social、qwencode-thanks-mail、qwencode-docs-sync）的引用，写作风格改为技能内自包含规范，关联技能改为仓库内的 docs-trans 和 blog-cover
- `open1v-qwencode-showcases` (v2.1 → v2.2) - 移除已废弃的 qwencode-translate 引用（翻译规则本已完整内联）
- `open1v-qwencode-docs-trans` (v2.3 → v2.4) - 移除对仓库外 SOUL 配置的引用（翻译风格规范本已完整内联）
- `open1v-qwencode-weekly` (v2.22 → v2.23) - 整合周报写作规范（写作原则、功能排序、演示素材、段落组织、可演示性准入、逻辑递进），质量自检清单重构为 5 个子清单
- `open1v-qwencode-docs-trans` (v2.0 → v2.3) - 翻译规范更新
- `open1v-qwencode-blog-cover` (v1.5 → v1.6) - 封面生成规范更新

## [2026-07-29]

### 新增
- `open1v-qwencode-blog-cover` - Qwen Code 文档站博客封面生成（常青文章用微距实物，周报用晕染风格）

## [2026-07-21]

### 新增
- `open1v-openai-cover` - OpenAI 风格公众号封面图生成（实物材质/晕染渐变/光束弧影/波形水彩）

### 变更
- 重构 open1v-openai-cover 技能文件（SKILL.md、template.html、build.cjs）

## [2026-07-16]

### 变更
- 优化 README.md 和 README.en.md 的视觉排版
- 更新技能列表，与仓库实际状态对齐
- 技能分类增加 emoji 图标（🎨 📝 🤔）
- 技能表格增加触发词列

### 修复
- 移除已废弃的 `open1v-qwencode-translate` 技能引用
- 目录结构与实际文件对齐

## [首次发布]

### 新增
- `open1v-product-visual` - 一站式电商商品图与视频生成
- `open1v-mpcover-gen` - 公众号封面图生成（大字报/杂志/Claude极简/像素 4 种风格）
- `open1v-product-copy` - 多渠道产品推广文案与公众号发布
- `open1v-qwencode-weekly` - Qwen Code 每周产品更新博客
- `open1v-qwencode-docs-trans` - Qwen Code 文档站多语言翻译
- `open1v-qwencode-showcases` - Qwen Code Showcase 视频演示管理
- `open1v-qa-before-start` - 苏格拉底式需求澄清
