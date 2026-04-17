# AI Video Generator Free — 定价与模型文档

> 最后更新: 2026-04-15
> 定价策略: 基于 API 成本的 4 倍加价 (3-5x 分层)

---

## 1. 定价策略

### 基础参数

| 参数 | 值 |
|------|-----|
| API 成本基准 | kie.ai (1,000 credits = $5, 即 $0.005/credit) |
| 后端 API | Replicate (api.replicate.com) |
| 加价策略 | 经济型 3x, 标准型 4x, 高端型 5x |
| 月付积分单价 | Lite: $0.028/credit, Pro: $0.0233/credit, Premium: $0.0227/credit |

### 定价公式

以 Pro 月付 ($0.0233/credit) 为基准:
- 3x 加价: $1 API 成本 → 129 积分
- 4x 加价: $1 API 成本 → 172 积分
- 5x 加价: $1 API 成本 → 215 积分

### 分层逻辑

| 层级 | 加价倍数 | 适用模型 | 目的 |
|------|---------|---------|------|
| 经济型 | 3x | Hailuo, Grok, Seedance 480p | 降低入门门槛 |
| 标准型 | 4x | Seedance 720p, Sora, Wan, Veo, Pixverse, Luma | 主力利润 |
| 高端型 | 5x | Kling, Runway | 高成本高利润 |

---

## 2. 视频模型定价

### 2.1 定价总览

| 模型 | 计费方式 | 费率 | 5秒视频 | 10秒视频 |
|------|---------|------|---------|----------|
| Seedance 2.0 (480p) | 按秒 | 5 积分/秒 | 25 | 50 |
| Seedance 2.0 (720p) | 按秒 | 10 积分/秒 | 50 | 100 |
| Hailuo 02 (768p 6s) | 按次 | 固定 | 10 | - |
| Hailuo 02 (768p 10s) | 按次 | 固定 | - | 18 |
| Hailuo 02 (1080p 6s) | 按次 | 固定 | 12 | - |
| Kling | 按秒 | 9 积分/秒 | 45 | 90 |
| Wan 2.1 | 按次 | 固定 75 | 75 | - |
| Sora 2 Pro | 按秒 | 5 积分/秒 | 25 | 50 |
| Veo 3.1 Fast | 按秒 | 9 积分/秒 | 45 | 90 |
| Runway Gen-4 | 按秒 | 9 积分/秒 | 45 | 90 |
| Grok Imagine | 按次 | 固定 10 | 10 | - |
| Luma | 按秒 | 4 积分/秒 | 20 | 36 |
| Pixverse (540p 5s) | 按次 | 固定 | 20 | - |
| Pixverse (720p 5s) | 按次 | 固定 | 28 | - |
| Pixverse (1080p 5s) | 按次 | 固定 | 54 | - |

### 2.2 各模型详细参数

#### Seedance 2.0 (`bytedance/seedance-1-lite`)

| 分辨率 | 费率 | 5秒 | 10秒 | 15秒 |
|--------|------|-----|------|------|
| 480p | 5 积分/秒 | 25 | 50 | 75 |
| 720p | 10 积分/秒 | 50 | 100 | 150 |

- 时长: 4-15 秒
- 宽高比: 16:9, 9:16, 4:3, 3:4, 1:1, 21:9
- 支持: 参考图片 (图生视频)

#### Hailuo 02 (`minimax/hailuo-02`)

| 分辨率 | 6秒 | 10秒 |
|--------|-----|------|
| 768p | 10 | 18 |
| 1080p | 12 | 不支持 |

- 宽高比: 跟随 first_frame_image
- 支持: Prompt optimizer

#### Kling (`kwaivgi/kling-v1.6-standard`)

| 时长 | 积分 |
|------|------|
| 5秒 | 45 |
| 10秒 | 90 |

- 宽高比: 16:9, 9:16, 1:1
- 支持: 起始图片, 参考图片 (最多4张), 反向提示词, CFG scale

#### Wan 2.1 (`wavespeedai/wan-2.1-i2v-480p`)

| 固定 | 积分 |
|------|------|
| ~5秒/次 | 75 |

- 宽高比: 16:9, 9:16
- 支持: 快速模式, 种子, LoRA 权重, 采样参数
- **必须提供** startImageUrl

#### Sora 2 Pro (`openai/sora`)

| 时长 | 积分 |
|------|------|
| 5秒 | 25 |
| 10秒 | 50 |
| 15秒 | 75 |
| 20秒 | 100 |

- 宽高比: 16:9, 9:16, 1:1
- 分辨率: 480p, 720p, 1080p

#### Veo 3.1 Fast (`google/veo-3.1-fast`)

| 时长 | 积分 |
|------|------|
| 5秒 | 45 |
| 10秒 | 90 |

