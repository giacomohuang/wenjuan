# 微问卷

一个现代化的问卷调查系统，支持问卷创建、发布、数据收集和统计分析。本项目采用 monorepo 架构，包含管理后台（admin）、API 服务（api）和移动端应用（uniapp）三个子项目。

## 🌟 核心特性

- 💡 现代化的技术栈：基于 Vue 3 + Node.js 的全栈解决方案
- 📦 Monorepo 工程化：使用 pnpm workspace 统一管理项目
- 🎨 优雅的 UI 设计：基于 Ant Design Vue 的精美界面
- 🔐 完善的权限控制：基于 JWT 的用户认证和权限管理
- 📱 多端适配：支持 PC 管理端和移动端答题
- 💾 可靠的数据存储：MongoDB 数据库 + MinIO 对象存储

## 📋 问卷功能说明

### 问卷编辑器

- 🎯 丰富的题型支持
  - 单选题：支持选项填空、必答设置
  - 多选题：支持最少/最多选择数量限制、选项填空
  - 填空题：支持单项/多项填空、字数限制、必答设置
  - 图片选择题：支持图片上传、选项文字说明
  - 评分题：支持自定义分值范围、半分设置、自定义图标
  - NPS题：支持0-10分打分、自定义标签说明

### 问卷设置

- 📝 基础设置
  - 问卷标题和描述
  - 收集起止时间设置
  - 答题时间限制
  - 提交次数限制（单次/每日/每周/每月）
  - 问卷标签管理
- 🎨 显示设置
  - 答题进度展示
  - 题号显示
  - 每页一题模式

### 逻辑设置

- ⚡ 跳转逻辑
  - 选项条件跳转
  - 分值范围跳转
  - 填空内容跳转
- 🔄 显示逻辑
  - 题目显示/隐藏
  - 选项显示/隐藏

### 数据收集与分析

- 📱 答题功能
  - 实时保存答案
  - 必答题验证
  - 选项填空验证
  - 提交次数控制
  - 答题时间控制
- 💾 数据存储
  - MinIO 对象存储
  - 分片上传支持
  - MongoDB 数据库

### 系统功能

- 👥 用户管理
  - JWT 身份验证
  - 权限控制
- 🎨 资源管理
  - SVG 图标管理
  - 图标优化处理

## 功能特性

### 管理后台 (Admin)

- 📋 问卷管理
  - 创建、编辑、删除问卷
  - 问卷发布和下线
- 📊 数据统计
  - 数据可视化展示
  - 数据导出功能
- 👥 用户管理
  - 用户权限控制
  - 角色管理
- 🎨 自定义主题
  - SVG 图标管理

### API 服务 (API)

- 🔐 认证授权
  - JWT 身份验证
  - 权限控制
- 📁 文件存储
  - MinIO 对象存储
  - 分片上传
  - SVG 图标优化
- 📝 问卷业务
  - 问卷 CRUD 接口
  - 数据统计接口
  - 用户管理接口

### 移动端 (UniApp)

- 📱 跨平台支持
  - iOS
  - Android
  - H5
- 📋 问卷填写
  - 在线填写问卷
  - 离线数据存储
  - 自动保存草稿

## 技术栈

### 前端 (Admin)

- Vue 3 + Vite
- Ant Design Vue
- Pinia 状态管理
- Vue Router
- TipTap 富文本编辑器
- SCSS

### 后端 (API)

- Node.js
- Koa.js
- MongoDB + Mongoose
- MinIO 对象存储
- JWT 认证
- SVGO 图标优化

### 移动端 (UniApp)

- Vue 3
- UniApp
- Pinia

## 开始使用

### 环境要求

- Node.js >= 18
- MongoDB >= 5.0
- MinIO Server
- pnpm >= 8.0

### 安装

```bash
# 克隆项目
git clone [项目地址]

# 安装依赖
pnpm install

# 启动管理后台
pnpm dev:admin

# 启动 API 服务
pnpm dev:api

# 启动移动端
pnpm dev:uniapp
```

### 环境变量配置

在 api 目录下创建 .env 文件：

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/wenjuan
JWT_SECRET=your_jwt_secret
OSS_ACCESS_KEY=your_minio_access_key
OSS_SECRET_KEY=your_minio_secret_key
```

### 构建部署

```bash
# 构建管理后台
pnpm build:admin

# 构建 API 服务
pnpm build:api

# 构建移动端
pnpm build:uniapp
```

## 项目结构

```
wenjuan/
├── packages/
│   ├── admin/          # 管理后台
│   ├── api/            # API 服务
│   └── uniapp/         # 移动端应用
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## 开发指南

### 代码规范

- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 遵循 Vue 3 组合式 API 的最佳实践

### 提交规范

提交信息格式：

```
<type>(<scope>): <subject>

<body>
```

type 类型：

- feat: 新功能
- fix: 修复
- docs: 文档
- style: 格式
- refactor: 重构
- test: 测试
- chore: 构建过程或辅助工具的变动

## 贡献指南

1. Fork 本仓库
2. 创建特性分支
3. 提交你的改动
4. 推送到你的分支
5. 创建 Pull Request

## 许可证

MIT License
