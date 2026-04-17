export interface JsonSchemaProperty {
  type: string;
  title: string;
  description?: string;
  default?: any;
  enum?: any[];
  format?: string;
  'x-order'?: number;
  minimum?: number;
  maximum?: number;
  maxItems?: number;
  nullable?: boolean;
  items?: {
    type: string;
    format?: string;
  };
}

export interface JsonSchema {
  type: string;
  title: string;
  required: string[];
  properties: Record<string, JsonSchemaProperty>;
}

export interface ModelConfig {
  id: string;
  name: string;
  modelName: string; // 用于API请求的实际模型名称
  provider: 'kie' | 'replicate'; // API 提供商
  img: string; // 模型图标路径
  schema: JsonSchema;
  parseParams?: (params: Record<string, any>) => Record<string, any>; // 可选的参数转换函数，params 为请求参数
  calculateCredits?: (params: Record<string, any>) => number; // 计算积分消耗的函数
  updateSchema?: (
    params: Record<string, any>,
    schema: JsonSchema
  ) => JsonSchema; // 根据当前参数动态更新schema
  getPricingDescription?: (params: Record<string, any>, t?: any) => string; // 获取定价描述的函数
}

export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  // === Veo 3.1 Lite (cheapest, default/promoted model) ===
  veo_3_1_lite: {
    id: 'veo_3_1_lite',
    name: 'Veo 3.1 Lite',
    modelName: 'veo3_lite',
    provider: 'kie',
    img: '/imgs/logos/vidu.svg',
    parseParams: (params: Record<string, any>) => {
      const parsedParams = { ...params };
      if (params.startImageUrl) {
        parsedParams['imageUrls'] = [params.startImageUrl];
      }
      delete parsedParams.startImageUrl;
      delete parsedParams.negative_prompt;
      delete parsedParams.duration;
      return parsedParams;
    },
    calculateCredits: (params: Record<string, any>) => {
      const resolution = params.resolution || '720p';
      // Veo 3.1 Lite kie.ai cost: 720p=10, 1080p=15, 4K=50 (per video)
      // ~4x markup at ~$0.025/site credit
      const pricing: Record<string, number> = { '720p': 8, '1080p': 12, '4K': 40 };
      return pricing[resolution] || 8;
    },
    getPricingDescription: (params: Record<string, any>, t?: any) => {
      return t
        ? t('hero_input.pricing_descriptions.veo_lite')
        : 'Veo 3.1 Lite: from 8 credits per generation';
    },
    schema: {
      type: 'object',
      title: 'Input',
      required: ['prompt'],
      properties: {
        prompt: {
          type: 'string',
          title: 'Prompt',
          'x-order': 0,
          description: 'Text prompt for video generation',
        },
        startImageUrl: {
          type: 'string',
          title: 'Reference Image',
          format: 'uri',
          'x-order': 1,
          nullable: true,
          description: 'Optional reference image for image-to-video generation',
        },
        aspect_ratio: {
          enum: ['16:9', '9:16'],
          type: 'string',
          title: 'Aspect Ratio',
          description: 'Aspect ratio of the video.',
          default: '16:9',
          'x-order': 2,
        },
        resolution: {
          enum: ['720p', '1080p', '4K'],
          type: 'string',
          title: 'Resolution',
          default: '720p',
          'x-order': 3,
          description: 'Output video resolution',
        },
      },
    },
  },

  // === Seedance 2.0 Fast ===
  seedance: {
    id: 'seedance',
    name: 'Seedance 2.0 Fast',
    modelName: 'bytedance/seedance-2-fast',
    provider: 'kie',
    img: '/imgs/logos/nextjs.svg',
    parseParams: (params: Record<string, any>) => {
      const parsedParams = { ...params };
      if (params.startImageUrl) {
        parsedParams['first_frame_url'] = params.startImageUrl;
      }
      delete parsedParams.startImageUrl;
      delete parsedParams.image;
      return parsedParams;
    },
    calculateCredits: (params: Record<string, any>) => {
      const duration = params.duration || 5;
      const resolution = params.resolution || '480p';
      // Seedance 2.0 Fast (no video input): 480p=15.5 kie/s, 720p=33 kie/s
      // ~4x markup: 480p=12, 720p=26
      if (resolution === '720p') return duration * 26;
      return duration * 12;
    },
    getPricingDescription: (params: Record<string, any>, t?: any) => {
      const resolution = params.resolution || '480p';
      if (resolution === '720p') {
        return t
          ? t('hero_input.pricing_descriptions.seedance_720p')
          : 'Seedance 2.0 Fast 720p: 26 credits/second';
      }
      return t
        ? t('hero_input.pricing_descriptions.seedance_480p')
        : 'Seedance 2.0 Fast 480p: 12 credits/second';
    },
    schema: {
      type: 'object',
      title: 'Input',
      required: ['prompt'],
      properties: {
        prompt: {
          type: 'string',
          title: 'Prompt',
          'x-order': 0,
          description: 'Text prompt for video generation',
        },
        first_frame_url: {
          type: 'string',
          title: 'First Frame Image',
          format: 'uri',
          'x-order': 1,
          nullable: true,
          description: 'Optional first frame image for image-to-video generation',
        },
        last_frame_url: {
          type: 'string',
          title: 'Last Frame Image',
          format: 'uri',
          'x-order': 2,
          nullable: true,
          description: 'Optional last frame image (must be used with first frame)',
        },
        resolution: {
          enum: ['480p', '720p'],
          type: 'string',
          title: 'Resolution',
          default: '480p',
          'x-order': 3,
          description: 'Output video resolution',
        },
        aspect_ratio: {
          enum: ['16:9', '9:16', '4:3', '3:4', '1:1', '21:9'],
          type: 'string',
          title: 'Aspect Ratio',
          default: '16:9',
          'x-order': 4,
          description: 'Aspect ratio of the output video',
        },
        duration: {
          enum: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
          type: 'integer',
          title: 'Duration',
          default: 5,
          'x-order': 5,
          description: 'Duration of the video in seconds (5-15s)',
        },
        generate_audio: {
          type: 'boolean',
          title: 'Generate Audio',
          default: false,
          'x-order': 6,
          description: 'Generate audio for the video',
        },
      },
    },
  },

  // === Seedance 2.0 Standard ===
  seedance_standard: {
    id: 'seedance_standard',
    name: 'Seedance 2.0 Standard',
    modelName: 'bytedance/seedance-2',
    provider: 'kie',
    img: '/imgs/logos/nextjs.svg',
    parseParams: (params: Record<string, any>) => {
      const parsedParams = { ...params };
      if (params.startImageUrl) {
        parsedParams['first_frame_url'] = params.startImageUrl;
      }
      delete parsedParams.startImageUrl;
      delete parsedParams.image;
      return parsedParams;
    },
    calculateCredits: (params: Record<string, any>) => {
      const duration = params.duration || 5;
      const resolution = params.resolution || '480p';
      // Seedance 2.0 Standard (no video input): 480p=19 kie/s, 720p=41 kie/s
      // ~4x markup: 480p=15, 720p=33
      if (resolution === '720p') return duration * 33;
      return duration * 15;
    },
    getPricingDescription: (params: Record<string, any>, t?: any) => {
      const resolution = params.resolution || '480p';
      if (resolution === '720p') {
        return t
          ? t('hero_input.pricing_descriptions.seedance_standard_720p')
          : 'Seedance 2.0 Standard 720p: 33 credits/second';
      }
      return t
        ? t('hero_input.pricing_descriptions.seedance_standard_480p')
        : 'Seedance 2.0 Standard 480p: 15 credits/second';
    },
    schema: {
      type: 'object',
      title: 'Input',
      required: ['prompt'],
      properties: {
        prompt: {
          type: 'string',
          title: 'Prompt',
          'x-order': 0,
          description: 'Text prompt for video generation',
        },
        first_frame_url: {
          type: 'string',
          title: 'First Frame Image',
          format: 'uri',
          'x-order': 1,
          nullable: true,
          description: 'Optional first frame image for image-to-video generation',
        },
        last_frame_url: {
          type: 'string',
          title: 'Last Frame Image',
          format: 'uri',
          'x-order': 2,
          nullable: true,
          description: 'Optional last frame image (must be used with first frame)',
        },
        resolution: {
          enum: ['480p', '720p'],
          type: 'string',
          title: 'Resolution',
          default: '480p',
          'x-order': 3,
          description: 'Output video resolution',
        },
        aspect_ratio: {
          enum: ['16:9', '9:16', '4:3', '3:4', '1:1', '21:9'],
          type: 'string',
          title: 'Aspect Ratio',
          default: '16:9',
          'x-order': 4,
          description: 'Aspect ratio of the output video',
        },
        duration: {
          enum: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
          type: 'integer',
          title: 'Duration',
          default: 5,
          'x-order': 5,
          description: 'Duration of the video in seconds (5-15s)',
        },
        generate_audio: {
          type: 'boolean',
          title: 'Generate Audio',
          default: false,
          'x-order': 6,
          description: 'Generate audio for the video',
        },
      },
    },
  },

  // === Wan 2.7 (T2V + I2V, same pricing) ===
  wan: {
    id: 'wan',
    name: 'Wan 2.7',
    // Dynamic modelName: resolved at API call time based on image upload
    // No image: wan/2-7-text-to-video (T2V)
    // With image: wan/2-7-image-to-video (I2V)
    modelName: 'wan/2-7-text-to-video',
    provider: 'kie',
    img: '/imgs/logos/wan.svg',
    parseParams: (params: Record<string, any>) => {
      const parsedParams = { ...params };
      if (params.startImageUrl) {
        parsedParams['first_frame_url'] = params.startImageUrl;
      }
      delete parsedParams.startImageUrl;
      delete parsedParams.image;
      return parsedParams;
    },
    calculateCredits: (params: Record<string, any>) => {
      const duration = params.duration || 5;
      const resolution = params.resolution || '720p';
      // Wan 2.7 T2V/I2V (same pricing): 720p=16 kie/s, 1080p=24 kie/s
      // ~4x markup: 720p=13, 1080p=19
      if (resolution === '1080p') return duration * 19;
      return duration * 13;
    },
    getPricingDescription: (params: Record<string, any>, t?: any) => {
      const resolution = params.resolution || '720p';
      if (resolution === '1080p') {
        return t
          ? t('hero_input.pricing_descriptions.wan_1080p')
          : 'Wan 2.7 1080p: 19 credits/second';
      }
      return t
        ? t('hero_input.pricing_descriptions.wan_720p')
        : 'Wan 2.7 720p: 13 credits/second';
    },
    schema: {
      type: 'object',
      title: 'Input',
      required: ['prompt'],
      properties: {
        prompt: {
          type: 'string',
          title: 'Prompt',
          'x-order': 0,
          description: 'Text prompt for video generation',
        },
        negative_prompt: {
          type: 'string',
          title: 'Negative Prompt',
          default: '',
          'x-order': 1,
          description: 'Negative prompt to avoid certain elements',
        },
        first_frame_url: {
          type: 'string',
          title: 'First Frame Image',
          format: 'uri',
          'x-order': 2,
          nullable: true,
          description: 'Image for use as the initial frame of the video',
        },
        resolution: {
          enum: ['720p', '1080p'],
          type: 'string',
          title: 'Resolution',
          default: '720p',
          'x-order': 3,
          description: 'Output video resolution',
        },
        aspect_ratio: {
          enum: ['16:9', '9:16'],
          type: 'string',
          title: 'Aspect Ratio',
          default: '16:9',
          'x-order': 4,
          description: 'Aspect ratio of the output video',
        },
        duration: {
          enum: [5, 10],
          type: 'integer',
          title: 'Duration',
          default: 5,
          'x-order': 5,
          description: 'Duration of the video in seconds',
        },
      },
    },
  },

  // === Hailuo 2.3 (I2V only) ===
  hailuo: {
    id: 'hailuo',
    name: 'Hailuo 2.3',
    // I2V only - dynamic model name based on resolution
    // Standard 768p: hailuo/2-3-image-to-video-standard
    // Pro 1080p: hailuo/2-3-image-to-video-pro
    modelName: 'hailuo/2-3-image-to-video-standard',
    provider: 'kie',
    img: '/imgs/logos/hailuo.svg',
    parseParams: (params: Record<string, any>) => {
      const parsedParams = { ...params };
      if (params.startImageUrl) {
        parsedParams['first_frame_image'] = params.startImageUrl;
      }
      delete parsedParams.startImageUrl;
      return parsedParams;
    },
    calculateCredits: (params: Record<string, any>) => {
      const resolution = params.resolution || '768p';
      const duration = params.duration || 6;
      // Hailuo 2.3 I2V (per video, ~4x markup):
      // Standard 768p 6s: 25 kie -> 20
      // Standard 768p 10s: 40 kie -> 32
      // Pro 1080p 6s: 70 kie -> 56
      if (resolution === '1080p') return 56; // Pro 1080p 6s only
      if (duration === 10) return 32; // Standard 768p 10s
      return 20; // Standard 768p 6s
    },
    updateSchema: (params: Record<string, any>, schema: JsonSchema) => {
      const newSchema = JSON.parse(JSON.stringify(schema)) as JsonSchema;
      if (params.resolution === '1080p') {
        newSchema.properties.duration.enum = [6];
        newSchema.properties.duration.description =
          '1080p resolution only supports 6 seconds duration.';
      } else {
        newSchema.properties.duration.enum = [6, 10];
        newSchema.properties.duration.description =
          '768p resolution supports both 6 and 10 seconds duration.';
      }
      return newSchema;
    },
    getPricingDescription: (params: Record<string, any>, t?: any) => {
      const resolution = params.resolution || '768p';
      if (resolution === '1080p') {
        return t
          ? t('hero_input.pricing_descriptions.hailuo_1080p')
          : 'Hailuo 2.3 Pro 1080p: 56 credits (6s)';
      }
      return t
        ? t('hero_input.pricing_descriptions.hailuo_768p')
        : 'Hailuo 2.3 Standard 768p: 20 credits (6s), 32 credits (10s)';
    },
    schema: {
      type: 'object',
      title: 'Input',
      required: ['prompt'],
      properties: {
        prompt: {
          type: 'string',
          title: 'Prompt',
          'x-order': 0,
          description: 'Text prompt for generation',
        },
        first_frame_image: {
          type: 'string',
          title: 'First Frame Image',
          format: 'uri',
          'x-order': 1,
          description:
            'First frame image for video generation (required for Hailuo 2.3 I2V). The output video will have the same aspect ratio as this image.',
        },
        duration: {
          enum: [6, 10],
          type: 'integer',
          title: 'Duration',
          description: 'Duration of the video in seconds.',
          default: 6,
          'x-order': 2,
        },
        resolution: {
          enum: ['768p', '1080p'],
          type: 'string',
          title: 'Resolution',
          description: 'Standard 768p or Pro 1080p resolution.',
          default: '768p',
          'x-order': 3,
        },
        prompt_optimizer: {
          type: 'boolean',
          title: 'Prompt Optimizer',
          default: true,
          'x-order': 4,
          description: 'Use prompt optimizer',
        },
      },
    },
  },

  // === Hailuo 02 (T2V + I2V) ===
  hailuo_02: {
    id: 'hailuo_02',
    name: 'Hailuo 02',
    // Dynamic model name based on image + resolution
    // T2V Standard: hailuo/02-text-to-video-standard
    // T2V Pro: hailuo/02-text-to-video-pro
    // I2V Standard: hailuo/02-image-to-video-standard
    // I2V Pro: hailuo/02-image-to-video-pro
    modelName: 'hailuo/02-text-to-video-standard', // default T2V
    provider: 'kie',
    img: '/imgs/logos/hailuo.svg',
    parseParams: (params: Record<string, any>) => {
      const parsedParams = { ...params };
      if (params.startImageUrl) {
        parsedParams['first_frame_image'] = params.startImageUrl;
      }
      delete parsedParams.startImageUrl;
      return parsedParams;
    },
    calculateCredits: (params: Record<string, any>) => {
      const resolution = params.resolution || '768p';
      const duration = params.duration || 6;
      const hasImage = !!params.startImageUrl || !!params.first_frame_image;

      if (hasImage) {
        // Hailuo 02 I2V (per video, ~4x markup):
        // Standard 512p 6s: 12 kie -> 10
        // Standard 512p 10s: 20 kie -> 16
        // Standard 768p 10s: 50 kie -> 40
        // Pro 1080p 6s: 57 kie -> 46
        if (resolution === '1080p') return 46;
        if (resolution === '768p') return 40;
        if (duration === 10) return 16;
        return 10;
      }

      // Hailuo 02 T2V (per video, ~4x markup):
      // Standard 768p 6s: 30 kie -> 24
      // Standard 768p 10s: 50 kie -> 40
      // Pro 1080p 6s: 57 kie -> 46
      if (resolution === '1080p') return 46;
      if (duration === 10) return 40;
      return 24;
    },
    updateSchema: (params: Record<string, any>, schema: JsonSchema) => {
      const newSchema = JSON.parse(JSON.stringify(schema)) as JsonSchema;
      const hasImage = !!params.startImageUrl || !!params.first_frame_image;

      if (hasImage) {
        // I2V: 512p (6s, 10s), 768p (10s), 1080p (6s)
        newSchema.properties.resolution.enum = ['512p', '768p', '1080p'];
        if (params.resolution === '768p') {
          newSchema.properties.duration.enum = [10];
          newSchema.properties.duration.description =
            '768p I2V only supports 10 seconds duration.';
        } else if (params.resolution === '1080p') {
          newSchema.properties.duration.enum = [6];
          newSchema.properties.duration.description =
            '1080p only supports 6 seconds duration.';
        } else {
          newSchema.properties.duration.enum = [6, 10];
          newSchema.properties.duration.description =
            '512p supports both 6 and 10 seconds duration.';
        }
      } else {
        // T2V: 768p (6s, 10s), 1080p (6s)
        newSchema.properties.resolution.enum = ['768p', '1080p'];
        if (params.resolution === '1080p') {
          newSchema.properties.duration.enum = [6];
          newSchema.properties.duration.description =
            '1080p only supports 6 seconds duration.';
        } else {
          newSchema.properties.duration.enum = [6, 10];
          newSchema.properties.duration.description =
            '768p supports both 6 and 10 seconds duration.';
        }
      }

      return newSchema;
    },
    getPricingDescription: (params: Record<string, any>, t?: any) => {
      const resolution = params.resolution || '768p';
      const duration = params.duration || 6;
      const hasImage = !!params.startImageUrl || !!params.first_frame_image;

      if (hasImage) {
        if (resolution === '1080p') return t ? t('hero_input.pricing_descriptions.hailuo02_i2v_1080p') : 'Hailuo 02 I2V Pro 1080p: 46 credits (6s)';
        if (resolution === '768p') return t ? t('hero_input.pricing_descriptions.hailuo02_i2v_768p') : 'Hailuo 02 I2V Standard 768p: 40 credits (10s)';
        if (duration === 10) return t ? t('hero_input.pricing_descriptions.hailuo02_i2v_512p_10s') : 'Hailuo 02 I2V Standard 512p: 16 credits (10s)';
        return t ? t('hero_input.pricing_descriptions.hailuo02_i2v_512p') : 'Hailuo 02 I2V Standard 512p: 10 credits (6s)';
      }

      if (resolution === '1080p') return t ? t('hero_input.pricing_descriptions.hailuo02_t2v_1080p') : 'Hailuo 02 T2V Pro 1080p: 46 credits (6s)';
      if (duration === 10) return t ? t('hero_input.pricing_descriptions.hailuo02_t2v_768p_10s') : 'Hailuo 02 T2V Standard 768p: 40 credits (10s)';
      return t ? t('hero_input.pricing_descriptions.hailuo02_t2v_768p') : 'Hailuo 02 T2V Standard 768p: 24 credits (6s)';
    },
    schema: {
      type: 'object',
      title: 'Input',
      required: ['prompt'],
      properties: {
        prompt: {
          type: 'string',
          title: 'Prompt',
          'x-order': 0,
          description: 'Text prompt for generation',
        },
        first_frame_image: {
          type: 'string',
          title: 'First Frame Image',
          format: 'uri',
          'x-order': 1,
          nullable: true,
          description: 'Optional first frame image for image-to-video generation',
        },
        duration: {
          enum: [6, 10],
          type: 'integer',
          title: 'Duration',
          default: 6,
          'x-order': 2,
        },
        resolution: {
          enum: ['768p', '1080p'],
          type: 'string',
          title: 'Resolution',
          default: '768p',
          'x-order': 3,
        },
        prompt_optimizer: {
          type: 'boolean',
          title: 'Prompt Optimizer',
          default: true,
          'x-order': 4,
          description: 'Use prompt optimizer',
        },
      },
    },
  },

  // === Veo 3.1 Fast ===
  veo_3_1_fast: {
    id: 'veo_3_1_fast',
    name: 'Veo 3.1 Fast',
    modelName: 'veo3_fast',
    provider: 'kie',
    img: '/imgs/logos/vidu.svg',
    parseParams: (params: Record<string, any>) => {
      const parsedParams = { ...params };
      if (params.startImageUrl) {
        parsedParams['imageUrls'] = [params.startImageUrl];
      }
      delete parsedParams.startImageUrl;
      delete parsedParams.negative_prompt;
      delete parsedParams.duration;
      return parsedParams;
    },
    calculateCredits: (params: Record<string, any>) => {
      const resolution = params.resolution || '720p';
      // Veo 3.1 Fast kie.ai cost: 720p=20, 1080p=25, 4K=60 (per video)
      // ~4x markup: 720p=16, 1080p=20, 4K=48
      const pricing: Record<string, number> = { '720p': 16, '1080p': 20, '4K': 48 };
      return pricing[resolution] || 16;
    },
    getPricingDescription: (params: Record<string, any>, t?: any) => {
      return t
        ? t('hero_input.pricing_descriptions.veo_fast')
        : 'Veo 3.1 Fast: from 16 credits per generation';
    },
    schema: {
      type: 'object',
      title: 'Input',
      required: ['prompt'],
      properties: {
        prompt: {
          type: 'string',
          title: 'Prompt',
          'x-order': 0,
          description: 'Text prompt for video generation',
        },
        startImageUrl: {
          type: 'string',
          title: 'Reference Image',
          format: 'uri',
          'x-order': 1,
          nullable: true,
          description: 'Optional reference image for image-to-video generation',
        },
        aspect_ratio: {
          enum: ['16:9', '9:16'],
          type: 'string',
          title: 'Aspect Ratio',
          description: 'Aspect ratio of the video.',
          default: '16:9',
          'x-order': 2,
        },
        resolution: {
          enum: ['720p', '1080p', '4K'],
          type: 'string',
          title: 'Resolution',
          default: '1080p',
          'x-order': 3,
          description: 'Output video resolution',
        },
      },
    },
  },

  // === Veo 3.1 Quality ===
  veo_3_1_quality: {
    id: 'veo_3_1_quality',
    name: 'Veo 3.1 Quality',
    modelName: 'veo3',
    provider: 'kie',
    img: '/imgs/logos/vidu.svg',
    parseParams: (params: Record<string, any>) => {
      const parsedParams = { ...params };
      if (params.startImageUrl) {
        parsedParams['imageUrls'] = [params.startImageUrl];
      }
      delete parsedParams.startImageUrl;
      delete parsedParams.negative_prompt;
      delete parsedParams.duration;
      return parsedParams;
    },
    calculateCredits: (params: Record<string, any>) => {
      const resolution = params.resolution || '720p';
      // Veo 3.1 Quality kie.ai cost: 720p=150, 1080p=155, 4K=190 (per video)
      // ~4x markup: 720p=120, 1080p=124, 4K=152
      const pricing: Record<string, number> = { '720p': 120, '1080p': 124, '4K': 152 };
      return pricing[resolution] || 120;
    },
    getPricingDescription: (params: Record<string, any>, t?: any) => {
      return t
        ? t('hero_input.pricing_descriptions.veo_quality')
        : 'Veo 3.1 Quality: from 120 credits per generation';
    },
    schema: {
      type: 'object',
      title: 'Input',
      required: ['prompt'],
      properties: {
        prompt: {
          type: 'string',
          title: 'Prompt',
          'x-order': 0,
          description: 'Text prompt for video generation',
        },
        startImageUrl: {
          type: 'string',
          title: 'Reference Image',
          format: 'uri',
          'x-order': 1,
          nullable: true,
          description: 'Optional reference image for image-to-video generation',
        },
        aspect_ratio: {
          enum: ['16:9', '9:16'],
          type: 'string',
          title: 'Aspect Ratio',
          description: 'Aspect ratio of the video.',
          default: '16:9',
          'x-order': 2,
        },
        resolution: {
          enum: ['720p', '1080p', '4K'],
          type: 'string',
          title: 'Resolution',
          default: '720p',
          'x-order': 3,
          description: 'Output video resolution',
        },
      },
    },
  },
};