- 宽高比: 16:9, 9:16, 1:1

#### Runway Gen-4 (`runway/gen4-turbo`)

| 时长 | 积分 |
|------|------|
| 5秒 | 45 |
| 10秒 | 90 |

- 宽高比: 16:9, 9:16, 1:1
- 支持: 参考图片 (图生视频)

#### Grok Imagine (`xai/grok-2-image`)

| 固定 | 积分 |
|------|------|
| 每次生成 | 10 |

- 宽高比: 2:3, 3:2, 1:1, 9:16, 16:9

#### Luma (`luma/ray-2-720p`)

| 时长 | 积分 |
|------|------|
| 5秒 | 20 |
| 9秒 | 36 |

- 宽高比: 1:1, 3:4, 4:3, 9:16, 16:9, 9:21, 21:9
- 支持: 起始/结束图片, 循环, 摄像机概念

#### Pixverse (`pixverse/pixverse-v4.5`)

| 分辨率 | 5秒普通 | 5秒流畅 | 8秒普通 |
|--------|---------|---------|---------|
| 360p/540p | 20 | 40 | 40 |
| 720p | 28 | 54 | 54 |
| 1080p | 54 | 不支持 | 不支持 |

- 宽高比: 16:9, 9:16, 1:1
- 支持: 风格, 特效, 音效, 尾帧图片

---

## 3. 图片模型定价

### 3.1 模型列表

网站仅保留以下 3 个图片模型:

| 模型 | API 标识 | Provider |
|------|---------|----------|
| Nano Banana 2 | `nano-banana-2` | kie |
| Nano Banana Pro | `nano-banana-pro` | kie |
| Nano Banana | `nano-banana` | kie |
| Nano Banana Pro (备用) | `google/nano-banana-pro` | replicate |

### 3.2 图片生成定价

| 模型 | 文生图 (Text-to-Image) | 图生图 (Image-to-Image) |
|------|----------------------|----------------------|
| **Nano Banana** | 3 积分 | 5 积分 |
| **Nano Banana Pro** | 5 积分 | 8 积分 |
| **Nano Banana 2** | 8 积分 | 12 积分 |

### 3.3 前后端定价联动

- **后端** `src/app/api/ai/generate/route.ts`: 根据 `model` 名称判断档次 (`banana-2` / `pro` / 默认), 动态计算积分
- **前端** `src/shared/blocks/generator/image.tsx`: `useEffect` 监听 `model` 和 `activeTab` 变化, 实时更新显示的积分消耗

---

## 4. 已移除的图片模型

以下模型已从 `image.tsx` 的 `MODEL_OPTIONS` 中移除:

| 已移除模型 | Provider | 移除原因 |
|-----------|----------|---------|
| `bytedance/seedream-4` | replicate | 非核心 |
| `fal-ai/nano-banana-pro` | fal | 与 kie 重复 |
| `fal-ai/nano-banana-pro/edit` | fal | 与 kie 重复 |
| `fal-ai/bytedance/seedream/v4/edit` | fal | 非核心 |
| `fal-ai/z-image/turbo` | fal | 非核心 |
| `fal-ai/flux-2-flex` | fal | 非核心 |
| `gemini-3-pro-image-preview` | gemini | 非核心 |

---

## 5. 模型页面事实修正

### Veo 3.1 (`veo.json`)

| 修正项 | 原值 | 新值 | 依据 |
|--------|------|------|------|
| Reference to Video | Veo 3.1=✓, Fast=- | Veo 3.1=-, Fast=✓ | kie.ai 文档: "REFERENCE_2_VIDEO is Fast model only" |
| Max Resolution (Veo 3.1) | 1080p | 4K | kie.ai 文档: 支持 1080P 和 4K |

### Sora (`sora.json`)

| 修正项 | 原值 | 新值 | 依据 |
|--------|------|------|------|
| Sora 2 Pro 时长描述 | "20 seconds" (3处) | "15 seconds" | Sora 2 Pro 最大 15s, 仅 Storyboard 为 25s |

### Compare 对比页 (`compare.json`)

| 修正项 | 原值 | 新值 | 依据 |
|--------|------|------|------|
| Wan Native Audio | ✓ | - | wan.json 中 Wan 2.7 Native Audio = "-" |
| Veo Reference to Video | ✓ | ✓ (Fast only) | kie.ai 文档 |
| FAQ: Sora 时长描述 | "Sora 2 Pro supports longest (25s)" | "Sora 2 Pro Storyboard supports 25s" | 25s 仅 Storyboard |
| FAQ: Wan 版本引用 | "Wan 2.6" | 已移除该引用 | 标题模型是 Wan 2.7 |
| Pricing 定价表 | 旧价格 (与系统不匹配) | 全部重写, 匹配 model-config.ts | 系统一致性 |

