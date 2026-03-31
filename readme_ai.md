# README_AI

这是给下一个 AI 的工程交接文档，不是面向最终用户的 README。

## 项目定位

这是一个**纯自用**的考研英语背词工具。

核心目标不是做“大而全”的背单词产品，而是围绕：

- 从考研英语阅读文章中抽取语境
- 生成并编辑单词卡
- 在本地长期积累词卡
- 按复习逻辑进行记忆训练

用户明确要求：

- 这是他**自己用**的项目
- **不要为了通用产品化而增加没必要的功能**
- 优先保证最小闭环、够用、稳定

## 当前工程理解

### 技术栈

- Next.js 16（App Router）
- React 19
- TypeScript
- Tailwind CSS 4
- Dexie + IndexedDB（本地存储）
- Capacitor（Android 壳）

### 主要目录职责

- `app/`：页面路由
  - `app/page.tsx`：首页
  - `app/browse/page.tsx`：浏览词库
  - `app/record/page.tsx`：录入单词
  - `app/review/page.tsx`：复习
  - `app/settings/page.tsx`：设置
- `components/`：页面组件与通用 UI
- `lib/`：核心业务逻辑
  - `lib/db/`：Dexie 数据库、查询、写入
  - `lib/review/`：复习状态机
  - `lib/ai/`：AI 请求、prompt、解析
  - `lib/hooks/`：页面逻辑 hook
  - `lib/utils/`：常量与工具函数
- `types/`：类型定义
- `public/exam-papers/`：考研英语题源（tex/pdf）
- `android/`：Capacitor Android 工程
- `docs/`：设计说明与早期文档

## 当前已形成的核心闭环

1. 在设置页保存 AI 接口配置
2. 在录入页输入单词 + 年份 + Text1~Text4
3. 读取真题文本（优先 `.tex`，其次 `.pdf`）
4. 调 AI 生成结构化词卡
5. 用户人工修正后保存到本地数据库
6. 在浏览页查看词库
7. 在复习页按既定逻辑做记忆训练

## 当前项目最重要的价值

这个项目最有价值的不是 UI，而是：

- **真题语境下的个人词卡资产**
- **本地可积累的数据**
- **录入 → 编辑 → 存储 → 复习 的闭环**

因此后续改动应优先考虑：

- 数据可靠性
- 复习体验
- AI 生成后的可修正性
- 少而稳的功能设计

而不是：

- 多用户
- 云同步体系
- 社交功能
- 产品化堆功能

## 现阶段需要牢记的用户约束

### 1. 目前先只调整 browse，不联动 review/record

用户最新要求已经改成：

- 这一轮**先只调整 browse 浏览界面**
- review / record **暂时不要联动**
- 用户会先看 browse 效果，再决定后面是否回流到复习/录入界面

因此当前实现策略应当是：

- browse 可以先使用自己的专属卡片组件
- review 继续保持现有复习卡结构
- record 页面不因为 browse 的试验性排版被牵连
- 不要在用户没有再次确认前，主动把 browse 这套紧凑卡片推广成全局共享组件

### 2. 浏览页不要显示“易混淆含义”

用户明确要求：

- 浏览词库界面里**不要显示【易混淆含义】**
- 这个信息是给**复习监测**用的，不是给日常浏览展示的
- 现在进一步收紧为：**单词卡 UI 整体都不再展示这个模块**，但底层数据字段可先保留给复习测试逻辑使用

因此如果修改单词卡或浏览页，请把 `confusingMeaning*` 类字段从展示层移除或隐藏，不要影响 review 选项生成逻辑。

### 3. 复习逻辑要参考根目录 `review logic.png`

用户明确要求：

- 复习逻辑以根目录 `review logic.png` 为准
- 当前实现的复习逻辑后续需要向这张图靠拢

根据图片，目前可提炼出的高层流程是：

#### 复习流程草图

- 从某个单词卡进入复习
- `review screen(1)`：**判断正负态度**
  - 页面中心显示 `word`
  - 底部是三个选项按钮（图中表现为负 / 中 / 正）
  - 右上角有“遗忘”入口
  - 如果判断错误或选择遗忘，会回到该词的展示卡或进入纠正流程
