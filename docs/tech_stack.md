# 技术栈与依赖规范

## 1. 核心框架
- **Next.js (App Router)**：仅作为 React 框架使用，强制配置为纯静态应用。
- **TypeScript**：保证严谨的类型推断。

## 2. 本地持久化 (核心)
- **Dexie.js** (`dexie` + `dexie-react-hooks`)：用于封装 IndexedDB，替代所有服务端数据库。这是 App 数据离线保存的唯一来源。

## 3. UI 与样式
- **Tailwind CSS**：用于所有样式编写。
- **Lucide React** (`lucide-react`)：用于所有界面图标（如设置齿轮、返回箭头等），禁止使用外部图片图标。

## 4. AI 接口通信
- 纯前端 `fetch` API 直接调用大模型接口，参数由 Dexie 数据库中读取，不经过任何本地后端代理。
