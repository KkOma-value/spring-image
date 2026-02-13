# 组件文档

本文档描述 Spring Image 应用的主要 React 组件。

## 目录

- [布局组件](#布局组件)
- [功能组件](#功能组件)
- [UI 组件](#ui-组件)

---

## 布局组件

### Header

顶部导航栏组件，显示品牌标识、用户信息和导航链接。

**文件**: `src/components/Header.tsx`

**Props**: 无 (使用 useSession 获取用户状态)

**功能**:
- 滚动时背景变化效果
- 用户头像和下拉菜单
- 登录/登出按钮
- 响应式设计

**使用**:
```tsx
import { Header } from "@/components/Header";

export default function Layout() {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
}
```

**样式状态**:
| 状态 | 背景 | 内边距 |
|------|------|--------|
| 顶部 | 透明 | py-6 |
| 滚动后 | bg-red-950/80 + 模糊 | py-3 |

---

## 功能组件

### StyleCard

艺术风格选择卡片。

**文件**: `src/components/StyleCard.tsx`

**Props**:

| 属性 | 类型 | 必需 | 描述 |
|------|------|------|------|
| styleOption | StyleOption | 是 | 风格配置对象 |
| isSelected | boolean | 是 | 是否选中 |
| onSelect | (id: string) => void | 是 | 选择回调 |

**StyleOption 类型**:
```typescript
interface StyleOption {
  id: string;
  name: string;
  description: string;
  promptModifier: string;  // 发送给AI的风格修饰词
  thumbnail: string;       // 缩略图URL
}
```

**使用**:
```tsx
import { StyleCard } from "@/components/StyleCard";

<StyleCard
  styleOption={{
    id: "traditional_papercut",
    name: "Paper Cut (剪纸)",
    description: "Traditional Chinese red paper cutting art style.",
    promptModifier: "in the style of traditional Chinese red paper cutting art...",
    thumbnail: "/thumbnails/papercut.jpg"
  }}
  isSelected={selectedStyle === "traditional_papercut"}
  onSelect={(id) => setSelectedStyle(id)}
/>
```

**样式**:
- 选中状态: 金色边框 + 红色背景 + 发光效果
- 未选中: 半透明边框 + 深色背景

---

### ImageDisplay

图像显示组件，支持加载状态、下载和全屏查看。

**文件**: `src/components/ImageDisplay.tsx`

**Props**:

| 属性 | 类型 | 必需 | 描述 |
|------|------|------|------|
| imageUrl | string \| null | 是 | 图片URL |
| isLoading | boolean | 是 | 是否加载中 |
| loadingMessage | string | 否 | 加载提示文字 |

**功能**:
- 加载动画（旋转灯笼图标）
- 空状态提示
- 图片显示
- 点击全屏查看
- 下载按钮
- 分享按钮

**使用**:
```tsx
import { ImageDisplay } from "@/components/ImageDisplay";

<ImageDisplay
  imageUrl={generatedImage}
  isLoading={isGenerating}
  loadingMessage="Creating magic..."
/>
```

**状态展示**:

| 状态 | 显示内容 |
|------|----------|
| isLoading=true | 旋转加载动画 + 提示文字 |
| imageUrl=null | 占位提示 "Your masterpiece will appear here" |
| imageUrl=string | 图片 + 悬停操作栏 |

---

## UI 组件

### Icons

图标组件集合。

**文件**: `src/components/ui/Icons.tsx`

**可用图标**:

| 图标名 | 描述 |
|--------|------|
| Lantern | 灯笼图标 (品牌标识) |
| Palette | 调色板 (风格选择) |
| Image | 图片 (壁纸模式) |
| ScrollText | 卷轴 (贺卡模式) |
| Sparkles | 闪光 (生成按钮) |
| UploadCloud | 上传云 (图片上传) |
| Camera | 相机 (参考图片) |
| Wand2 | 魔杖 (描述输入) |
| Download | 下载 |
| Share2 | 分享 |
| ChevronDown | 下拉箭头 |
| ArrowRight | 右箭头 |
| X | 关闭 |
| RefreshCw | 刷新/加载 |

**使用**:
```tsx
import { Icons } from "@/components/ui/Icons";

<Icons.Lantern className="w-6 h-6 text-cny-gold" />
<Icons.Sparkles className="w-5 h-5" />
```

---

## 旧版组件

以下组件位于项目根目录的 `components/` 文件夹，正在迁移到 `src/components/`：

| 组件 | 文件 | 状态 |
|------|------|------|
| Header | `components/Header.tsx` | 待迁移 |
| StyleCard | `components/StyleCard.tsx` | 待迁移 |
| ImageDisplay | `components/ImageDisplay.tsx` | 待迁移 |
| Icon | `components/Icon.tsx` | 待迁移 |

---

## 自定义 Hooks

### useSession

获取当前用户会话。

**来源**: `@/lib/auth/client`

```typescript
const { data: session, isPending, error } = useSession();

// session.user 包含:
// - id: 用户ID
// - email: 邮箱
// - name: 显示名称
// - image: 头像URL
```

---

## 样式系统

### Tailwind 自定义颜色

```css
/* 春节主题色 */
--cny-red: #DC2626;      /* 中国红 */
--cny-gold: #FFD700;     /* 金色 */
```

### 常用样式类

```css
/* 玻璃态面板 */
.glass-panel {
  @apply bg-white/5 backdrop-blur-md border border-white/10;
}

/* 渐变按钮 */
.gradient-gold {
  @apply bg-gradient-to-r from-cny-gold to-yellow-600;
}
```

### 动画

```css
/* 浮动动画 */
.animate-float {
  animation: float 8s ease-in-out infinite;
}

/* 脉冲动画 */
.animate-pulse-slow {
  animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```
