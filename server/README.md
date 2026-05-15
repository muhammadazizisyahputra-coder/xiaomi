# Server README

这是后端服务（Express + MySQL）的说明。

1. 复制 .env.example 为 .env 并填写数据库及 MIMO 配置。
2. 安装依赖：npm install
3. 初始化数据库：运行 server/migrations/init.sql 在你的 MySQL 实例中创建数据库和表。
4. 启动：npm start

注意：生产环境请使用 migrations 工具（如 sequelize-cli）并关闭 `sequelize.sync({ force: true })`。
