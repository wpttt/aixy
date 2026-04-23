# AI 导航中心

一个基于 Next.js 的 AI 应用导航页面，支持自定义链接卡片、亮暗主题切换和可视化配置。

## 功能特性

- **链接卡片管理** - 通过配置页面添加、编辑、删除链接卡片
- **URL 链接卡片** - 每个卡片可配置外部链接，点击后在新标签页打开
- **自定义网站 Logo** - 支持上传图片作为网站 Logo
- **亮暗主题切换** - 支持亮色和暗色主题，偏好保存在浏览器本地
- **可视化配置** - 无需修改代码，通过管理页面即可配置所有内容

---

## 本地部署

### 1. 克隆代码

```bash
git clone https://github.com/wpttt/aixy.git
cd aixy
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，修改配置：

```env
ADMIN_PASSWORD=你的密码
RAG_BASE_URL=http://localhost/v1
RAG_API_KEY=你的API密钥
```

> 注意：`ADMIN_PASSWORD` 是服务端环境变量，修改后重启服务生效。

### 4. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看页面。

### 5. 生产环境构建

```bash
npm run build
npm start
```

---

## Docker 部署

### 前置要求

- Docker Desktop 已安装并运行
- Docker Compose 已安装

### 1. 克隆代码

```bash
git clone https://github.com/wpttt/aixy.git
cd aixy
```

### 2. 创建配置文件

复制环境变量和应用配置文件：

```bash
cp .env.example .env
cp apps-config.example.json apps-config.json
```

### 3. 启动容器

```bash
docker-compose up -d --build
```

### 4. 访问应用

部署成功后访问 `http://localhost:3000`（或自定义端口）

### 5. 修改端口

编辑 `docker-compose.yml`，修改 `ports` 左边的宿主机端口：

```yaml
services:
  app:
    ports:
      - "3330:3000"   # 宿主机 3330 -> 容器内 3000
```

### 常用命令

```bash
# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 更新代码后重新部署
docker-compose up -d --build

# 完全重建
docker-compose down -v
docker-compose up -d --build
```

### 数据持久化

部署后通过页面上传的内容挂载在以下目录：

| 路径 | 说明 |
|------|------|
| `./apps-config.json` | 应用配置文件 |
| `./public/logos` | 上传的 Logo 文件 |

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `ADMIN_PASSWORD` | 配置管理页面访问密码 | `123456` |
| `NODE_ENV` | 运行环境 | `production` |
| `PORT` | 容器内监听端口（固定 3000） | `3000` |

> Docker 部署时，修改 `.env` 中的 `ADMIN_PASSWORD` 后执行 `docker-compose up -d --build` 重新构建生效。

### 配置管理

访问 `http://localhost:3000/admin`（或自定义端口），输入密码（默认：`123456`）进入配置页面。

---

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

## 技术栈

- **框架**: Next.js 16
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **语言**: TypeScript

## 注意事项

- 主题偏好保存在浏览器的 `localStorage` 中，不同用户看到的主题互相独立
- 卡片必须配置「链接地址」才能点击跳转，否则会提示「此应用尚在开发中」
- 上传的 Logo 保存在 `public/logos/` 目录
