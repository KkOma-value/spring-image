# 🏮 Spring Image - 春节AI图像生成器

<div align="center">

![Year of the Snake 2025](https://img.shields.io/badge/🐍-Year-Snake-red)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-green)
![Better Auth](https://img.shields.io/badge/Better-Auth-orange)
![Stripe](https://img.shields.io/badge/Stripe-Payments-blueviolet)
![License](https://img.shields.io/badge/License-MIT-green)

**用AI创作中国传统新年艺术作品**

[English](#english) | [中文](#chinese)

[📖 API文档](docs/api.md) | [🧩 组件文档](docs/components.md) | [🗄️ 数据库文档](docs/database.md) | [🚀 部署指南](docs/deployment.md) | [💻 开发指南](docs/development.md)

</div>

---

## Chinese

### ✨ 特性

- **🎨 AI图像生成** - 使用 Google Gemini API 将文字或图片转换为精美的中国新年主题艺术作品
- **🖼️ 多种艺术风格** - 支持剪纸、水墨画、3D萌趣、赛博国潮、写实等多种艺术风格
- **📐 多种尺寸比例** - 支持 1:1、3:4、16:9 等多种画幅比例
- **🖼️ 图片上传转换** - 可上传自己的照片或图片，让AI转换为指定艺术风格
- **🎭 三种创作模式**:
  - **Playground** - 自由创作模式
  - **Greeting Card** - 贺卡模式
  - **Wallpaper** - 壁纸模式
- **👤 用户认证** - 基于 Better Auth 的完整用户认证系统，支持 Google OAuth
- **💳 积分系统** - 基于 Stripe 的支付系统，购买积分包进行图像生成
- **🌙 精美的中国风UI** - 精心设计的红色与金色主题，呼应春节喜庆氛围
- **📱 响应式设计** - 完美支持桌面端和移动端
- **⚡ 高性能** - Next.js 16 App Router + React 19 + 服务端组件优化

### 🚀 快速开始

#### 环境要求

- Node.js 18+
- PostgreSQL 数据库 (推荐 Supabase)
- Google Gemini API Key
- Stripe 账户 (用于支付功能)
- Vercel 账户 (用于Blob存储)

#### 安装依赖

```bash
# 使用 bun (推荐)
bun install

# 或使用 npm
npm install

# 或使用 pnpm
pnpm install
```

#### 配置环境变量

复制 `env.example` 为 `.env` 并配置：

```bash
cp env.example .env
```

编辑 `.env` 文件，配置以下必需的环境变量：

```env
# 数据库连接 (Supabase)
DATABASE_URL="postgres://postgres.[PROJECT]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgres://postgres.[PROJECT]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Better Auth 配置
BETTER_AUTH_SECRET="your-secret-key-min-32-characters-long"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Google OAuth (可选，用于社交登录)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Vercel Blob (用于图片上传)
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"

# Stripe 支付
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**获取 API Key:**
1. **Google Gemini API**: 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Supabase 数据库**: 访问 [Supabase](https://supabase.com) 创建项目
3. **Stripe**: 访问 [Stripe Dashboard](https://dashboard.stripe.com)
4. **Vercel Blob**: 访问 [Vercel Dashboard](https://vercel.com)

#### 数据库迁移

```bash
# 生成迁移文件
bun run db:generate

# 推送到数据库
bun run db:migrate

# 启动数据库可视化工具
bun run db:studio
```

#### 运行开发服务器

```bash
bun dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

#### 构建生产版本

```bash
bun run build
bun start
```

### 🎯 使用方法

1. **注册/登录** - 使用邮箱或 Google 账号登录
2. **选择模式** - 在顶部选择 Playground、Greeting Card 或 Wallpaper
3. **上传图片（可选）** - 上传你想要转换的图片，或跳过此步骤仅使用文字描述
4. **输入描述** - 在文本框中描述你想要的图像内容，或点击 "Surprise Me" 获取随机提示
5. **选择风格** - 从预设的艺术风格中选择一种
6. **点击生成** - 消耗积分生成你的专属新年艺术作品
7. **下载分享** - 保存或分享你的作品

### 🛠️ 技术栈

- **框架**: Next.js 16 (React 19)
- **语言**: TypeScript 5
- **样式**: Tailwind CSS 4
- **数据库**: PostgreSQL + Drizzle ORM
- **认证**: Better Auth
- **支付**: Stripe
- **存储**: Vercel Blob
- **AI服务**: Google Gemini API
- **UI组件**: Radix UI + shadcn/ui
- **图标**: Lucide React

### 📁 项目结构

```
spring-image/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API 路由
│   │   │   ├── auth/       # Better Auth 路由
│   │   │   ├── checkout/   # Stripe 结账
│   │   │   ├── upload/     # 文件上传
│   │   │   └── webhook/    # Stripe Webhook
│   │   ├── (routes)/       # 页面路由
│   │   │   ├── (home)/     # 首页
│   │   │   └── billing/    # 账单页面
│   │   ├── layout.tsx      # 根布局
│   │   └── globals.css     # 全局样式
│   ├── components/         # React 组件
│   │   ├── Header.tsx      # 导航头
│   │   ├── StyleCard.tsx   # 风格卡片
│   │   ├── ImageDisplay.tsx # 图像显示
│   │   └── ui/             # UI 组件
│   ├── db/                 # 数据库
│   │   ├── schema/         # Drizzle Schema
│   │   │   ├── auth/       # 认证表
│   │   │   └── billing.ts  # 账单表
│   │   └── index.ts        # 数据库连接
│   ├── lib/                # 工具函数
│   │   ├── auth/           # 认证相关
│   │   ├── billing/        # 账单相关
│   │   └── stripe.ts       # Stripe 客户端
│   └── providers/          # React Providers
├── components/             # 旧版组件 (迁移中)
├── services/               # API服务
│   └── geminiService.ts    # Gemini API封装
├── drizzle/                # 数据库迁移文件
├── docs/                   # 项目文档
│   ├── api.md             # API文档
│   ├── components.md      # 组件文档
│   ├── database.md        # 数据库文档
│   ├── deployment.md      # 部署指南
│   └── development.md     # 开发指南
├── constants.ts           # 常量配置
├── types.ts               # TypeScript类型
└── next.config.ts         # Next.js配置
```

### 📄 许可证

MIT License

### 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## English

### ✨ Features

- **🎨 AI Image Generation** - Transform text or images into beautiful Chinese New Year themed artwork using Google Gemini API
- **🖼️ Multiple Art Styles** - Paper cutting, ink painting, 3D cute, cyberpunk oriental, realistic, and more
- **📐 Multiple Aspect Ratios** - Support for 1:1, 3:4, 16:9 and more
- **🖼️ Image Upload** - Upload your own photos for style transformation
- **🎭 Three Creation Modes**:
  - **Playground** - Free creation mode
  - **Greeting Card** - Card mode
  - **Wallpaper** - Wallpaper mode
- **👤 Authentication** - Complete user auth system based on Better Auth with Google OAuth support
- **💳 Credit System** - Stripe-based payment system for purchasing credit packs
- **🌙 Beautiful Chinese UI** - Red and gold theme celebrating the festive atmosphere
- **📱 Responsive Design** - Perfect for desktop and mobile
- **⚡ High Performance** - Next.js 16 App Router + React 19 + Server Components optimization

### 🚀 Quick Start

#### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended)
- Google Gemini API Key
- Stripe account (for payments)
- Vercel account (for Blob storage)

#### Install Dependencies

```bash
bun install
# or
npm install
# or
pnpm install
```

#### Configure Environment Variables

```bash
cp env.example .env
```

Required environment variables:

```env
# Database (Supabase)
DATABASE_URL="postgres://..."
DIRECT_URL="postgres://..."

# Better Auth
BETTER_AUTH_SECRET="your-secret-key"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Google OAuth (optional)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Vercel Blob
BLOB_READ_WRITE_TOKEN="..."

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Database Migration

```bash
bun run db:generate
bun run db:migrate
bun run db:studio
```

#### Run Development Server

```bash
bun dev
```

Visit [http://localhost:3000](http://localhost:3000)

#### Build for Production

```bash
bun run build
bun start
```

### 🛠️ Tech Stack

- **Framework**: Next.js 16 (React 19)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Better Auth
- **Payments**: Stripe
- **Storage**: Vercel Blob
- **AI Service**: Google Gemini API
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React

### 📄 License

MIT License

### 🤝 Contributing

Issues and Pull Requests are welcome!

---

<div align="center">
Made with ❤️ for the Spring Festival
</div>
