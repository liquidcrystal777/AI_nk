# 项目设计宣言：考研英语神器 (纯本地移动端 PWA/Capacitor 架构)

## 1. 项目愿景
开发一款沉浸式的、完全离线的英语单词记忆 App。用户点击桌面图标即可启动，长得像原生 App，可以在没有网络（如地铁、飞机）的环境下流畅使用。用户拥有数据自主权，可以使用自己的 AI API 接口生成单词卡片。

## 2. 核心架构纪律 (绝对红线)
- **纯前端架构**：Next.js 配置为纯静态导出 (`output: 'export'`)。图片优化关闭（unoptimized: true）。
- **严禁任何服务端依赖**：严禁 Server Actions、API Routes。所有操作数据（读取、更新）必须在顶部声明 `'use client'` 并通过本地数据库实现。
- **本地持久化唯一来源**：使用 IndexedDB 存储所有数据（用户信息、词库、设置）。推荐使用 Dexie.js (`dexie` + `dexie-react-hooks`) 进行封装。
- **禁止传统数据库**：严禁引入 SQLite、Prisma、Drizzle 等需要 Node.js 环境的库。
- **禁止二进制图标下载**：禁止使用 Node 脚本或 curl 动态生成二进制图标文件，避免环境路径报错。需要的占位图以空文件形式存在，图标使用 Lucide React。

## 3. 视觉与交互规范
- **设计风格**：极致扁平化卡片风。用柔和的投影 (`shadow-sm`, `shadow-md`) 来区分卡片层级。禁用任何复杂的 3D 渐变或擬物化装饰。
- **色彩规范**：主色调采用清华紫 (`#660874`)。主容器背景保持干净的白色 (`bg-white`)。
- **手机容器约束**：电脑调试时，主容器必须使用 `max-w-md mx-auto shadow-2xl relative overflow-hidden flex flex-col` 进行宽度限制，使其看起来像一个手机屏幕。
参考当前项目根目录的frame.svg与wordcard.png