- `review screen(2)`：**判断词意**
  - 页面中心显示 `word`
  - 下方显示多个候选项按钮
  - 右上角同样有“遗忘”入口
- 通过后流转到**下一个词**
- 左上角返回主界面

这说明后续复习设计重点不是当前这种“直接展示完整信息再点 fail/again/success/skip”，而是更偏向：

- 分阶段测试
- 先判断态度
- 再判断词意
- 有“遗忘”分支
- 有明确的“下一词”推进

### 3. 当前复习单词卡相关部分先保留

用户明确要求：

- 现在已有的复习单词卡相关部分**先留着**
- 他后面会再说明这些内容怎么使用

因此后续重构复习页时：

- **不要直接删除现有 review card 内容结构**
- 可以先重组、隐藏、延后展示
- 但先保留相关字段和展示能力，等待下一步明确指令

## 对后续 AI 的实现建议

### 应优先做的事情

1. 围绕用户最新要求调整 browse/review
2. 修改时优先复用现有数据结构，避免引入新一套模型
3. 尽量保留已有 review card 的信息块，先做流程重组，不急着删除
4. 在不影响闭环的前提下减少展示噪音

### 不应主动做的事情

1. 不要主动加“看起来完整但用户没要”的功能
2. 不要为了抽象而抽象
3. 不要默认把项目往多用户/云端/通用词典产品方向改
4. 不要急着大改数据库，除非用户明确要求

## 已观察到的工程事实

- 项目是静态导出方案，不依赖传统服务端运行时
- 本地数据库是核心持久层
- AI 生成是当前录入链路的重要组成部分
- 现有 `docs/` 中部分文档与最新实现可能已有偏差，修改前应以代码现状为准
- 项目已经存在一套复习状态机，但它不一定等同于用户现在想要的最终复习逻辑

## 推荐的工作原则

- 先读代码，再改代码
- 优先小步迭代
- 每次只推进一个最小闭环
- 保持实现简单直接
- 用户没明确要的功能，不主动扩展

## 最新已完成改动（2026-03-30，第三轮）

### 1. 单词卡进一步收敛为“自用考研复习卡”

本轮用户再次明确：

- 单词卡不是为“解释某一篇阅读”服务，而是为**整个考研背词迁移**服务
- browse 与 review 仍然只能复用**同一个** `WordCard`
- 单词卡正文要固定成两个标签：
  - `【极简释义】`
  - `【考点/逻辑】`
- 且两者放在**同一个连续内容块**里，不再拆成两块大 section

当前 `components/common/word-card.tsx` 已固定为：

- Header：紫底白字（`bg-[#660874] text-white`）
- 单词：`font-serif text-3xl`
- 词性：`font-serif text-xl`
- 标签：`font-bold text-gray-900`
- 原文：`font-serif italic text-gray-800`
- 容器：`shadow-md bg-white rounded-md`
- 内容区：`space-y-4 leading-relaxed`

### 2. `WordCard` 的正文顺序现在是硬约束

用户要求非常明确：

- `【考点/逻辑】` 内部必须严格按以下顺序展示：
  1. 原文
  2. 记忆/词根
  3. 去味

当前共享 `WordCard` 已统一成这个顺序，且 **browse / review 都是同一套顺序**。

重要：

- 这一轮已经取消了 `compact` 对正文层级的裁剪语义
- 即使 browse 侧传 `compact`，共享卡片正文也不再减少字段，只保留同一内容结构
- 后续不要再恢复“compact 只显示去味”这种实现，否则会再次违背用户要求

### 3. browse 展开模式已删除

`components/browse/word-list.tsx` 当前已经：

- 删除展开/收起按钮
- 删除 `expanded` 状态
- 浏览页卡片固定使用单一展示模式
- 删除后列表仍可即时刷新

这意味着 browse 的定位已经变成：

- 横向浏览词卡
- 删除词卡
- 查看同一套稳定正文

而不是“先看缩略卡，再手动展开详情”。

### 4. AI 生成目标已从“本文解释”改为“考研迁移”

`lib/ai/client.ts` 当前 prompt 约束重点：

