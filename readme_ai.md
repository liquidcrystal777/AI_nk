# README_AI

这是给后续 AI / 协作者看的项目交接文档，不是给最终用户的产品 README。

---

## 1. 项目定位

这是一个**纯本地、偏自用**的考研英语背词工具。

目标不是做“大而全”的通用背单词产品，而是围绕一个最小闭环：

1. 从考研英语真题中定位单词语境
2. 调 AI 生成结构化词卡
3. 用户手动修正
4. 保存到本地数据库
5. 进入浏览与复习流程

决策优先级：

- 优先：本地可用、闭环稳定、手机端顺手、可长期积累
- 次优先：界面质感、卡片表达清晰
- 不优先：多用户、云同步、社区化、过度产品化

---

## 2. 当前技术栈

- Next.js 16（App Router）
- React 19
- TypeScript
- Tailwind CSS 4
- Dexie + IndexedDB（本地持久化）
- Capacitor（Android 壳）

注意：

- 这个仓库使用的是**不该按旧经验想当然**的 Next.js 版本。
- 修改 Next 相关实现前，先看：`node_modules/next/dist/docs/`
- 项目指令已明确写在 `AGENTS.md`：**This is NOT the Next.js you know**

---

## 3. 目录职责

- `app/`
  - `app/page.tsx`：首页
  - `app/browse/page.tsx`：浏览词库
  - `app/record/page.tsx`：录入新词 / 编辑生成结果
  - `app/review/page.tsx`：复习
  - `app/settings/page.tsx`：设置
- `components/`
  - 页面布局、词卡、表单、浏览/复习/首页 UI
- `lib/`
  - `lib/ai/`：AI prompt、请求、解析
  - `lib/db/`：Dexie 查询/写入/备份导入导出
  - `lib/hooks/`：页面逻辑 hook
  - `lib/utils/`：常量、文本格式化工具
- `types/`
  - 业务类型定义
- `public/exam-papers/`
  - 真题源文件
- `android/`
  - Capacitor Android 工程

---

## 4. 当前已形成的真实闭环

### 设置

用户在设置页保存：

- AI API Key
- Base URL
- Model Name
- 主题（light / dark）

### 录入

录入页当前流程：

1. 输入单词
2. 手动输入年份
3. 选择 `TEXT1 ~ TEXT4`
4. 调 AI 生成结构化词卡
5. 用户手动编辑
6. 保存到本地数据库

### 浏览

浏览页当前定位：

- 横向滑动查看词卡
- 搜索 / 按年份和文章来源过滤
- 删除词卡
- 不做复杂展开折叠逻辑

### 复习

复习页当前是三阶段：

1. `attitude`：判断态度
2. `meaning`：输入词义
3. `card`：看结果卡片

这是项目当前**已经落地**的主逻辑，不要随意改坏。

---

## 5. 当前稳定的产品原则

### 5.1 AI 词卡不是“原句翻译器”

当前 AI 生成策略已被明确收紧：

- `originalSentence` 必须忠于原文证据
- `partOfSpeech` 必须服从当前语境
- 但 `meaning` / `deodorizedMeaning` / `sentiment` 不能机械跟着某一句的局部语气走
- AI 要更像“考研命题视角”，优先提炼：
  - 高频稳定义项
  - 常见考法
  - 稳定语篇角色
  - 更稳的态度判断

也就是说：

- 原文负责**约束**，不是负责把整张卡片拖进局部情绪里
- 不确定时，`sentiment` 优先回到 `[中性]`

相关实现：

- `lib/ai/client.ts`

### 5.2 `deodorizedMeaning` 的定位

当前约束是两行语义：

1. 第一行：白话解释
2. 第二行：考研常见考法 / 常见误判点 / 语篇角色

不要把它写成：

- 翻译腔
- 词典腔
- 单纯复述原句情绪

### 5.3 浏览页不要展示“易混淆含义”

用户已经明确要求：

- 浏览展示层不要出现容易干扰记忆的信息块
- 某些底层字段可以保留给复习逻辑，但不应在 browse 中硬展示

### 5.4 功能取舍遵循 KISS / YAGNI

不要主动做这些事：

- 多用户体系
- 云同步
- 登录鉴权
- 社交能力
- 复杂抽象层
- 为未来假想需求预留一堆结构

---

