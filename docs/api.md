# API 文档

本文档描述 Spring Image 应用的所有 API 端点。

## 目录

- [认证 API](#认证-api)
- [结账 API](#结账-api)
- [上传 API](#上传-api)
- [Webhook API](#webhook-api)

---

## 认证 API

基于 [Better Auth](https://better-auth.com) 的完整认证系统。

### 基础路径

```
/api/auth/*
```

### 支持的端点

Better Auth 自动提供以下端点：

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/auth/sign-in/email` | 邮箱密码登录 |
| POST | `/api/auth/sign-up/email` | 邮箱注册 |
| POST | `/api/auth/sign-out` | 登出 |
| POST | `/api/auth/callback/google` | Google OAuth 回调 |
| GET | `/api/auth/session` | 获取当前会话 |

### 客户端使用

```typescript
import { authClient } from "@/lib/auth/client";

// 登录
await authClient.signIn.email({
  email: "user@example.com",
  password: "password",
});

// 获取会话
const { data: session } = await authClient.useSession();

// 登出
await authClient.signOut();
```

---

## 结账 API

创建 Stripe 结账会话。

### 基础路径

```
POST /api/checkout
```

### 认证

需要用户登录。

### 请求

无需请求体。

### 响应

**成功 (200)**:
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

**未认证 (401)**:
```json
{
  "error": "Unauthorized"
}
```

**服务器错误 (500)**:
```json
{
  "error": "Stripe is not configured."
}
```

### 流程

1. 用户点击购买按钮
2. 前端调用 `/api/checkout`
3. 后端创建 Stripe Checkout Session
4. 返回结账 URL
5. 前端重定向到 Stripe 结账页面
6. 支付成功后重定向到 `/billing?success=true`

### 环境变量

```env
STRIPE_SECRET_KEY=sk_test_...
PRICE_ID=price_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## 上传 API

上传图片到 Vercel Blob 存储。

### 基础路径

```
POST /api/upload
```

### 请求

**Content-Type**: `multipart/form-data`

**表单字段**:
| 字段 | 类型 | 必需 | 描述 |
|------|------|------|------|
| file | File | 是 | 图片文件 |

**限制**:
- 最大文件大小: 5MB
- 允许类型: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- 速率限制: 每IP每分钟5次

### 响应

**成功 (200)**:
```json
{
  "url": "https://xxxxx.blob.vercel-storage.com/uploads/1234567890-filename.jpg",
  "success": true,
  "size": 12345
}
```

**错误响应**:

| 状态码 | 错误 | 描述 |
|--------|------|------|
| 400 | No file uploaded | 未上传文件 |
| 400 | Invalid file type | 文件类型不支持 |
| 400 | File too large | 文件超过5MB |
| 429 | Rate limit exceeded | 请求过于频繁 |
| 500 | Upload service is not configured | 未配置Blob Token |

### 使用示例

```typescript
const formData = new FormData();
formData.append("file", fileInput.files[0]);

const response = await fetch("/api/upload", {
  method: "POST",
  body: formData,
});

const data = await response.json();
console.log(data.url); // 上传后的图片URL
```

### 环境变量

```env
BLOB_READ_WRITE_TOKEN="vercel_blob_token_here"
```

---

## Webhook API

处理 Stripe Webhook 事件。

### 基础路径

```
POST /api/webhook
```

### 请求头

| 头信息 | 必需 | 描述 |
|--------|------|------|
| `stripe-signature` | 是 | Stripe 签名 |

### 请求体

Stripe Event 对象 (JSON)

### 处理的事件类型

| 事件 | 描述 |
|------|------|
| `checkout.session.completed` | 结账完成，添加积分到用户账户 |

### 流程

1. 用户在 Stripe 完成支付
2. Stripe 发送 webhook 到 `/api/webhook`
3. 验证 Stripe 签名
4. 处理 `checkout.session.completed` 事件
5. 在数据库事务中：
   - 检查是否已处理（幂等性）
   - 确保用户积分余额记录存在
   - 添加积分到用户账户
   - 记录积分交易
   - 记录支付历史

### 数据库操作

```typescript
// 事务流程
db.transaction(async () => {
  await ensureCreditBalance(userId);
  await addCreditsToUser(userId);        // +100 积分
  await recordCreditTransaction(userId, sessionId);
  await recordPaymentHistory(userId, paymentInfo, status);
});
```

### 环境变量

```env
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SECRET_KEY=sk_test_...
```

### 本地开发测试

使用 Stripe CLI 转发 webhook:

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

---

## 错误处理

所有 API 遵循统一的错误响应格式：

```json
{
  "error": "错误描述",
  "details": "详细错误信息（可选）"
}
```

## 类型定义

### 服务端会话

```typescript
interface Session {
  user: {
    id: string;
    email: string;
    name?: string;
    image?: string;
  };
}
```

### 支付信息

```typescript
interface PaymentIntentInfo {
  stripeSessionId: string;
  amountTotal: number;
  currency: string;
  paymentIntentId: string | null;
  priceId: string;
}
```