- 目标不是只解释本文，而是生成**适合整个考研复习迁移**的词卡
- `meaning` 优先输出 **2 个极简、通用义项**
- `originalSentence` 只允许 **1 条关键原文**
- `usageExplanation` 只保留 **1 条短记忆/词根提示**
- `deodorizedMeaning` 明确要求去掉翻译腔、词典腔、硬译腔

用户对“去味”的最终定义：

- **去味 = 剔除翻译腔，用中国人很容易理解的话解释这个词常见是什么意思**
- 不是复述原句
- 不是词典口吻
- 不是“表示某种含义”“引申为”这类空话

### 5. parser 负责把模型漂移压回稳定展示格式

`lib/ai/parser.ts` + `lib/utils/text.ts` 当前新增/确认的兜底规则：

- `spell` 统一格式化为：**首字母大写，其余小写**
- `meaning` 会被收敛成最多 2 个中文义项
- `originalSentence` / `usageExplanation` / `deodorizedMeaning` 只保留首条/首行
- `sourceTextId` 展示文案统一格式化为 `TEXT1` ~ `TEXT4`

原则：

- prompt 先约束生成方向
- parser 再做轻量规范化
- UI 不承担内容清洗职责

### 6. Record 页文案已统一为 `TEXT`

当前录入页相关文案与默认值已经统一：

- `components/record/record-prompt-form.tsx`：展示 `TEXT`
- `SOURCE_TEXT_OPTIONS`：`TEXT1` ~ `TEXT4`
- `lib/hooks/use-record-draft.ts`：默认 `sourceTextId = "TEXT1"`

底层字段语义仍然是 `sourceTextId`，没有改表结构。

### 7. 这一轮顺手修掉了一个已有的 browse lint 问题

`components/browse/word-list.tsx` 里：

- 去掉了 `useEffect` 中同步 `setState` 的旧写法
- 改为通过 `boundedActiveIndex` 在渲染层收敛越界索引

这是为了适配当前 React 19 / Next 16 的 lint 约束，不属于功能扩张。
  - 底部动作按钮区

这样 review 与 browse/settings 在视觉骨架上更统一，但仍保留各自任务型页面的交互差异。

### 6. 验证结论

已执行：

- `npm run build`：通过
- `npm run lint`：未通过，但失败点仍主要来自 `android/app/src/main/assets/public/_next/static/**` 下的构建产物，不是这一轮业务修改直接引入的问题

因此这轮改动当前可以认为：

- 业务代码可构建
- 主要闭环已打通
- 若后续要清理 lint，需要优先处理 Android 静态产物的 ESLint 扫描范围

## 最新进展补充（2026-03-30，第四轮）

### 1. 本轮又补齐了“手机优先”的两个关键方向

本轮真正落地的重点不是继续堆 UI，而是：

- 补齐本地备份导入导出，保证本地词库可迁移
- 收紧词卡内容结构，让卡片更适合考研复习
- 持续把录入页往手机操作闭环收敛

涉及的主要源码：

- `app/settings/page.tsx`
- `components/settings/settings-form.tsx`
- `lib/db/backup.ts`
- `lib/db/queries.ts`
- `lib/db/mutations.ts`
- `types/db.ts`
- `lib/ai/client.ts`
- `lib/ai/parser.ts`
- `lib/utils/text.ts`
- `components/common/word-card.tsx`
- `components/record/record-prompt-form.tsx`
- `app/record/page.tsx`

### 2. 设置页已经具备本地 JSON 备份闭环

当前已实现：

- 导出本地备份 JSON
- 导入本地备份 JSON
- 两种导入模式：
  - `replace`：覆盖本机词库
  - `append`：仅追加新词
- 追加模式按 `spell + year + sourceTextId + meaning` 去重，不依赖 `id`

这是非常关键的真实需求，不是“锦上添花”功能。用户明确说过：项目还要持续开发，但他现在着急在手机上使用，所以必须先保证词库迁移与备份。

### 3. AI 词卡策略已改成“最短语境 + 两层去味”

当前约束已经不是“解释文章”，而是“生成更适合长期复习的词卡”。

已落地规则：

- `originalSentence`：必须是最短可辨识语境，不鼓励长句摘录
- `deodorizedMeaning`：保留两层
  1. 白话解释
  2. 考研常考法 / 常见误判点
