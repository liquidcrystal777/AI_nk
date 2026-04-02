# Vocab.md

一款专为考研英语设计的智能单词记忆工具，纯本地运行，支持 AI 生成词卡与间隔复习。

## 特性

- **纯本地运行** - 数据完全存储在本地 IndexedDB，无需联网即可使用
- **AI 智能生成** - 接入任意兼容 OpenAI API 的模型，智能生成结构化词卡
- **真题语境** - 支持从考研英语真题 PDF 中提取原句语境
- **多类型词卡** - 支持普通单词、词组、熟词僻义、对比辨析四种卡片类型
- **间隔复习** - 基于遗忘曲线的复习算法，高效巩固记忆
- **深色模式** - 支持白天/夜间主题切换，保护眼睛
- **数据备份** - 支持本地 JSON 导出/导入，数据自主可控
- **Android 支持** - 通过 Capacitor 可打包为 Android 应用

## 技术栈

- **框架**: Next.js 16 (App Router)
- **运行时**: React 19 + TypeScript
- **样式**: Tailwind CSS 4
- **数据存储**: Dexie + IndexedDB
- **移动端**: Capacitor
- **AI**: 支持 DeepSeek / OpenAI / Claude 等兼容接口

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000 即可使用。

> 说明：Next.js 16 开发模式下，如果直接用 `127.0.0.1` 访问，可能触发 `allowedDevOrigins` 限制，导致 HMR WebSocket 报错；这不影响生产构建，但会干扰本地调试体验。

### 构建生产版本

```bash
npm run build
```

### 打包 Android APK

```bash
npm run apk:debug
```

APK 文件位于 `android/app/build/outputs/apk/debug/app-debug.apk`。

## 使用说明

### 1. 配置 AI

首次使用需要在设置页填写：
- **API Key** - AI 服务的 API 密钥
- **Base URL** - API 端点地址（默认 DeepSeek）
- **Model Name** - 模型名称（默认 deepseek-chat）

### 2. 录入单词

- **阅读模式** - 输入单词 + 年份 + 文章来源，从真题中提取语境
- **通用模式** - 仅输入单词，AI 生成代表性例句

### 3. 复习流程

三阶段复习法：
1. **判断态度** - 判断单词在语境中的正负态度
2. **输入词义** - 用自己的话描述词义
3. **查看结果** - 对比答案，标记掌握程度

### 4. 浏览词库

- 横向滑动查看词卡
- 支持按年份、文章来源过滤
- 支持关键词搜索

## 词卡类型

| 类型 | 说明 |
|------|------|
| 普通 | 标准单词卡片，包含释义、原句、记忆、考点 |
| 词组 | 搭配短语，强调结构拆解与搭配陷阱 |
| 熟词僻义 | 揭示常见词的生僻含义，避开理解陷阱 |
| 对比 | 双栏对比易混淆词汇（仅供查阅，不参与复习） |

## 数据安全

- 所有数据存储在本地浏览器 IndexedDB
- 备份文件为标准 JSON 格式
- 可随时导出备份到本地
- 导入支持覆盖/追加两种模式

## 项目结构

```
├── app/                    # Next.js 页面路由
│   ├── browse/            # 浏览词库
│   ├── record/            # 录入单词
│   ├── review/            # 复习单词
│   └── settings/          # 设置页
├── components/            # React 组件
│   ├── browse/           # 浏览页组件
│   ├── common/           # 通用组件
│   ├── home/             # 首页组件
│   ├── layout/           # 布局组件
│   ├── record/           # 录入页组件
│   └── review/           # 复习页组件
├── lib/                   # 核心库
│   ├── ai/               # AI 请求与解析
│   ├── db/               # 数据库操作
│   ├── hooks/            # 自定义 Hooks
│   └── utils/            # 工具函数
├── types/                 # TypeScript 类型定义
├── public/                # 静态资源
│   └── exam-papers/      # 考研真题 PDF
└── android/               # Capacitor Android 工程
```

## 许可证

MIT License

---

> 让考研阅读里的词，稳定地变成可长期积累、可本地复习、可在手机上顺手使用的个人词卡资产。