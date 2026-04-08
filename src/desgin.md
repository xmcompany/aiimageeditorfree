# Joyflix 设计系统规范 (Design Intelligence)

本项目基于 `theme.css` 的 OKLCH 配色方案，旨在打造一个专业、沉浸、具有电影感（Cinematic）的流媒体风格界面。以下是针对 Joyflix UI/UX 的全面设计规范。

## 1. 基础设计系统 (Design Tokens)

### 🎨 核心调色板 (Colors)
基于 OKLCH 模型，确保在深色模式下拥有极佳的对比度和通透感。

| 变量 | 建议值 (OKLCH) | 用途描述 |
| :--- | :--- | :--- |
| `Primary` | `oklch(0.5393 0.2713 286.7462)` | 品牌主色（紫罗兰），用于主要 CTA 按钮和活跃状态。 |
| `Background` | `oklch(0.2223 0.0060 271.1393)` | 深色背景，采用深灰蓝而非纯黑，增加视觉深度。 |
| `Card` | `oklch(0.2568 0.0076 274.6528)` | 卡片背景，比底色略浅，形成海拔高度感（Elevation）。 |
| `Muted` | `oklch(0.7058 0 0)` | 次要文本/占位符，保持低调且可读。 |
| `Border` | `oklch(0.3289 0.0092 268.3843)` | 微弱的对比边框，用于界定元素边界。 |

### 🔡 字体系统 (Typography)
*   **Sans-serif (Primary):** `Plus Jakarta Sans` - 现代、高可读性，适合流媒体界面。
*   **Serif (Accent):** `Lora` - 用于标题或特定展示文本，增加高级感。
*   **Mono:** `IBM Plex Mono` - 用于代码、数字或技术细节。

| 层级 | 大小 / 粗细 | 字母间距 (Tracking) | 用途 |
| :--- | :--- | :--- | :--- |
| **H1** | 2.5rem - 3rem / Bold | `-0.05em` | 英雄区大标题 (Hero Title) |
| **H2** | 1.875rem / SemiBold | `-0.025em` | 板块标题 (Section Heading) |
| **Body Large** | 1.125rem / Regular | `normal` | 重点描述文字 |
| **Body Base** | 1rem / Regular | `normal` | 正文文字 |
| **Small** | 0.875rem / Medium | `0.025em` | 标签、微文案、徽章 |

### 📐 间距与布局 (Spacing)
*   **基准单位:** `0.27rem` (基于 `--spacing` 变量)。
*   **常用比例:** 4px (1u), 8px (2u), 16px (4u), 24px (6u), 48px (12u), 80px (20u)。
*   **内边距:** 大卡片固定使用 `1.5rem` (24px) 或 `2rem` (32px) 的内边距以保持呼吸感。

### 🔘 圆角与阴影 (Effects)
*   **Radius:** 项目统一使用 `1.4rem` (22.4px) 的大圆角，传达友好和现代感。
*   **Shadow-md:** `0px 2px 3px 0px hsl(0 0% 0% / 0.16), 0px 2px 4px -1px hsl(0 0% 0% / 0.16)` - 用于悬浮卡片。
*   **Inner Glow:** 在深色卡片边缘建议增加一层极窄的 `white/5` 描边，模拟光影。

---

## 2. 板块层级结构指导 (Visual Hierarchy)

在 Joyflix 的沉浸式界面中，视觉重心应遵循以下逻辑：

1.  **第一层级 (Hero / Featured):**
    *   **突出元素:** 巨幕海报、主播放按钮 (Primary Button)、电影标题。
    *   **视觉规范:** 采用大字号 Serif 字体，高亮度背景色，使用毛玻璃效果（Backdrop Blur）增强层级。

2.  **第二层级 (Navigation / CTA):**
    *   **突出元素:** 导航链接、搜索栏、正在观看卡片。
    *   **视觉规范:** 活跃项使用 `Primary` 色高亮，图标与文本保持高对比。

3.  **第三层级 (Grid / Secondary Content):**
    *   **突出元素:** 内容网格 (Content Grid)、分类标签。
    *   **视觉规范:** 卡片通过 Hover 缩放或阴影加深来提供反馈，避免静态时出现过多视觉杂讯。

---

## 3. 组件规范细节 (Component Specs)