- parser 允许 `deodorizedMeaning` 保留最多两行

注意：这轮的目标是把卡片从“阅读讲解卡”拉回“考研复习卡”。

### 4. 共享词卡内容占比已重排

`components/common/word-card.tsx` 当前重点顺序已经调整为：

- 主重点：`meaning`
- 次重点：`deodorizedMeaning`
- 辅助：`usageExplanation`
- 更弱辅助：`originalSentence`

也就是说，原句现在只是帮助识别语境，不再充当主要记忆负担。

### 5. 本轮 APK 打包已修通（2026-03-31）

当前 APK 已经可以在本机打包成功，产物路径：

- `android/app/build/outputs/apk/debug/app-debug.apk`

这次真正踩到并已解决的问题有三类：

1. **Android SDK 指到了旧系统目录**
   - 原来 `android/local.properties` 指向 `/usr/lib/android-sdk`
   - 该目录缺少所需组件/许可证
   - 现已改为：`sdk.dir=/home/liquidcrystal/Android/Sdk`

2. **JDK 17 不够，Android 构建链要求 Java 21**
   - 现已验证可用 JDK：`/home/liquidcrystal/jdk-21.0.10+7`
   - 如果用 JDK 17，会报：`invalid source release: 21`

3. **Cordova 旧依赖带入废弃 Kotlin jdk7/jdk8 标准库，导致重复类冲突**
   - 已在 `android/build.gradle` 的 `allprojects { configurations.configureEach { ... } }` 中全局排除：
     - `org.jetbrains.kotlin:kotlin-stdlib-jdk7`
     - `org.jetbrains.kotlin:kotlin-stdlib-jdk8`
   - 否则会在 `checkDebugDuplicateClasses` 阶段失败

### 6. 下次如何自己打包 APK

前提：

- Android SDK 使用：`/home/liquidcrystal/Android/Sdk`
- JDK 21 使用：`/home/liquidcrystal/jdk-21.0.10+7`
- 项目根目录：`/home/liquidcrystal/Vocabulary2`

#### 一条命令直接打 debug APK

```bash
export JAVA_HOME="/home/liquidcrystal/jdk-21.0.10+7"
export PATH="$JAVA_HOME/bin:$PATH"
cd "/home/liquidcrystal/Vocabulary2"
npm run apk:debug
```

这条命令实际会执行：

1. `npm run build`
2. `npx cap sync android`
3. `cd android && ./gradlew assembleDebug`

#### 成功后 APK 位置

```bash
/home/liquidcrystal/Vocabulary2/android/app/build/outputs/apk/debug/app-debug.apk
```

#### 如果想分步排查

```bash
export JAVA_HOME="/home/liquidcrystal/jdk-21.0.10+7"
export PATH="$JAVA_HOME/bin:$PATH"
cd "/home/liquidcrystal/Vocabulary2"
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

#### 常见失败判断

1. 报 `invalid source release: 21`
   - 说明你没切到 JDK 21

2. 报 Android SDK packages / licenses 缺失
   - 先检查 `android/local.properties` 是否仍指向 `/home/liquidcrystal/Android/Sdk`
   - 再去 Android Studio SDK Manager 补组件/许可证

3. 报 Kotlin duplicate classes（`kotlin-stdlib-jdk7/jdk8`）
   - 说明 `android/build.gradle` 里的全局排除被改没了，需要恢复

- `UnknownHostException: github.com`

为绕过这个问题，本轮做了一个**仅本机临时**处理：

- 把 `android/gradle/wrapper/gradle-wrapper.properties` 里的 `distributionUrl`
- 临时改成指向根目录本地 zip：
  - `file:///home/liquidcrystal/Vocabulary2/gradle-8.11.1-all.zip`

注意：

- 这个改动只是为了当前机器临时打包
- **不应该默认提交到仓库**，因为它带有本机绝对路径

#### 第二段失败：Android SDK 缺组件 / license 未接受

在解决 Gradle zip 之后，构建继续往前走，随后又卡在 Android SDK：

已确认本机 SDK 路径是：

- `/usr/lib/android-sdk`

并已写入：

- `android/local.properties`
  - `sdk.dir=/usr/lib/android-sdk`

