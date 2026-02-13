# 开发指南

本文档为 Spring Image 项目的开发指南，包含代码规范、项目结构和开发流程。

## 目录

- [开发环境](#开发环境)
- [项目结构](#项目结构)
- [代码规范](#代码规范)
- [Git 工作流](#git-工作流)
- [调试技巧](#调试技巧)

---

## 开发环境

### 必需工具

| 工具 | 版本 | 说明 |
|------|------|------|
| Node.js | 18+ | 运行环境 |
| Bun | 1.0+ | 推荐包管理器 |
| Git | 2.30+ | 版本控制 |
| VS Code | 最新 | 推荐编辑器 |

### 推荐 VS Code 扩展

- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **Tailwind CSS IntelliSense** - Tailwind 提示
- **TypeScript Importer** - 自动导入
- **Thunder Client** - API 测试

### 环境设置

```bash
# 1. 克隆仓库
git clone <repository-url>
cd spring-image

# 2. 安装依赖
bun install

# 3. 配置环境变量
cp env.example .env
# 编辑 .env 文件

# 4. 运行数据库迁移
bun run db:migrate

# 5. 启动开发服务器
bun dev
```

---

## 项目结构

```
spring-image/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API 路由
│   │   │   ├── auth/          # Better Auth 路由 ([...all])
│   │   │   ├── checkout/      # Stripe 结账
│   │   │   │   └── route.ts
│   │   │   ├── upload/        # 文件上传
│   │   │   │   └── route.ts
│   │   │   └── webhook/       # Stripe Webhook
│   │   │       └── route.ts
│   │   ├── (routes)/          # 分组路由
│   │   │   ├── (home)/        # 首页
│   │   │   │   └── page.tsx
│   │   │   └── billing/       # 账单页面
│   │   │       └── page.tsx
│   │   ├── layout.tsx         # 根布局
│   │   ├── page.tsx           # 首页
│   │   └── globals.css        # 全局样式
│   │
│   ├── components/            # React 组件
│   │   ├── Header.tsx         # 导航头
│   │   ├── StyleCard.tsx      # 风格卡片
│   │   ├── ImageDisplay.tsx   # 图像显示
│   │   └── ui/                # UI 组件
│   │       ├── Icons.tsx      # 图标集合
│   │       └── ...            # shadcn/ui 组件
│   │
│   ├── db/                    # 数据库
│   │   ├── schema/            # Drizzle Schema
│   │   │   ├── auth/          # Better Auth 表
│   │   │   │   └── ...
│   │   │   ├── billing.ts     # 账单相关表
│   │   │   └── index.ts       # 导出
│   │   └── index.ts           # 数据库连接
│   │
│   ├── lib/                   # 工具函数
│   │   ├── auth/              # 认证相关
│   │   │   ├── client.ts      # 客户端 auth
│   │   │   └── get-session.ts # 服务端 session
│   │   ├── billing/           # 账单相关
│   │   │   └── constants.ts   # 积分常量
│   │   └── stripe.ts          # Stripe 客户端
│   │
│   └── providers/             # React Providers
│       └── ...
│
├── components/                # 旧版组件 (迁移中)
├── services/                  # API 服务
│   └── geminiService.ts       # Gemini API
├── drizzle/                   # 数据库迁移
│   └── ...
├── docs/                      # 文档
├── public/                    # 静态资源
├── constants.ts               # 应用常量
├── types.ts                   # 类型定义
├── next.config.ts             # Next.js 配置
├── drizzle.config.ts          # Drizzle 配置
└── package.json
```

---

## 代码规范

### TypeScript 规范

#### 类型定义

```typescript
// ✅ 使用接口定义对象类型
interface User {
  id: string;
  email: string;
  name?: string;  // 可选属性
}

// ✅ 使用类型别名定义联合类型
type Status = "pending" | "success" | "error";

// ✅ 函数返回类型显式声明
async function fetchUser(id: string): Promise<User> {
  // ...
}
```

#### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件 | PascalCase | `Header.tsx`, `StyleCard.tsx` |
| 函数 | camelCase | `getUserById`, `handleSubmit` |
| 常量 | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `API_BASE_URL` |
| 类型/接口 | PascalCase | `User`, `GenerationConfig` |
| 文件 | camelCase 或 kebab-case | `get-session.ts`, `geminiService.ts` |

### React 规范

#### 组件结构

```typescript
"use client"; // 如需客户端交互

import { useState, useEffect } from "react";
import { SomeType } from "@/types";

// 类型定义
interface Props {
  title: string;
  onAction: () => void;
}

// 组件
export const ComponentName = ({ title, onAction }: Props) => {
  // 状态
  const [count, setCount] = useState(0);

  // 副作用
  useEffect(() => {
    // ...
  }, []);

  // 处理函数
  const handleClick = () => {
    setCount(c => c + 1);
    onAction();
  };

  // 渲染
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={handleClick}>Count: {count}</button>
    </div>
  );
};
```

#### Hooks 规则

- 只在最顶层调用 Hooks
- 只在 React 函数中调用 Hooks
- 自定义 Hooks 以 `use` 开头

```typescript
// ✅ 自定义 Hook
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
```

### 样式规范

#### Tailwind 类排序

```html
<!-- ✅ 按类别排序 -->
<div class="
  /* 布局 */
  flex items-center justify-between
  /* 尺寸 */
  w-full h-12 px-4
  /* 外观 */
  bg-white rounded-lg shadow-md
  /* 交互 */
  hover:bg-gray-50 cursor-pointer
  /* 状态 */
  disabled:opacity-50
">
```

#### 自定义类

```css
/* globals.css */
@layer components {
  .glass-panel {
    @apply bg-white/5 backdrop-blur-md border border-white/10 rounded-xl;
  }
}
```

### API 规范

#### 路由处理

```typescript
// app/api/example/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await fetchData();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // 验证输入...
    const result = await createData(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    // 错误处理...
  }
}
```

---

## Git 工作流

### 分支策略

```
main/master     生产分支
  ↑
develop         开发分支
  ↑
feature/*       功能分支
hotfix/*        热修复分支
```

### 提交规范

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型**:
- `feat`: 新功能
- `fix`: 修复
- `docs`: 文档
- `style`: 格式（不影响代码运行）
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具

**示例**:
```bash
git commit -m "feat(auth): add Google OAuth login"
git commit -m "fix(api): handle stripe webhook timeout"
git commit -m "docs: update deployment guide"
```

### 开发流程

```bash
# 1. 创建功能分支
git checkout -b feature/add-credit-system

# 2. 开发并提交
git add .
git commit -m "feat: implement credit balance system"

# 3. 推送到远程
git push origin feature/add-credit-system

# 4. 创建 Pull Request
# 在 GitHub 上创建 PR，请求合并到 develop

# 5. 代码审查后合并
```

---

## 调试技巧

### 服务端调试

```typescript
// 添加详细日志
console.log("[DEBUG] User ID:", userId);
console.log("[DEBUG] Session:", JSON.stringify(session, null, 2));

// 使用 debugger（需在 Node 启用 inspect）
debugger;
```

### 客户端调试

```typescript
// React DevTools
// 安装浏览器扩展

// 性能分析
console.time("operation");
await someOperation();
console.timeEnd("operation");
```

### 数据库调试

```bash
# 启动 Drizzle Studio
bun run db:studio

# 查看 SQL 日志
# 在 drizzle 配置中启用 logger
```

### 常见问题

#### 热重载失效

```bash
# 清除缓存
rm -rf .next
bun dev
```

#### 类型错误

```bash
# 检查类型
bunx tsc --noEmit
```

#### 数据库连接失败

```bash
# 测试连接
bun run db:studio
```

---

## 性能优化

### 图片优化

```tsx
// ✅ 使用 Next.js Image
import Image from "next/image";

<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority  // 首屏图片
/>
```

### 代码分割

```tsx
// ✅ 动态导入
const HeavyComponent = dynamic(
  () => import("@/components/HeavyComponent"),
  { loading: () => <Skeleton /> }
);
```

### 数据获取

```tsx
// ✅ 使用 React Server Components
async function Page() {
  const data = await fetchData(); // 服务端获取
  return <Component data={data} />;
}
```

---

## 测试

### 运行测试

```bash
# 单元测试
bun test

# E2E 测试 (需配置 Playwright)
bun run test:e2e
```

### 测试示例

```typescript
import { describe, it, expect } from "bun:test";

describe("utils", () => {
  it("should format currency correctly", () => {
    expect(formatCurrency(999)).toBe("$9.99");
  });
});
```

---

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### PR 检查清单

- [ ] 代码通过 TypeScript 检查
- [ ] 没有控制台警告
- [ ] 添加必要的类型定义
- [ ] 更新相关文档
