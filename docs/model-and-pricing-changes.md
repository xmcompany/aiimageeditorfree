# AI Video Model & Pricing Changes

**Date:** 2026-04-16 (Updated)

---

## 1. Final Model Lineup (9 models in config)

| # | Model ID | Display Name | kie.ai API `model` Parameter | API Provider | Mode |
|---|---|---|---|---|---|
| 1 | `veo_3_1_lite` | Veo 3.1 Lite | `veo3_lite` | kie.ai Veo API | T2V + I2V (default, cheapest) |
| 2 | `seedance` | Seedance 2.0 Fast | `bytedance/seedance-2-fast` | kie.ai Market API | T2V + I2V |
| 3 | `seedance_standard` | Seedance 2.0 Standard | `bytedance/seedance-2` | kie.ai Market API | T2V + I2V |
| 4 | `wan` | Wan 2.7 | Dynamic (see below) | kie.ai Market API | T2V + I2V |
| 5 | `hailuo` | Hailuo 2.3 | Dynamic (see below) | kie.ai Market API | I2V only |
| 6 | `hailuo_02` | Hailuo 02 | Dynamic (see below) | kie.ai Market API | T2V + I2V |
| 7 | `veo_3_1_fast` | Veo 3.1 Fast | `veo3_fast` | kie.ai Veo API | T2V + I2V |
| 8 | `veo_3_1_quality` | Veo 3.1 Quality | `veo3` | kie.ai Veo API | T2V + I2V |
| 9 | `runway` | Runway Gen-4 | `runway/gen4-turbo` | kie.ai Market API | T2V + I2V |

### Removed Models
| Model | Reason |
|---|---|
| Sora 2 Pro (`openai/sora`) | Outdated, high cost |
| Kling (`kwaivgi/kling-v1.6-standard`) | Outdated version |
| Grok Imagine (`xai/grok-2-image`) | Removed per user decision |
| Pixverse V4.5 | Removed per user decision |
| Luma Ray 2 | Removed per user decision |

### Dynamic Model Routing

#### Hailuo 2.3 (I2V only)
| Resolution | `model` Parameter |
|---|---|
| 768p (Standard) | `hailuo/2-3-image-to-video-standard` |
| 1080p (Pro) | `hailuo/2-3-image-to-video-pro` |

#### Hailuo 02 (T2V + I2V)
| Condition | Resolution | `model` Parameter |
|---|---|---|
| No image (T2V) | 768p | `hailuo/02-text-to-video-standard` |
| No image (T2V) | 1080p | `hailuo/02-text-to-video-pro` |
| With image (I2V) | 512p/768p | `hailuo/02-image-to-video-standard` |
| With image (I2V) | 1080p | `hailuo/02-image-to-video-pro` |

> ⚠️ Hailuo 02 model names are based on naming pattern — **verify on kie.ai dashboard before going live.**

#### Wan 2.7
| Condition | `model` Parameter |
|---|---|
| No image (T2V) | `wan/2-7-text-to-video` |
| With image (I2V) | `wan/2-7-image-to-video` |

---

## 2. Per-Model Pricing (Verified Backend Costs + Site Pricing)

### Markup Policy
- **kie.ai credit rate**: 1,000 credits = $5 ($0.005/credit)
- **Site credit value**: average ~$0.025/credit
- **Standard markup**: ~4x (site dollar cost ÷ kie.ai dollar cost)

### Veo 3.1 Lite (`veo3_lite`) — DEFAULT/PROMOTED

| Resolution | kie.ai Cost | Site Pricing | Markup |
|---|---|---|---|
| 720p | 10 credits ($0.05) | **8** | ~4x |
| 1080p | 15 credits ($0.075) | **12** | ~4x |
| 4K | 50 credits ($0.25) | **40** | ~4x |

> Veo 3.1 Lite is the cheapest model and set as the **default selection** in the UI.

### Veo 3.1 Fast (`veo3_fast`)

| Resolution | kie.ai Cost | Site Pricing | Markup |
|---|---|---|---|
| 720p | 20 credits ($0.10) | **16** | ~4x |
| 1080p | 25 credits ($0.125) | **20** | ~4x |
| 4K | 60 credits ($0.30) | **48** | ~4x |