## 6. 当前重要页面与状态

### 首页

- 主页三入口：`BROWSE / RECORD / REVIEW`
- 标签字重已经加重
- 主题跟随全局设置

相关文件：

- `app/page.tsx`
- `components/home/home-sections.tsx`

### 浏览页

当前重点：

- 横向卡片浏览
- 搜索与过滤
- 删除操作
- 手机上优先保证卡片浏览顺滑

相关文件：

- `app/browse/page.tsx`
- `components/browse/word-list.tsx`
- `components/browse/browse-word-card.tsx`
- `components/common/word-card.tsx`

### 录入页

当前重点：

- 年份改成手动输入
- 文章来源用 `TEXT1 ~ TEXT4`
- 调 AI 时应有明确生成中的反馈

相关文件：

- `app/record/page.tsx`
- `components/record/record-prompt-form.tsx`
- `components/record/word-editor-form.tsx`
- `lib/hooks/use-record-draft.ts`

### 复习页

当前重点：

- 不要破坏三阶段流程
- `sentiment` 仍然只允许：`[正+] / [负-] / [中性]`
- review 是这个项目的核心闭环之一

相关文件：

- `app/review/page.tsx`
- `components/review/review-sections.tsx`
- `lib/hooks/use-review-stage.ts`

### 设置页

当前已具备：

- AI 配置保存
- light / dark 主题切换
- 本地备份导出
- 本地备份导入（replace / append）

相关文件：

- `app/settings/page.tsx`
- `components/settings/settings-form.tsx`
- `lib/db/backup.ts`

---

## 7. 当前数据与备份事实

### 本地数据库

项目核心资产是：

- 本地词卡数据
- 用户手动修正后的结构化内容
- 复习状态推进结果

因此修改时优先保证：

- schema 稳定
- 旧数据兼容
- 导入导出可用
- 不轻易改表结构

### 备份闭环

设置页现在已经有：

- JSON 导出
- JSON 导入
- `replace` / `append`

`append` 模式按内容特征去重，而不是只依赖 `id`。

---

## 8. 当前 UI / 布局事实

### 全局主题

- 支持 light / dark
- 主题通过 `data-theme` 驱动
- 全局颜色 token 在：`app/globals.css`

### 移动端黑边问题

最近已经修过一轮底部黑边问题，原则是：

- **只修底部，不碰顶部安全区**
- 不能为了消除底部露边去侵入顶部状态栏
- 否则顶部按钮可能点不到

当前处理方式：

- 壳层与各主页面内容区一起补 `safe-area-inset-bottom`
- 顶部保持默认安全区行为，不再使用侵入式 `viewportFit: cover`

相关文件：

- `components/layout/app-shell.tsx`
- `app/page.tsx`
- `app/browse/page.tsx`
- `app/record/page.tsx`
- `app/review/page.tsx`
- `app/settings/page.tsx`
- `app/globals.css`

---

## 9. Android / APK 打包事实

当前本机已经能成功打 debug APK。

关键前提：

1. Android SDK 目录要正确
2. JDK 要用 21，不是 17
3. Android 构建链里已处理过旧 Kotlin jdk7/jdk8 依赖冲突

如果后面再碰 Android 构建报错，优先检查：

- `android/local.properties`
- Java 版本
- `android/build.gradle`

---

## 10. 后续改动时的硬约束

### 可以优先做

- 修正 AI 生成质量
- 优化手机端操作体验
- 收紧 UI 噪音
- 保证浏览 / 录入 / 复习闭环更顺
- 修复本地数据相关问题

### 不要主动做

- 改 schema 只为“看起来更优雅”
- 改复习逻辑核心枚举而不检查全链路
- 把 browse / review / record 为了抽象强行揉成一套过度通用组件
- 把项目带向云服务产品
- 在用户没要求时扩功能

---

## 11. 推荐工作方式

1. 先读现有代码，再改
2. 一次只做一个最小闭环
3. 优先局部改动，不轻易大重构
4. 先保证手机端真实可用
5. 改完至少跑一次构建验证：`npm run build`

---

## 12. 对下一个 AI 的一句话提醒

这个项目最重要的不是“看起来像一个完整产品”，而是：

**把考研阅读里的词，稳定地变成可长期积累、可本地复习、可在手机上顺手使用的个人词卡资产。**
