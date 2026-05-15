# AI Notes (微信小程序 + Node.js)

这是为仓库 `muhammadazizisyahputra-coder/xiaomi` 创建的 AI 驱动备忘录项目模版。前端为微信小程序，后端为 Node.js + Express，使用 MySQL（Sequelize）。AI 服务接入示例使用 `mimo`（请替换为真实 API 信息）。

目录简介：
- miniprogram/: 微信小程序前端源码
- server/: 后端服务 (Express)

请阅读下面的启动步骤与注意事项。

快速开始（本地）
1. 后端：
   - cd server
   - cp .env.example .env 并填写数据库及 MIMO API 配置
   - npm install
   - 执行 migrations: 使用 server/migrations/init.sql 初始化 MySQL 数据表
   - npm start

2. 前端：
   - 在微信开发者工具中打开 miniprogram 目录
   - 在 utils/api.js 中设置后端地址

部署建议：
- 如果你希望使用 Supabase，请注意 Supabase 默认数据库为 Postgres，如果要使用 Supabase 的托管功能建议将后端改为使用 Postgres（Sequelize 支持）。也可以将后端部署到 Vercel/Render/Heroku 等服务，数据库继续使用 MySQL。

安全与上线检查：
- 不要把 API 密钥写入前端
- 在微信小程序后台配置合法的 request 域名和 uploadFile 域名
- 准备隐私政策和用户协议