### Veo 3.1 Quality (`veo3`)

| Resolution | kie.ai Cost | Site Pricing | Markup |
|---|---|---|---|
| 720p | 150 credits ($0.75) | **120** | ~4x |
| 1080p | 155 credits ($0.775) | **124** | ~4x |
| 4K | 190 credits ($0.95) | **152** | ~4x |

### Veo HD Upgrade (included in per-resolution pricing)

| Upgrade | kie.ai Cost |
|---|---|
| 720p → 1080p | 5 credits/video |
| 1080p → 4K | 40 credits/video |

> Note: Per-resolution site pricing already includes the HD upgrade cost.

### Seedance 2.0 Fast (`bytedance/seedance-2-fast`)

| Resolution | kie.ai Cost | Site Pricing | Markup |
|---|---|---|---|
| 480p (no video input) | 15.5 credits/s ($0.0775/s) | **12 credits/s** | ~4x |
| 720p (no video input) | 33 credits/s ($0.165/s) | **26 credits/s** | ~4x |
| 5s @ 480p | $0.3875 | **60** | ~4x |
| 5s @ 720p | $0.825 | **130** | ~4x |

### Seedance 2.0 Standard (`bytedance/seedance-2`)

| Resolution | kie.ai Cost | Site Pricing | Markup |
|---|---|---|---|
| 480p (no video input) | 19 credits/s ($0.095/s) | **15 credits/s** | ~4x |
| 720p (no video input) | 41 credits/s ($0.205/s) | **33 credits/s** | ~4x |
| 5s @ 480p | $0.475 | **75** | ~4x |
| 5s @ 720p | $1.025 | **165** | ~4x |

### Wan 2.7

| Resolution | kie.ai Cost | Site Pricing | Markup |
|---|---|---|---|
| 720p (T2V or I2V) | 16 credits/s ($0.08/s) | **13 credits/s** | ~4x |
| 1080p (T2V or I2V) | 24 credits/s ($0.12/s) | **19 credits/s** | ~4x |
| 5s @ 720p | $0.40 | **65** | ~4x |
| 5s @ 1080p | $0.60 | **95** | ~4x |

### Hailuo 2.3 (I2V only)

| Resolution | Duration | kie.ai Cost | Site Pricing | Markup |
|---|---|---|---|---|
| Standard 768p | 6s | 25 credits | **20** | ~4x |
| Standard 768p | 10s | 40 credits | **32** | ~4x |
| Pro 1080p | 6s | 70 credits | **56** | ~4x |

### Hailuo 02 (T2V + I2V)

| Mode | Resolution | Duration | kie.ai Cost | Site Pricing | Markup |
|---|---|---|---|---|---|
| T2V Standard | 768p | 6s | 30 | **24** | ~4x |
| T2V Standard | 768p | 10s | 50 | **40** | ~4x |
| T2V Pro | 1080p | 6s | 57 | **46** | ~4x |
| I2V Standard | 512p | 6s | 12 | **10** | ~4x |
| I2V Standard | 512p | 10s | 20 | **16** | ~4x |
| I2V Standard | 768p | 10s | 50 | **40** | ~4x |
| I2V Pro | 1080p | 6s | 57 | **46** | ~4x |

### Runway Gen-4 (`runway/gen4-turbo`)

| Resolution | Duration | kie.ai Cost | Site Pricing | Markup |
|---|---|---|---|---|
| 720p | 5s | 12 | **10** | ~4x |
| 720p | 10s | 30 | **24** | ~4x |
| 1080p | 5s | 30 | **24** | ~4x |
| 1080p | 10s | ~60 (estimated) | **48** | ~4x |

---

## 3. API Provider Routing

### kie.ai Endpoints
| Endpoint | Models | API |
|---|---|---|
| `POST /api/v1/jobs/createTask` | Seedance Fast/Standard, Wan, Hailuo, Hailuo 02, Runway | Market API |
| `GET /api/v1/jobs/recordInfo?taskId=` | (poll above) | Market API |
| `POST /api/v1/veo/generate` | Veo 3.1 Lite/Fast/Quality | Veo API |
| `GET /api/v1/veo/record-info?taskId=` | (poll Veo) | Veo API |
| `GET /api/v1/veo/get-1080p-video?taskId=` | Veo 720p→1080p upgrade | Veo API |
| `GET /api/v1/veo/get-4k-video?taskId=` | Veo 1080p→4K upgrade | Veo API |

