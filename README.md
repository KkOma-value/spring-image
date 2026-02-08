# 🏮 Spring Image - 春节AI图像生成器

<div align="center">

![Year of the Snake 2025](https://img.shields.io/badge/🐍-Year-Snake-red)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/License-MIT-green)

**用AI创作中国传统新年艺术作品**

[English](#english) | [中文](#chinese)

</div>

---

## Chinese

### ✨ 特性

- **🎨 AI图像生成** - 使用 Google Gemini API 将文字或图片转换为精美的中国新年主题艺术作品
- **🖼️ 多种艺术风格** - 支持剪纸、水墨画、年画、传统工笔、敦煌壁画等多种中国传统艺术风格
- **📐 多种尺寸比例** - 支持 1:1、3:4、16:9 等多种画幅比例
- **🖼️ 图片上传转换** - 可上传自己的照片或图片，让AI转换为指定艺术风格
- **🎭 三种创作模式**:
  - **Playground** - 自由创作模式
  - **Greeting Card** - 贺卡模式
  - **Wallpaper** - 壁纸模式
- **🌙 精美的中国风UI** - 精心设计的红色与金色主题，呼应春节喜庆氛围
- **📱 响应式设计** - 完美支持桌面端和移动端

### 🚀 快速开始

#### 环境要求

- Node.js 18+
- npm / bun / pnpm

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

编辑 `.env` 文件，添加你的 Google Gemini API Key：

```env
GEMINI_API_KEY=your_gemini_api_key_here
# 其他配置...
```

**获取 API Key:**
1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 创建新的 API Key
3. 将其复制到 `.env` 文件中

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

1. **选择模式** - 在顶部选择 Playground、Greeting Card 或 Wallpaper
2. **上传图片（可选）** - 上传你想要转换的图片，或跳过此步骤仅使用文字描述
3. **输入描述** - 在文本框中描述你想要的图像内容，或点击 "Surprise Me" 获取随机提示
4. **选择风格** - 从预设的中国传统艺术风格中选择一种
5. **选择比例** - 选择图像的宽高比（仅桌面端）
6. **点击生成** - 等待AI生成你的专属新年艺术作品

### 🛠️ 技术栈

- **框架**: Next.js 16 (React 19)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **AI服务**: Google Gemini API
- **UI组件**: Radix UI + shadcn/ui
- **图标**: Lucide React
- **包管理**: Bun

### 📁 项目结构

```
spring-image/
├── components/          # UI组件
│   ├── Header.tsx      # 导航头
│   ├── StyleCard.tsx   # 风格卡片
│   ├── ImageDisplay.tsx # 图像显示区
│   └── Icon.tsx        # 图标组件
├── services/           # API服务
│   └── geminiService.ts # Gemini API封装
├── src/
│   ├── app/           # Next.js App Router
│   ├── components/    # 页面组件
│   └── lib/           # 工具函数
├── App.tsx            # 主应用组件
├── constants.ts       # 常量配置
├── types.ts           # TypeScript类型定义
└── next.config.ts     # Next.js配置
```

### 📄 许可证

MIT License

### 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## English

### ✨ Features

- **🎨 AI Image Generation** - Transform text or images into beautiful Chinese New Year themed artwork using Google Gemini API
- **🖼️ Multiple Art Styles** - Paper cutting, ink painting, New Year prints, traditional Gongbi, Dunhuang murals, and more
- **📐 Multiple Aspect Ratios** - Support for 1:1, 3:4, 16:9 and more
- **🖼️ Image Upload** - Upload your own photos for style transformation
- **🎭 Three Creation Modes**:
  - **Playground** - Free creation mode
  - **Greeting Card** - Card mode
  - **Wallpaper** - Wallpaper mode
- **🌙 Beautiful Chinese UI** - Red and gold theme celebrating the festive atmosphere
- **📱 Responsive Design** - Perfect for desktop and mobile

### 🚀 Quick Start

#### Prerequisites

- Node.js 18+
- npm / bun / pnpm

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

Edit `.env` and add your Google Gemini API Key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Get API Key:** Visit [Google AI Studio](https://makersuite.google.com/app/apikey)

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
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Service**: Google Gemini API
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **Package Manager**: Bun

### 📄 License

MIT License

### 🤝 Contributing

Issues and Pull Requests are welcome!

---

<div align="center">
Made with ❤️ for the Spring Festival
</div>
