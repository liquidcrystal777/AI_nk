# Vocabulary2

一个纯本地的考研英语背词工具：

- 从阅读语境生成单词卡
- 本地保存词卡与设置
- 在浏览与复习页完成记忆训练闭环

## 开发启动

```bash
npm run dev
```

请优先使用 `http://localhost:3000` 访问开发环境。

说明：Next.js 16 开发模式下，如果直接用 `127.0.0.1` 访问，可能触发 `allowedDevOrigins` 限制，导致 HMR WebSocket 报错；这不影响生产构建，但会干扰本地调试体验。

## 构建验证

```bash
npm run build
```

## 本地存储

项目使用 Dexie + IndexedDB 作为本地持久层，核心库名为 `vocabulary-local-db`。

当前要求：

- `settings` store 必须存在
- `words` store 必须存在
- 设置页保存后，配置需要能在刷新后继续保留

已在 `lib/db/db.ts` 中补充设置存储迁移兜底：历史异常本地库在升级时会自动补齐 `settings` 记录，避免出现“保存按钮点击后不落库、刷新后回退默认值”的问题。

## 主要页面

- `/`：首页
- `/browse`：浏览词库
- `/record`：录入新词
- `/review`：开始复习
- `/settings`：本地设置