// Helper function to get model configuration
export function getModelConfig(modelId: string): ModelConfig | null {
  return MODEL_CONFIGS[modelId] || null;
}

// Helper function to get default parameters for a model from schema
export function getModelDefaults(modelId: string): Record<string, any> {
  const config = getModelConfig(modelId);
  if (!config) return {};

  const defaults: Record<string, any> = {};

  Object.entries(config.schema.properties).forEach(([key, property]) => {
    if (property.default !== undefined) {
      defaults[key] = property.default;
    }
  });

  return defaults;
}

// Helper function to get schema properties sorted by x-order
export function getSchemaPropertiesSorted(
  schema: JsonSchema
): Array<[string, JsonSchemaProperty]> {
  return Object.entries(schema.properties)
    .filter(
      ([key]) =>
        key !== 'prompt' &&
        key !== 'first_frame_image' &&
        key !== 'start_image' &&
        key !== 'reference_images'
    ) // Exclude prompt and image fields as they're handled separately
    .sort(([, a], [, b]) => (a['x-order'] || 0) - (b['x-order'] || 0));
}

// Helper function to get required parameters for a model
export function getModelRequiredParams(modelId: string): string[] {
  const config = getModelConfig(modelId);
  if (!config) return [];

  return config.schema.required || [];
}

