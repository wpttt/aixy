# AI 导航中心

一个基于 Next.js 的 AI 应用导航页面，支持自定义链接卡片、亮暗主题切换和可视化配置。

## 功能特性

- **链接卡片管理** - 通过配置页面添加、编辑、删除链接卡片
- **URL 链接卡片** - 每个卡片可配置外部链接，点击后在新标签页打开
- **自定义网站 Logo** - 支持上传图片作为网站 Logo
- **亮暗主题切换** - 支持亮色和暗色主题，偏好保存在浏览器本地
- **可视化配置** - 无需修改代码，通过管理页面即可配置所有内容

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

### 3. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看页面。

### 4. 访问配置管理

点击页面右上角「配置管理」按钮，输入密码（默认：`123456`）进入配置页面。

## 配置说明

### 环境变量 (.env)

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `NEXT_PUBLIC_ADMIN_PASSWORD` | 配置管理页面访问密码 | `123456` |
| `RAG_BASE_URL` | RAG API 服务地址 | `http://localhost/v1` |
| `RAG_API_KEY` | RAG API 密钥 | - |

### 首页内容配置（配置管理页面）

- **首页大标题** - 首页中央醒目文字
- **首页副标题** - 大标题下方的描述
- **首页标签** - 顶部小标签文字

### 卡片配置（配置管理页面）

- **显示名称** - 卡片上显示的应用名称
- **图标 Emoji** - 卡片左上角的图标
- **链接地址** - 点击卡片跳转的目标 URL
- **链接类型** - 卡片类型标签（对话型/Agent/工作流/文本生成/链接）
- **应用简介** - 卡片的描述文字
- **标签** - 自定义标签，逗号分隔

## 项目结构

```
src/
├── app/
│   ├── admin/          # 配置管理页面
│   ├── api/            # API 路由
│   │   ├── apps/       # 应用配置读写
│   │   └── upload/     # 图片上传
│   ├── globals.css     # 全局样式
│   ├── layout.tsx      # 根布局
│   └── page.tsx        # 首页
├── components/
│   └── AppCard.tsx     # 应用卡片组件
├── lib/
│   └── utils.ts        # 工具函数
├── store/
│   └── appStore.ts     # 状态管理
└── types/
    └── index.ts        # TypeScript 类型定义

public/
└── logos/              # 上传的 Logo 存放目录
```

## 构建生产版本

```bash
npm run build
npm start
```

## Docker 部署

### 使用 Docker Compose（推荐）

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止
docker-compose down
```

### 使用 Docker 命令

```bash
# 构建镜像
docker build -t aiac .

# 运行容器
docker run -d -p 3000:3000 \
  -e NEXT_PUBLIC_ADMIN_PASSWORD=123456 \
  -v ./apps-config.json:/app/data/apps-config.json:ro \
  -v ./public/logos:/app/public/logos \
  --name aiac \
  aiac
```

### Docker 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `NEXT_PUBLIC_ADMIN_PASSWORD` | 配置管理页面访问密码 | `123456` |
| `NODE_ENV` | 运行环境 | `production` |

### 数据持久化

- `apps-config.json` - 应用配置文件，建议挂载为只读
- `public/logos/` - 上传的 Logo 文件目录，需要持久化

## 技术栈

- **框架**: Next.js 16
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **语言**: TypeScript

## 注意事项

- 主题偏好保存在浏览器的 `localStorage` 中，不同用户看到的主题互相独立
- 卡片必须配置「链接地址」才能点击跳转，否则会提示「此应用尚在开发中」
- 上传的 Logo 保存在 `public/logos/` 目录，请确保该目录可写