但这台环境仍然缺或未就绪：

- `platforms;android-35`
- `build-tools;34.0.0`
- 对应 licenses 也未接受

而项目当前 Android 配置要求：

- `android/variables.gradle`
  - `compileSdkVersion = 35`
  - `targetSdkVersion = 35`

所以本轮 APK 最终失败的根本原因是：

- **Android 构建环境不完整**
- 不是业务代码报错
- 不是 Next / React / Capacitor 代码本身不可构建

### 6. 下一个 AI 应该怎么引导用户继续 APK

下次继续时，不要先改业务代码，直接先处理环境。

推荐顺序：

1. 检查 `android/gradle/wrapper/gradle-wrapper.properties`
   - 如果里面还是本机绝对路径的 `file:///home/liquidcrystal/Vocabulary2/gradle-8.11.1-all.zip`
   - 先判断是否继续沿用本地 zip，还是恢复官方下载地址
2. 检查 `android/local.properties` 是否存在
   - 当前本机写的是：`sdk.dir=/usr/lib/android-sdk`
3. 检查 `/usr/lib/android-sdk` 是否已有：
   - `platforms/android-35`
   - `build-tools/34.0.0`
4. 如果没有，先引导用户安装 SDK 组件并接受 licenses
5. 然后再执行：
   - `npm run apk:debug`
6. 成功后记录 APK 输出路径

### 8. 浏览页卡片已切到 browse 专属实现（2026-03-31）

这一轮用户连续收紧了范围，最终落地的是一版**只服务 browse 页面**的专属卡片，而不是继续改共享 `WordCard`。

当前状态：

- 新增 `components/browse/browse-word-card.tsx`
- `components/browse/word-list.tsx` 已改为接入 `BrowseWordCard`
- review 结果卡仍走共享 `components/common/word-card.tsx`
- record 页面未联动

用户这轮的核心要求：

- 卡片必须固定高度，适合手机一屏浏览
- 先只看 browse 效果，review / record 后面再说
- 删掉会占空间但当前不必要的信息和操作

### 9. browse 页面当前交互与结构（2026-03-31）

当前 browse 页实现重点：

1. **搜索栏已压缩**
   - `components/browse/browse-search-bar.tsx` 只保留关键词搜索框
   - 年份筛选、文章筛选 UI 已删除

2. **浏览方式改为纯横向滑动**
   - `components/browse/word-list.tsx` 删除了左右切换按钮
   - 现在只保留横向 scroll snap 滑动
   - 卡片宽度已拉宽到接近容器满宽（当前项约 `w-[94%]`）

3. **browse 卡片信息架构已收紧**
   - Header：单词 + 词性 + 态度标签 + 删除按钮
   - Body 第一块：`【释义】`
   - Body 第二块：`【考点逻辑】`
     - `1.原句:` + 原句内容（同行）
     - `2.记忆词根:` + 记忆/词根内容（同行）
     - `3.去味:` + 去味内容（同行）
   - Footer 中的年份 / 来源已删除

4. **删除交互仍保留，但做成卡片内联确认**
   - 点击删除后，在卡片内部显示确认区
   - 支持取消与确认删除
   - 删除后列表会自动刷新

5. **这轮目标是做减法，不做通用抽象**
   - 当前不要急着把 browse 这套结构抽回共享层
   - 先把手机浏览体验做顺
   - 后续是否让 review / record 跟进，必须等用户再次确认

### 10. 本轮验证结果

本轮 browse 改动已验证：

- `npm run build`：通过
- `/browse` 正常生成
- `/record`、`/review`、`/settings` 未因 browse 专属卡片改动而被破坏

如果后续继续改 browse，优先原则仍然是：

- 保持固定高度
- 保持手机优先
- 优先删减而不是加信息
- 不主动联动 review / record

## 最新进展补充（2026-03-31，第五轮）

### 1. review 已从“选项题”切到“输入词义 + AI 判题”

这一轮用户明确放弃了原先的干扰项选择题模式，改为：

- 在 `meaning` 阶段显示一个老式打字输入框
- 用户自己输入中文词义
- AI 判断是否抓住核心含义
- 正确写 `success`，错误写 `fail`