// Helper function to validate required parameters
export function validateRequiredParams(
  modelId: string,
  params: Record<string, any>
): { isValid: boolean; missingParams: string[] } {
  const requiredParams = getModelRequiredParams(modelId);

  const missingParams: string[] = [];

  for (const param of requiredParams) {
    // 特殊处理图片相关参数
    if (
      params[param] === undefined ||
      params[param] === null ||
      params[param] === ''
    ) {
      missingParams.push(param);
    }
  }

  return {
    isValid: missingParams.length === 0,
    missingParams,
  };
}

// Helper function to calculate credits for a model
export function calculateModelCredits(
  modelId: string,
  params: Record<string, any>
): number {
  const config = getModelConfig(modelId);
  if (!config || !config.calculateCredits) {
    return 0; // 如果没有配置积分计算函数，返回0
  }

  return config.calculateCredits(params);
}

// Helper function to get effective schema with dynamic updates
export function getEffectiveSchema(
  modelId: string,
  params: Record<string, any>
): JsonSchema | null {
  const config = getModelConfig(modelId);
  if (!config) return null;

  // 如果模型配置了 updateSchema 函数，就调用它
  if (config.updateSchema) {
    return config.updateSchema(params, config.schema);
  }

  // 否则，返回原始 schema
  return config.schema;
}

// Helper function to get pricing description for a model
export function getModelPricingDescription(
  modelId: string,
  params: Record<string, any>,
  t?: any
): string {
  const config = getModelConfig(modelId);
  if (!config || !config.getPricingDescription) {
    return 'Pricing not available';
  }

  return config.getPricingDescription(params, t);
}
