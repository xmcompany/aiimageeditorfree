/**
 * Content moderation: keyword filter + OpenAI Moderation API (double protection)
 */

// Single-word blocklist: any one of these alone is enough to block
const BLOCKED_SINGLE = [
  // explicit sexual
  'porn', 'pornography', 'xxx', 'hentai', 'nsfw',
  'penis', 'vagina', 'masturbat', 'orgasm', 'intercourse',
  'rape', 'incest', 'lolita', 'loli', 'shota', 'child porn',
  // extreme violence
  'gore', 'beheading', 'decapitat', 'dismember', 'snuff',
  // racial slurs
  'nigger', 'faggot', 'chink', 'spic', 'kike',
  // Chinese explicit
  '鑹叉儏', '鎬х埍', '鍋氱埍', '寮哄ジ', '涔变鸡', '鍎跨鑹叉儏', '鏂╅', '閰峰垜', '鑲㈣В',
];

// Combination rules: ALL keywords in a group must appear together to block
const BLOCKED_COMBINATIONS = [
  // crush/squash + person 鈫?size fetish violence
  { words: ['crush', 'man'], label: 'violence' },
  { words: ['crush', 'woman'], label: 'violence' },
  { words: ['crush', 'person'], label: 'violence' },
  { words: ['crush', 'human'], label: 'violence' },
  { words: ['squash', 'man'], label: 'violence' },
  { words: ['squash', 'person'], label: 'violence' },
  { words: ['squash', 'human'], label: 'violence' },
  // sit on + tiny person
  { words: ['sit on', 'tiny'], label: 'violence' },
  { words: ['sit on', 'shrunken'], label: 'violence' },
  { words: ['sit on', 'miniature'], label: 'violence' },
  // crunching/squashing sound + person
  { words: ['crunching', 'person'], label: 'violence' },
  { words: ['crunching', 'man'], label: 'violence' },
  { words: ['squashing', 'person'], label: 'violence' },
  { words: ['squashing', 'man'], label: 'violence' },
  // taped + spreadeagled
  { words: ['taped', 'spreadeagled'], label: 'violence' },
  { words: ['taped', 'spread-eagled'], label: 'violence' },
  { words: ['bound', 'spreadeagled'], label: 'violence' },
  // tiny man scenarios
  { words: ['tiny man', 'sit'], label: 'violence' },
  { words: ['tiny man', 'crush'], label: 'violence' },
  { words: ['tiny person', 'sit'], label: 'violence' },
  { words: ['shrunken man', 'sit'], label: 'violence' },
  // racial + degrading action
  { words: ['black man', 'crush'], label: 'hate' },
  { words: ['african', 'crush'], label: 'hate' },
  { words: ['african', 'squash'], label: 'hate' },
  // nude/naked + minor indicators
  { words: ['nude', 'child'], label: 'sexual/minors' },
  { words: ['nude', 'minor'], label: 'sexual/minors' },
  { words: ['naked', 'child'], label: 'sexual/minors' },
  { words: ['naked', 'minor'], label: 'sexual/minors' },
  { words: ['naked', 'underage'], label: 'sexual/minors' },
  // sexual + minor
  { words: ['sexual', 'child'], label: 'sexual/minors' },
  { words: ['sexual', 'minor'], label: 'sexual/minors' },
  { words: ['erotic', 'child'], label: 'sexual/minors' },
  { words: ['erotic', 'minor'], label: 'sexual/minors' },
  // torture combos
  { words: ['torture', 'person'], label: 'violence' },
  { words: ['torture', 'man'], label: 'violence' },
  { words: ['mutilat', 'body'], label: 'violence' },
];

export interface ModerationResult {
  flagged: boolean;
  reason?: string;
}

/**
 * First pass: fast local keyword filter (single words + combinations)
 */
export function keywordFilter(text: string): ModerationResult {
  if (!text) return { flagged: false };
  const lower = text.toLowerCase();

  // 1. single-word check
  for (const kw of BLOCKED_SINGLE) {
    if (lower.includes(kw)) {
      return { flagged: true, reason: 'content_violation' };
    }
  }

  // 2. combination check: all words in group must appear
  for (const rule of BLOCKED_COMBINATIONS) {
    if (rule.words.every((w) => lower.includes(w))) {
      return { flagged: true, reason: rule.label };
    }
  }

  return { flagged: false };
}

/**
 * Second pass: OpenAI Moderation API
 * Supports text and image URL inputs
 */
export async function openaiModeration(
  input: { text?: string; imageUrl?: string }
): Promise<ModerationResult> {
  const apiKey = process.env.openAI_key;
  if (!apiKey) {
    // No key configured, skip
    return { flagged: false };
  }

  try {
    const inputPayload: any[] = [];

    if (input.text) {
      inputPayload.push({ type: 'text', text: input.text });
    }
    if (input.imageUrl) {
      inputPayload.push({ type: 'image_url', image_url: { url: input.imageUrl } });
    }

    if (inputPayload.length === 0) return { flagged: false };

    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'omni-moderation-latest',
        input: inputPayload,
      }),
    });

    if (!response.ok) {
      console.error('[moderation] OpenAI API error:', response.status);
      return { flagged: false };
    }

    const data = await response.json() as any;
    const result = data?.results?.[0];

    if (result?.flagged) {
      // Find which category triggered
      const categories = result.categories || {};
      const triggered = Object.keys(categories).find((k) => categories[k]);
      return { flagged: true, reason: triggered || 'content_violation' };
    }

    return { flagged: false };
  } catch (e) {
    console.error('[moderation] OpenAI moderation failed:', e);
    // Fail open: don't block user if moderation service is down
    return { flagged: false };
  }
}

/**
 * Full moderation check: keyword filter first, then OpenAI
 */
export async function moderateContent(input: {
  text?: string;
  imageUrl?: string;
}): Promise<ModerationResult> {
  // 1. keyword filter (fast, no network)
  if (input.text) {
    const kwResult = keywordFilter(input.text);
    if (kwResult.flagged) return kwResult;
  }

  // 2. OpenAI moderation (accurate, handles images)
  return openaiModeration(input);
}