当前落点：

- `app/review/page.tsx`
- `components/review/review-sections.tsx`
- `lib/hooks/use-review-stage.ts`
- `lib/ai/client.ts`
- `lib/ai/parser.ts`
- `types/ai.ts`

### 2. meaning 阶段现在是“复古输入交互”，不是按钮题

当前 `components/review/review-sections.tsx` 中：

- 中间区域是可聚焦的复古输入面板
- 实际输入框隐藏，用于承接手机键盘输入
- 面板里展示用户当前输入和闪烁光标
- 仍保留“遗忘 / 跳过”入口

这意味着后续如果继续改 review：

- 不要再把 `meaning` 阶段默认改回选项题
- 输入式判题已经是当前确认方向
- UI 应继续服务“手机快速输入”而不是复杂答题器

### 3. AI 判题链路与单词生成链路现在是两条独立通道

`lib/ai/client.ts` 当前已经明确拆成两条用途不同的 AI 调用：

1. **generateWordDraft**
   - 用于录入页根据真题正文生成单词卡草稿
2. **judgeMeaningAnswer**
   - 用于 review 阶段判断用户输入的中文释义是否正确

不要把两条链路混成一个 prompt 模板。

原则：

- 录入生成：强调语境、考研迁移、稳定 JSON
- 复习判题：强调语义是否抓住核心，不抠字面一致

### 4. 单词生成 prompt 已改成双层结构

这是本轮最重要的约束之一。

当前 `lib/ai/client.ts` 中：

- `ANALYZER_SYSTEM_PROMPT` 只放规则、格式、禁止项
- `buildWordGenerationPrompt()` 只放业务输入：
  - `spell`
  - `year`
  - `sourceTextId`
  - `sourceText`

不要再把“规则说明 + 业务数据”重新混回同一个 user prompt。

### 5. confusingMeaning1/2/3 已被彻底删除

用户最新要求是：

- 删除混淆义项
- 删掉**所有有关的部分**

当前已经同步从以下链路删除：

- `types/ai.ts`
- `types/db.ts`
- `lib/ai/client.ts`
- `lib/ai/parser.ts`
- `lib/hooks/use-record-draft.ts`
- `components/record/word-editor-form.tsx`
- `lib/db/mutations.ts`
- `lib/db/db.ts`
- `lib/db/backup.ts`
- `lib/db/queries.ts`

这不是“仅不展示”，而是数据契约、解析、编辑、存储、备份、检索全链路收口。

后续不要再恢复这三个字段，除非用户再次明确要求。

### 6. 现在的单词生成 JSON 契约只保留 7 个核心字段

当前 AI 生成词卡只应返回：

- `spell`
- `partOfSpeech`
- `meaning`
- `originalSentence`
- `usageExplanation`
- `sentiment`
- `deodorizedMeaning`

其中：

- `deodorizedMeaning` 必须严格两行以内
  1. 白话解释
  2. 考研常见考法 / 误判点 / 语篇角色

- `originalSentence` 必须是逐字摘取原文的最短可辨识语境，并保留首尾省略号语义

### 7. parser 的职责是“收口”，不是“兜底兼容旧废字段”

当前 `lib/ai/parser.ts` 的定位非常明确：

- 解析 JSON
- 校验必须字段
- 规范化展示格式
- 拒绝缺字段或格式漂移

重要约束：

- 不要为了兼容旧输出，再把 `confusingMeaning1/2/3` 的解析逻辑加回来
- 如果模型输出漂移，优先收紧 prompt，而不是扩大 parser 宽容度

### 8. 当前验证结论

本轮最新已验证：

- `npm run build`：通过
- 全仓已无 `confusingMeaning1/2/3` 残留引用
- record 页预览与保存链路已对齐新字段结构
- review 输入判题链路可正常编译

### 9. 后续实现优先级建议

如果下一个 AI 继续工作，优先顺序应是：

1. 继续围绕手机端 review / record 闭环做减法优化
2. 保持 AI 契约稳定，不再来回改字段
3. 如要增强判题体验，优先考虑结果反馈展示，而不是恢复选择题
4. 除非用户再次明确要求，否则不要重新引入混淆义项、复杂抽题器或额外产品化能力
