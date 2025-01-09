# MPAdmin

MPAdmin 是一个现代化的管理系统前端框架，基于 Vue 3 和 Ant Design Vue 构建。

## 技术栈

- 前端框架：Vue 3
- UI 组件库：Ant Design Vue 4.x
- 状态管理：Pinia
- 路由管理：Vue Router 4
- 构建工具：Vite 6
- 富文本编辑器：Tiptap
- 国际化：Vue I18n
- 工具库：dayjs, axios, js-cookie 等

## 系统要求

在开始之前，请确保你的系统已安装以下软件：

- Node.js (推荐使用最新 LTS 版本)
- MongoDB
- Redis
- Minio (用于对象存储)

## 环境搭建

### MongoDB 安装

```bash
# 安装
brew tap mongodb/brew
brew update
brew install mongodb-community
brew services start mongodb-community

# 停止服务
brew services stop mongodb-community

# 进入命令行
mongosh
```

### Redis 安装

```bash
# 安装
brew install redis
brew services start redis

# 停止服务
brew services stop redis

# 进入命令行
redis-cli
```

### Minio 安装

```bash
# 安装
brew install minio/stable/minio
minio server ~/minio_data
```

#### Minio 访问策略配置

允许直接从 URL 下载文件的策略配置：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": ["*"]
      },
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::mpadmin", "arn:aws:s3:::mpadmin/*"]
    },
    {
      "Effect": "Deny",
      "Principal": {
        "AWS": ["*"]
      },
      "Action": ["s3:DeleteBucketPolicy", "s3:DeleteObject", "s3:PutBucketPolicy", "s3:PutLifecycleConfiguration", "s3:PutObject"],
      "Resource": ["arn:aws:s3:::mpadmin", "arn:aws:s3:::mpadmin/*"]
    }
  ]
}
```

## 项目设置

1. 克隆项目

```bash
git clone https://github.com/giacomohuang/mpadmin.git
```

2. 安装依赖并启动前端应用服务器

```bash
cd mpadmin
npm install
npm run dev
```

## 开发

### 可用的脚本命令

- `npm run dev` - 启动开发环境服务器
- `npm run build` - 构建生产版本
- `npm run preview` - 预览生产构建
- `npm run serve` - 启动生产环境服务器(Nginx)
- `npm run lint` - 运行代码检查

## 推荐的 IDE 设置

### VSCode

推荐安装以下插件：

- Vue Language Features (Volar)
- ESLint
- Prettier
- Tailwind CSS IntelliSense

## 项目结构

```
mpadmin/
├── src/              # 源代码
├── public/           # 静态资源
├── plugins/          # 插件目录
├── serve/            # Nginx配置
├── dist/             # 构建输出目录
└── _docs/           # 项目文档
```

## 许可证

[MIT License](LICENSE)

```

```

# VSCode