### Dynamic Model Name Resolution (in route.ts)

```
if (model === 'wan'):
  has image → 'wan/2-7-image-to-video'
  no image → 'wan/2-7-text-to-video'

if (model === 'hailuo'):
  // I2V only
  1080p → 'hailuo/2-3-image-to-video-pro'
  768p → 'hailuo/2-3-image-to-video-standard'

if (model === 'hailuo_02'):
  has image + 1080p → 'hailuo/02-image-to-video-pro'
  has image + 512p/768p → 'hailuo/02-image-to-video-standard'
  no image + 1080p → 'hailuo/02-text-to-video-pro'
  no image + 768p → 'hailuo/02-text-to-video-standard'

Veo models: resolvedModelName.startsWith('veo3') → use Veo API
```

### Veo Resolution-Aware HD Upgrade (in route.ts)

```
720p: no HD upgrade (use default output)
1080p: call GET /api/v1/veo/get-1080p-video
4K: call GET /api/v1/veo/get-4k-video (fallback to get-1080p-video)
```

---

## 4. Files Modified

| File | Changes |
|---|---|
| `src/config/model-config.ts` | Added `veo_3_1_lite`, `hailuo_02`, `seedance_standard`; updated pricing for all models with verified costs; updated Seedance Fast model name to `bytedance/seedance-2-fast`; Hailuo 2.3 marked I2V-only; Runway added 1080p; Veo Fast/Quality per-resolution pricing |
| `src/app/api/video/ai/route.ts` | Updated dynamic model routing for Hailuo 2.3 (I2V only), Hailuo 02 (T2V+I2V); added resolution parameter to Veo payload; resolution-aware HD upgrade for Veo (720p/1080p/4K) |
| `src/config/locale/messages/en/video.json` | Added model entries for `veo_3_1_lite`, `hailuo_02`, `seedance_standard`; updated pricing descriptions for all models |
| `src/config/locale/messages/zh/video.json` | Same changes as English |
| `src/shared/components/video/hero-input.tsx` | Changed default model from `hailuo` to `veo_3_1_lite` |
| `src/shared/components/video/video-generation-form.tsx` | Changed default model from `hailuo` to `veo_3_1_lite` |
| `src/themes/default/blocks/video-models.tsx` | Updated model cards: Veo shows 3 tiers (Lite/Fast/Quality), Seedance shows Fast+Standard, Hailuo 2.3 marked I2V-only, added Hailuo 02 card, Runway 1080p |
| `src/app/[locale]/(admin)/admin/video-prompts/add/page.tsx` | Updated model dropdown: removed Kling/Sora, added Veo Lite, Seedance Standard, Hailuo 02 |
| `src/app/[locale]/(admin)/admin/video-prompts/[id]/edit/page.tsx` | Same model dropdown updates |

---

## 5. kie.ai Verified Cost Reference

> kie.ai credit rate: **1,000 credits = $5** ($0.005/credit)