---

## 6. 定价变更对照 (旧 → 新)

### 视频模型

| 模型 | 旧价格 | 新价格 | 变化幅度 | 调整原因 |
|------|--------|--------|---------|---------|
| Seedance 480p | 11.5 积分/秒 | **5 积分/秒** | -57% | 原加价 30x+ 过高 |
| Seedance 720p | 25 积分/秒 | **10 积分/秒** | -60% | 原加价 30x+ 过高 |
| Hailuo 768p 6秒 | 9 积分 | **10 积分** | +11% | 微调至整数 |
| Hailuo 768p 10秒 | 15 积分 | **18 积分** | +20% | 按比例调整 |
| Hailuo 1080p 6秒 | 16 积分 | **12 积分** | -25% | 与 768p 成本相同不应更贵 |
| **Kling 5秒** | **9 积分** | **45 积分** | **+400%** | **原价亏本** (API成本$0.25, 收入仅$0.21) |
| **Kling 10秒** | **17 积分** | **90 积分** | **+429%** | **原价亏本** |
| **Wan** | **15 积分** | **75 积分** | **+400%** | 原仅 1.75x 加价 |
| Sora | 6 积分/秒 | **5 积分/秒** | -17% | 微调 |
| **Veo Fast 5秒** | **25 积分** | **45 积分** | **+80%** | 原仅 2.3x 加价 |
| Veo Fast 10秒 | 50 积分 | **90 积分** | +80% | 同比例 |
| Runway | 10 积分/秒 | **9 积分/秒** | -10% | 原加价 9x 偏高 |
| Grok | 20 积分 | **10 积分** | -50% | 原加价 12x 偏高 |
| **Luma 5秒** | **10 积分** | **20 积分** | **+100%** | 原仅 1.67x |
| Luma 9秒 | 18 积分 | **36 积分** | +100% | 同比例 |
| Pixverse (各档) | 见代码 | **约 2x** | +100% | 原价偏低 |

### 图片模型

| 场景 | 旧价格 (所有模型统一) | Nano Banana | Nano Banana Pro | Nano Banana 2 |
|------|---------------------|-------------|-----------------|---------------|
| 文生图 | 4 积分 | **3 积分** | **5 积分** | **8 积分** |
| 图生图 | 6 积分 | **5 积分** | **8 积分** | **12 积分** |

---

## 7. 修改文件清单

| 文件路径 | 作用 | 修改内容 |
|---------|------|---------|
| `src/config/model-config.ts` | 视频模型定价核心 | 更新全部 10 个模型的 `calculateCredits` 和 `getPricingDescription` |
| `src/config/locale/messages/en/video.json` | 英文定价描述 | 更新 `pricing_descriptions` |
| `src/config/locale/messages/zh/video.json` | 中文定价描述 | 更新 `pricing_descriptions` |
| `src/config/locale/messages/en/pages/compare.json` | 模型对比页 | 重写 pricing section + 修正 3 处 FAQ |
| `src/shared/blocks/generator/image.tsx` | 图片生成器 | 精简至 4 个模型 + 添加按模型动态定价 `useEffect` |
| `src/app/api/ai/generate/route.ts` | 图片 API 积分扣费 | 按 `banana-2` / `pro` / 默认 档次区分 |
| `src/config/locale/messages/en/pages/models/veo.json` | Veo 模型页 | 修正 Reference to Video + Max Resolution |
| `src/config/locale/messages/en/pages/models/sora.json` | Sora 模型页 | 修正 duration 20s → 15s (3处) |

---

## 8. 待确认事项

1. **kie.ai 精确成本**: 本次定价基于 model-config.ts 注释中的成本估算。若使用 kie.ai 做后端，部分模型成本差异较大 (如 Kling: kie.ai $0.16/s vs Replicate $0.05/s)，需重新定价
2. **nano-banana-2 / nano-banana API 标识**: 当前使用 `nano-banana-2` 和 `nano-banana`，需确认 kie.ai 上的实际模型 ID
3. **模型版本不一致**: model-config.ts 实际调用版本 vs 页面宣传版本:
   - `kwaivgi/kling-v1.6-standard` (页面宣传 Kling 3.0)
   - `wavespeedai/wan-2.1-i2v-480p` (页面宣传 Wan 2.7)
   - `bytedance/seedance-1-lite` (页面宣传 Seedance 2.0)
   - `minimax/hailuo-02` (页面宣传 Hailuo 2.3)
4. **Grok Imagine**: 当前 modelName 是 `xai/grok-2-image` (图片模型)，如果是视频需确认是否要换视频模型
5. **Pixverse 精确成本**: 当前定价为等比例放大，待确认 API 实际成本
