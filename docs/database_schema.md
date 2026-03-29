# 本地数据结构 (Dexie.js Schema)

## 1. 数据库单例 (`db.ts`)
创建一个单例数据库实例，包含以下两个表 (Stores)：

## 2. 表：`settings` (系统配置)
用于存储用户的自定义 AI 接口信息。
- `id`: 主键 (默认 1，只有一条记录)
- `aiApiKey`: 字符串 (sk-xxx)
- `aiBaseUrl`: 字符串 (https://api.openclaudecode.cn/v1)
- `aiModelName`: 字符串 (claude-3-5-sonnet-20241022)

## 3. 表：`words` (核心词库)
- `id`: 自增主键
- `spell`: 单词拼写 (text-5xl)
- `pronunciation`: 音标 (可选，AI生成)
- `meaning`: 中文释义 (AI生成，用户可编辑)
- `prompt`: 用于生成该卡片的提示词 (Record页输入内容)
- `year`: 考研年份 (Browse页分类依据)
- `sourceTextId`: 文章/来源 ID (Browse页分类依据)
- `originalSentence`: 包含考点的原始例句 (数组字符串)
- `status`: 记忆状态。仅限枚举值：
  - `new` (新词，未复习)
  - `vague` (模糊，记忆困难)
  - `known` (认识，基础掌握)
  - `mastered` (掌握，可长时间不复习)
- `reviewCount`: 复习次数
- `lastReviewTime`: 上次复习时间戳
- `nextReviewTime`: 下次复习时间戳 (排序主要依据)