| Model | kie.ai API `model` Param | kie.ai Cost | Source |
|---|---|---|---|
| Seedance 2.0 Fast 480p | `bytedance/seedance-2-fast` | 15.5 credits/s | verified from screenshot |
| Seedance 2.0 Fast 720p | `bytedance/seedance-2-fast` | 33 credits/s | verified from screenshot |
| Seedance 2.0 Standard 480p | `bytedance/seedance-2` | 19 credits/s | verified from screenshot |
| Seedance 2.0 Standard 720p | `bytedance/seedance-2` | 41 credits/s | verified from screenshot |
| Wan 2.7 T2V/I2V 720p | `wan/2-7-text-to-video` / `wan/2-7-image-to-video` | 16 credits/s | verified from screenshot |
| Wan 2.7 T2V/I2V 1080p | same | 24 credits/s | verified from screenshot |
| Veo 3.1 Lite 720p | `veo3_lite` | 10 credits/video | verified from screenshot |
| Veo 3.1 Lite 1080p | `veo3_lite` | 15 credits/video | verified from screenshot |
| Veo 3.1 Lite 4K | `veo3_lite` | 50 credits/video | verified from screenshot |
| Veo 3.1 Fast 720p | `veo3_fast` | 20 credits/video | verified from screenshot |
| Veo 3.1 Fast 1080p | `veo3_fast` | 25 credits/video | verified from screenshot |
| Veo 3.1 Fast 4K | `veo3_fast` | 60 credits/video | verified from screenshot |
| Veo 3.1 Quality 720p | `veo3` | 150 credits/video | verified from screenshot |
| Veo 3.1 Quality 1080p | `veo3` | 155 credits/video | verified from screenshot |
| Veo 3.1 Quality 4K | `veo3` | 190 credits/video | verified from screenshot |
| Veo HD 1080p upgrade | (separate call) | 5 credits/video | verified from screenshot |
| Veo HD 4K upgrade | (separate call) | 40 credits/video | verified from screenshot |
| Hailuo 2.3 I2V Standard 768p 6s | `hailuo/2-3-image-to-video-standard` | 25 credits/video | verified from screenshot |
| Hailuo 2.3 I2V Standard 768p 10s | same | 40 credits/video | verified from screenshot |
| Hailuo 2.3 I2V Standard 1080p 6s | same | 40 credits/video | verified from screenshot |
| Hailuo 2.3 I2V Pro 768p 6s | `hailuo/2-3-image-to-video-pro` | 40 credits/video | verified from screenshot |
| Hailuo 2.3 I2V Pro 768p 10s | same | 80 credits/video | verified from screenshot |
| Hailuo 2.3 I2V Pro 1080p 6s | same | 70 credits/video | verified from screenshot |
| Hailuo 02 T2V Standard 768p 6s | `hailuo/02-text-to-video-standard` ⚠️ | 30 credits/video | verified from screenshot |
| Hailuo 02 T2V Standard 768p 10s | same ⚠️ | 50 credits/video | verified from screenshot |
| Hailuo 02 T2V Pro 1080p 6s | `hailuo/02-text-to-video-pro` ⚠️ | 57 credits/video | verified from screenshot |
| Hailuo 02 I2V Standard 512p 6s | `hailuo/02-image-to-video-standard` ⚠️ | 12 credits/video | verified from screenshot |
| Hailuo 02 I2V Standard 512p 10s | same ⚠️ | 20 credits/video | verified from screenshot |
| Hailuo 02 I2V Standard 768p 10s | same ⚠️ | 50 credits/video | verified from screenshot |
| Hailuo 02 I2V Pro 1080p 6s | `hailuo/02-image-to-video-pro` ⚠️ | 57 credits/video | verified from screenshot |
| Runway Gen-4 720p 5s | `runway/gen4-turbo` | 12 credits/video | verified from screenshot |
| Runway Gen-4 720p 10s | same | 30 credits/video | verified from screenshot |
| Runway Gen-4 1080p 5s | same | 30 credits/video | verified from screenshot |
| Runway Gen-4 1080p 10s | same | ~60 credits/video (estimated) | unconfirmed |

---

## 6. Action Required

1. **Verify Hailuo 02 model names** on kie.ai dashboard — the following names are used but unconfirmed:
   - `hailuo/02-text-to-video-standard`
   - `hailuo/02-text-to-video-pro`
   - `hailuo/02-image-to-video-standard`
   - `hailuo/02-image-to-video-pro`
2. **Verify Seedance 2.0 Fast model name** — using `bytedance/seedance-2-fast` based on kie.ai having two separate entries. Confirm on dashboard.
3. **Verify Veo 3.1 Lite model name** — using `veo3_lite`. Confirm on kie.ai dashboard.
4. **Verify Veo 4K HD upgrade endpoint** — using `GET /api/v1/veo/get-4k-video`. Confirm on kie.ai dashboard.
5. **Verify Runway Gen-4 1080p 10s cost** — estimated at ~60 kie credits. Confirm on kie.ai dashboard.
6. **Consider creating separate landing pages** for new models (veo-lite, hailuo-02, seedance-standard) or updating existing model pages.
