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
  hailuo: {
    id: 'hailuo',
    name: 'Hailuo',
    modelName: 'minimax/hailuo-02',
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

      // 根据图片中的定价表计算积分
      if (resolution === '768p') {
        return duration === 6 ? 9 : 15; // 6秒9积分，10秒15积分
      } else if (resolution === '1080p') {
        return 16; // 1080p只支持6秒，16积分
      }

      return 9; // 默认768p 6秒消耗
    },
    updateSchema: (params: Record<string, any>, schema: JsonSchema) => {
      // 创建 schema 的深拷贝，避免修改原始配置
      const newSchema = JSON.parse(JSON.stringify(schema)) as JsonSchema;

      // 规则1：如果时长是 10 秒，则分辨率只允许是 768p
      if (params.duration === 10) {
        newSchema.properties.resolution.enum = ['768p'];
        newSchema.properties.resolution.description =
          '10 seconds duration is only available for 768p resolution.';
      }

      // 规则2：如果分辨率是 1080p，则时长只允许是 6 秒
      if (params.resolution === '1080p') {
        newSchema.properties.duration.enum = [6];
        newSchema.properties.duration.description =
          '1080p resolution only supports 6 seconds duration.';
      }

      // 规则3：如果分辨率是 768p，则时长可以是 6 或 10 秒
      if (params.resolution === '768p') {
        newSchema.properties.duration.enum = [6, 10];
        newSchema.properties.duration.description =
          '768p resolution supports both 6 and 10 seconds duration.';
      }

      return newSchema;
    },
    getPricingDescription: (params: Record<string, any>, t?: any) => {
      const resolution = params.resolution || '768p';

      if (resolution === '768p') {
        return t
          ? t('hero_input.pricing_descriptions.hailuo_768p')
          : '768p: 1.5 credits/second (6s=9, 10s=15)';
      } else if (resolution === '1080p') {
        return t
          ? t('hero_input.pricing_descriptions.hailuo_1080p')
          : '1080p: 2.67 credits/second (6s only=16)';
      }

      return t
        ? t('hero_input.pricing_descriptions.hailuo_standard')
        : 'Standard pricing: 1.5 credits/second';
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
        duration: {
          enum: [6, 10],
          type: 'integer',
          title: 'Duration',
          description:
            'Duration of the video in seconds. 10 seconds is only available for 768p resolution.',
          default: 6,
          'x-order': 2,
        },
        resolution: {
          enum: ['768p', '1080p'],
          type: 'string',
          title: 'Resolution',
          description:
            'Pick between standard 768p, or pro 1080p resolution. The pro model is not just high resolution, it is also higher quality.',
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
        first_frame_image: {
          type: 'string',
          title: 'First Frame Image',
          format: 'uri',
          'x-order': 1,
          description:
            'First frame image for video generation. The output video will have the same aspect ratio as this image.',
        },
      },
    },
  },
  kling: {
    id: 'kling',
    name: 'Kling',
    modelName: 'kwaivgi/kling-v1.6-standard',
    img: '/imgs/logos/kling.svg',
    parseParams: (params: Record<string, any>) => {
      const parsedParams = { ...params };

      if (params.startImageUrl) {
        parsedParams['start_image'] = params.startImageUrl;
      }

      delete parsedParams.startImageUrl;

      return parsedParams;
    },
    calculateCredits: (params: Record<string, any>) => {
      const duration = params.duration || 5;
      // 5秒视频消耗9积分，10秒视频消耗17积分（基于 $0.05/秒的成本和40%利润率计算得出）
      return duration === 5 ? 9 : 17;
    },
    getPricingDescription: (params: Record<string, any>, t?: any) => {
      return t
        ? t('hero_input.pricing_descriptions.kling')
        : 'Kling: 1.8 credits/second (5s=9, 10s=17)';
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
          description: 'Things you do not want to see in the video',
        },
        aspect_ratio: {
          enum: ['16:9', '9:16', '1:1'],
          type: 'string',
          title: 'Aspect Ratio',
          description:
            'Aspect ratio of the video. Ignored if start_image is provided.',
          default: '16:9',
          'x-order': 2,
        },
        start_image: {
          type: 'string',
          title: 'Start Image',
          format: 'uri',
          'x-order': 3,
          description: 'First frame of the video',
        },
        reference_images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'uri',
          },
          title: 'Reference Images',
          maxItems: 4,
          'x-order': 4,
          description:
            'Reference images to use in video generation (up to 4 images). Also known as scene elements.',
        },
        cfg_scale: {
          type: 'number',
          title: 'Cfg Scale',
          default: 0.5,
          maximum: 1,
          minimum: 0,
          'x-order': 5,
          description:
            "Flexibility in video generation; The higher the value, the lower the model's degree of flexibility, and the stronger the relevance to the user's prompt.",
        },
        duration: {
          enum: [5, 10],
          type: 'integer',
          title: 'Duration',
          description: 'Duration of the video in seconds',
          default: 5,
          'x-order': 6,
        },
      },
    },
  },
  wan: {
    id: 'wan',
    name: 'Wan',
    modelName: 'wavespeedai/wan-2.1-i2v-480p',
    img: '/imgs/logos/wan.svg',
    parseParams: (params: Record<string, any>) => {
      const parsedParams = { ...params };

      if (params.startImageUrl) {
        parsedParams['image'] = params.startImageUrl;
      }

      delete parsedParams.startImageUrl;

      return parsedParams;
    },
    calculateCredits: () => {
      // Wan 模型基础成本为 $0.45 (基于约5秒视频)(在40%利润率下，定价为15积分)
      return 15;
    },
    getPricingDescription: (params: Record<string, any>, t?: any) => {
      return t
        ? t('hero_input.pricing_descriptions.wan')
        : 'Wan: Fixed 15 credits per generation (~5s video)';
    },
    schema: {
      type: 'object',
      title: 'Input',
      required: ['prompt', 'startImageUrl'],
      properties: {
        prompt: {
          type: 'string',
          title: 'Prompt',
          'x-order': 0,
          description: 'Text prompt for image generation',
        },
        negative_prompt: {
          type: 'string',
          title: 'Negative Prompt',
          default: '',
          'x-order': 1,
          description: 'Negative prompt to avoid certain elements',
        },
        aspect_ratio: {
          enum: ['16:9', '9:16'],
          type: 'string',
          title: 'Aspect Ratio',
          description: 'Aspect ratio of the output video.',
          default: '16:9',
          'x-order': 2,
        },
        image: {
          type: 'string',
          title: 'Image',
          format: 'uri',
          'x-order': 3,
          description: 'Image for use as the initial frame of the video.',
        },
        fast_mode: {
          enum: ['Off', 'Balanced', 'Fast'],
          type: 'string',
          title: 'fast_mode',
          description:
            'Speed up generation with different levels of acceleration. Faster modes may degrade quality somewhat. The speedup is dependent on the content, so different videos may see different speedups.',
          default: 'Balanced',
          'x-order': 4,
        },
        seed: {
          type: 'integer',
          title: 'Seed',
          'x-order': 5,
          description: 'Random seed. Set for reproducible generation',
        },
        sample_guide_scale: {
          type: 'number',
          title: 'Sample Guide Scale',
          default: 5,
          maximum: 10,
          minimum: 1,
          'x-order': 6,
          description: 'Guidance scale for generation',
        },
        sample_steps: {
          type: 'integer',
          title: 'Sample Steps',
          default: 30,
          maximum: 40,
          minimum: 1,
          'x-order': 7,
          description: 'Number of inference steps',
        },
        sample_shift: {
          type: 'integer',
          title: 'Sample Shift',
          default: 3,
          maximum: 10,
          minimum: 0,
          'x-order': 8,
          description: 'Flow shift parameter for video generation',
        },
        lora_weights: {
          type: 'string',
          title: 'Lora Weights',
          'x-order': 9,
          description:
            'Load LoRA weights. Supports HuggingFace URLs in the format huggingface.co/<owner>/<model-name>, CivitAI URLs in the format civitai.com/models/<id>[/<model-name>], or arbitrary .safetensors URLs from the Internet.',
        },
        lora_scale: {
          type: 'number',
          title: 'Lora Scale',
          default: 1,
          maximum: 4,
          minimum: 0,
          'x-order': 10,
          description:
            'Determines how strongly the main LoRA should be applied. Sane results between 0 and 1 for base inference. You may still need to experiment to find the best value for your particular lora.',
        },
        disable_safety_checker: {
          type: 'boolean',
          title: 'Disable Safety Checker',
          default: false,
          'x-order': 11,
          description: 'Disable safety checker for generated videos',
        },
      },
    },
  },
  pixverse: {
    id: 'pixverse',
    name: 'Pixverse',
    modelName: 'pixverse/pixverse-v4.5',
    img: '/imgs/logos/pixverse.svg',
    parseParams: (params: Record<string, any>) => {
      const parsedParams = { ...params };

      if (params.startImageUrl) {
        parsedParams['image'] = params.startImageUrl;
      }

      delete parsedParams.startImageUrl;

      return parsedParams;
    },
    calculateCredits: (params: Record<string, any>) => {
      const quality = params.quality || '540p';
      const duration = params.duration || 5;
      const motion = params.motion_mode || 'normal';

      if (quality === '1080p') {
        // 1080p 只有一种情况
        return 27; // 5s, normal
      }

      if (quality === '720p') {
        if (duration === 5 && motion === 'normal') return 14;
        if (duration === 5 && motion === 'smooth') return 27;
        if (duration === 8 && motion === 'normal') return 27;
      }

      // 涵盖 360p 和 540p
      if (['360p', '540p'].includes(quality)) {
        if (duration === 5 && motion === 'normal') return 10;
        if (duration === 5 && motion === 'smooth') return 20;
        if (duration === 8 && motion === 'normal') return 20;
      }

      return 10; // 提供一个默认的最低值
    },
    // 新增：处理 Pixverse 的参数禁用规则
    updateSchema: (params, schema) => {
      const newSchema = JSON.parse(JSON.stringify(schema));
      const { properties } = newSchema;

      // 规则1：1080p 不支持 8s 时长和 smooth 动态
      if (params.quality === '1080p') {
        properties.duration.enum = [5];
        properties.motion_mode.enum = ['normal'];
      }

      // 规则2：smooth 动态只在 5s 时长下可用
      if (params.motion_mode === 'smooth') {
        properties.duration.enum = [5];
        // smooth 动态在 1080p 下不可用
        if (properties.quality.enum.includes('1080p')) {
          properties.quality.enum = properties.quality.enum.filter(
            (q: string) => q !== '1080p'
          );
        }
      }

      // 规则3：8s 时长不支持 smooth 动态
      if (params.duration === 8) {
        properties.motion_mode.enum = ['normal'];
      }

      return newSchema;
    },
    getPricingDescription: (params: Record<string, any>, t?: any) => {
      const quality = params.quality || '540p';
      const motion = params.motion_mode || 'normal';

      if (quality === '1080p') {
        return t
          ? t('hero_input.pricing_descriptions.pixverse_1080p')
          : 'Pixverse 1080p: 5.4 credits/second (5s=27, normal only)';
      } else if (quality === '720p') {
        return motion === 'smooth'
          ? t
            ? t('hero_input.pricing_descriptions.pixverse_720p_smooth')
            : 'Pixverse 720p: 5.4 credits/second (smooth=2x cost)'
          : t
          ? t('hero_input.pricing_descriptions.pixverse_720p_normal')
          : 'Pixverse 720p: 2.8 credits/second (5s=14, 8s=27)';
      } else {
        return motion === 'smooth'
          ? t
            ? t('hero_input.pricing_descriptions.pixverse_low_smooth')
            : 'Pixverse 360p/540p: 4 credits/second (smooth=2x cost)'
          : t
          ? t('hero_input.pricing_descriptions.pixverse_low_normal')
          : 'Pixverse 360p/540p: 2 credits/second (5s=10, 8s=20)';
      }
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
        image: {
          type: 'string',
          title: 'Image',
          format: 'uri',
          'x-order': 1,
          nullable: true,
          description: 'Image to use for the first frame of the video',
        },
        last_frame_image: {
          type: 'string',
          title: 'Last Frame Image',
          format: 'uri',
          'x-order': 2,
          nullable: true,
          description:
            'Use to generate a video that transitions from the first image to the last image. Must be used with image.',
        },
        quality: {
          enum: ['360p', '540p', '720p', '1080p'],
          type: 'string',
          title: 'quality',
          description:
            'Resolution of the video. 360p and 540p cost the same, but 720p and 1080p cost more. See the README for details.',
          default: '540p',
          'x-order': 3,
        },
        aspect_ratio: {
          enum: ['16:9', '9:16', '1:1'],
          type: 'string',
          title: 'aspect_ratio',
          description: 'Aspect ratio of the video',
          default: '16:9',
          'x-order': 4,
        },
        duration: {
          enum: [5, 8],
          type: 'integer',
          title: 'duration',
          description:
            'Duration of the video in seconds. 8 second videos cost twice as much as 5 second videos. (1080p does not support 8 second duration)',
          default: 5,
          'x-order': 5,
        },
        motion_mode: {
          enum: ['normal', 'smooth'],
          type: 'string',
          title: 'motion_mode',
          description:
            'Motion mode for the video. Smooth videos generate more frames, so they cost twice as much. (smooth is only available when using a 5 second duration, 1080p does not support smooth motion)',
          default: 'normal',
          'x-order': 6,
        },
        negative_prompt: {
          type: 'string',
          title: 'Negative Prompt',
          default: '',
          'x-order': 7,
          description: 'Negative prompt to avoid certain elements in the video',
        },
        seed: {
          type: 'integer',
          title: 'Seed',
          'x-order': 8,
          description: 'Random seed. Set for reproducible generation',
        },
        style: {
          enum: ['None', 'anime', '3d_animation', 'clay', 'cyberpunk', 'comic'],
          type: 'string',
          title: 'style',
          description: 'Style of the video',
          default: 'None',
          'x-order': 9,
        },
        effect: {
          enum: [
            'None',
            "Let's YMCA!",
            'Subject 3 Fever',
            'Ghibli Live!',
            'Suit Swagger',
            'Muscle Surge',
            '360° Microwave',
            'Warmth of Jesus',
            'Emergency Beat',
            'Anything, Robot',
            'Kungfu Club',
            'Mint in Box',
            'Retro Anime Pop',
            'Vogue Walk',
            'Mega Dive',
            'Evil Trigger',
          ],
          type: 'string',
          title: 'effect',
          description:
            'Special effect to apply to the video. Does not work with last_frame_image.',
          default: 'None',
          'x-order': 10,
        },
        sound_effect_switch: {
          type: 'boolean',
          title: 'Sound Effect Switch',
          default: false,
          'x-order': 11,
          description: 'Enable background music or sound effects',
        },
        sound_effect_content: {
          type: 'string',
          title: 'Sound Effect Content',
          'x-order': 12,
          description:
            'Sound effect prompt. If not given, a random sound effect will be generated.',
        },
      },
    },
  },
  luma: {
    id: 'luma',
    name: 'Luma',
    modelName: 'luma/ray-2-720p',
    img: '/imgs/logos/luma.svg',
    parseParams: (params: Record<string, any>) => {
      const parsedParams = { ...params };

      if (params.startImageUrl) {
        parsedParams['start_image'] = params.startImageUrl;
      }

      delete parsedParams.startImageUrl;

      return parsedParams;
    },
    calculateCredits: (params: Record<string, any>) => {
      const duration = params.duration || 5;
      // 5秒视频消耗10积分，9秒视频消耗18积分（基于 $0.06/秒的成本和40%利润率计算得出）
      return duration === 5 ? 10 : 18;
    },
    getPricingDescription: (params: Record<string, any>, t?: any) => {
      return t
        ? t('hero_input.pricing_descriptions.luma')
        : 'Luma: 2 credits/second (5s=10, 9s=18)';
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
        start_image: {
          type: 'string',
          title: 'Start Image',
          format: 'uri',
          'x-order': 1,
          description:
            'An optional first frame of the video to use as the starting frame.',
        },
        end_image: {
          type: 'string',
          title: 'End Image',
          format: 'uri',
          'x-order': 2,
          description:
            'An optional last frame of the video to use as the ending frame.',
        },
        duration: {
          enum: [5, 9],
          type: 'integer',
          title: 'Duration',
          description: 'Duration of the video in seconds',
          default: 5,
          'x-order': 3,
        },
        aspect_ratio: {
          enum: ['1:1', '3:4', '4:3', '9:16', '16:9', '9:21', '21:9'],
          type: 'string',
          title: 'Aspect Ratio',
          description: 'Aspect ratio of the generated video',
          default: '16:9',
          'x-order': 4,
        },
        loop: {
          type: 'boolean',
          title: 'Loop',
          default: false,
          'x-order': 5,
          description:
            'Whether the video should loop, with the last frame matching the first frame for smooth, continuous playback.',
        },
        concepts: {
          type: 'array',
          items: {
            type: 'string',
          },
          title: 'Concepts',
          'x-order': 6,
          description:
            'List of camera concepts to apply to the video generation. Concepts include: truck_left, pan_right, pedestal_down, low_angle, pedestal_up, selfie, pan_left, roll_right, zoom_in, over_the_shoulder, orbit_right, orbit_left, static, tiny_planet, high_angle, bolt_cam, dolly_zoom, overhead, zoom_out, handheld, roll_left, pov, aerial_drone, push_in, crane_down, truck_right, tilt_down, elevator_doors, tilt_up, ground_level, pull_out, aerial, crane_up, eye_level',
        },
      },
    },
  },
  veo_3_1_fast: {
    id: 'veo_3_1_fast',
    name: 'Veo 3.1 Fast',
    modelName: 'google/veo-3.1-fast',
    img: '/imgs/logos/vidu.svg',
    parseParams: (params: Record<string, any>) => {
      const parsedParams = { ...params };
      if (params.startImageUrl) {
        parsedParams['reference_images'] = [params.startImageUrl];
      }
      delete parsedParams.startImageUrl;
      return parsedParams;
    },
    calculateCredits: (params: Record<string, any>) => {
      const duration = params.duration || 5;
      return duration === 5 ? 25 : 50;
    },
    getPricingDescription: (params: Record<string, any>, t?: any) => {
      return t
        ? t('hero_input.pricing_descriptions.veo')
        : 'Veo 3.1 Fast: 5 credits/second (5s=25, 10s=50)';
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
          description: 'Things you do not want to see in the video',
        },
        aspect_ratio: {
          enum: ['16:9', '9:16', '1:1'],
          type: 'string',
          title: 'Aspect Ratio',
          description: 'Aspect ratio of the video.',
          default: '16:9',
          'x-order': 2,
        },
        duration: {
          enum: [5, 10],
          type: 'integer',
          title: 'Duration',
          description: 'Duration of the video in seconds',
          default: 5,
          'x-order': 3,
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