### 🔘 按钮 (Buttons)
*   **Primary:** 背景 `var(--primary)`, 文字 `var(--primary-foreground)`, 圆角 `var(--radius)`. Hover 时亮度增加 5%。
*   **Secondary:** 背景 `var(--secondary)`, 轻微毛玻璃效果 `backdrop-blur-md`.
*   **Link:** 仅文字，Hover 时出现下划线或颜色切换，间距保持在 `tracking-wide`.

### ⌨️ 输入框 (Inputs)
*   **静止:** 背景 `var(--input)`, 描边 `transparent`, 圆角 `var(--radius-md)`.
*   **焦点 (Focus):** 描边 `var(--ring)`, 带有淡淡的外发光阴影 (box-shadow glow).
*   **占位符:** 使用 `var(--muted-foreground)`, 降低视觉噪音。

### 🃏 卡片 (Cards)
*   **背景:** `var(--card)`.
*   **阴影:** 默认 `shadow-sm`, Hover 时切换为 `shadow-lg` 且伴随 `scale(1.02)` 的微动画。
*   **内容:** 必须有 `overflow-hidden` 以配合大圆角。

### 🏷️ 徽章与标签 (Badges/Links)
*   **样式:** 胶囊形状 (Full Rounded), 小号字体, 加粗。
*   **配色:** 背景使用 `var(--accent)`, 文字使用 `var(--accent-foreground)`.

---

## 4. 深色 UI 常见陷阱 (Dark UI Pitfalls)

为了保持 Joyflix 的高级感，请务必规避以下问题：

1.  **纯黑背景 (Pure Black):** 避免使用 `#000000` 作为大面积底色，这会使 UI 显得死板。建议沿用 `theme.css` 中的 `oklch(0.2223 0.0060 271.1393)`（深灰蓝）。
2.  **色彩过饱和:** 在深色背景上，高饱和度颜色会显得“发光”过猛导致刺眼。请通过增加 L 值（亮度）而非 C 值（色度）来调整高亮色。
3.  **海拔感缺失 (Lack of Elevation):** 多个深色容器堆叠时，如果不使用不同的背景灰度或投影，界面会变得扁平。记住：越“靠近”用户的元素，颜色应该越浅。
4.  **文字对比度不足:** 不要对 body text 使用过暗的灰色。确保对比度符合 WCAG AA 标准，次要文字至少保持在 `oklch(0.7...)` 以上。
5.  **描边过重:** 在深色模式下，描边应作为“光晕”存在。使用 `opacity` (例如 `white/10`) 的描边比实色灰色描边显得更自然。

## 5. 生成器组件高级规范 (Generator Premium UI)

为了提升 AI 生成功能（图片/视频）的信任感与高级感，采用以下“未来感”设计策略：

### 🌌 沉浸式背景 (Immersive Background)
*   **网格系统:** 使用 `32px` 或 `40px` 的微弱网格描边（`#8080800a`），配合 `mask-image` 的径向渐变，形成中心发散的背景深度。
*   **光流效果:** 在卡片下方或背景深处添加低透明度的 `Primary` 色径向光晕（`blur-[120px]`），模拟 AI 运算时的能量感。

### 🔮 玻璃拟态卡片 (Glassmorphism 2.0)
*   **模糊强度:** 容器使用 `backdrop-blur-2xl` 或 `backdrop-blur-3xl`。
*   **边框发光:** 边框不仅仅是灰色，应带有品牌色的微妙印记（如 `border-primary/10`）。
*   **阴影海拔:** 使用极大的扩散阴影 `shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)]`，使生成控制面板仿佛悬浮在虚空之上。

### ⚡ 动态生成交互 (Dynamic Interaction)
*   **渐变按钮:** “生成”按钮采用动态渐变背景（`Primary` 到 `Indigo`），在 Hover 时触发背景位置动画。
*   **输入框反馈:** 使用 `shadow-inner` 配合 `group-hover:border-primary/30`，增强输入时的包裹感。
*   **预览容器:** 结果展示区应采用 `2-border dashed` (虚线描边) 的占位状态，生成后通过 `scale-110` 到 `scale-100` 的弹性动画切入成品。

---

*Joyflix Design System - Last Updated: 2026-02-12*
