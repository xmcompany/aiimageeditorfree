/**
 * 更新 how-to-create-ai-videos-for-free 文章中的链接
 * 用法: npx tsx scripts/with-env.ts npx tsx scripts/update-blog-post-links.ts
 */
import { db } from '@/core/db';
import { post } from '@/config/db/schema';
import { eq } from 'drizzle-orm';

const SLUG = 'how-to-create-ai-videos-for-free';

const UPDATED_CONTENT = `Creating AI videos used to cost money. Not anymore. AI Video Generator Free gives you multiple ways to earn credits — the currency that powers every video you generate — completely free. Here's a breakdown of all three.

## What Are Credits?

Credits are the in-platform currency used to generate AI videos. Every time you create a video, a small number of credits is deducted based on the model, resolution, and duration you choose. The good news: you don't need to buy credits to get started.

---

## Way 1: Sign-Up Bonus — Instant Free Credits

The moment you create a free account, credits land in your wallet automatically. No credit card. No trial period. No strings attached.

**How it works:**
1. Go to AI Video Generator Free and click **[Sign Up](/sign-up)**
2. Create your account with Google or email
3. Credits are added to your account instantly
4. Head to the AI Video Generator and start creating

This is the fastest way to get started. Most users generate their first AI video within minutes of signing up.

---

## Way 2: Daily Check-In — Earn Credits Every Day

Log in and check in daily to build a streak and earn more credits over time. The longer your streak, the more you earn per day.

**Reward schedule:**

| Streak | Credits per Day |
|--------|----------------|
| Day 1–7 | +1 credit/day |
| Day 8–14 | +2 credits/day |
| Day 15+ | +3 credits/day |

**Rules:**
- Check in once per day from your [Activity dashboard](/activity/checkin)
- Missing a day resets your streak back to Day 1
- Maximum of 200 credits earned through check-ins total

**Tips to maximize check-in credits:**
- Set a daily reminder — it only takes one click
- Aim for a 15-day streak to unlock the highest daily reward
- Even if you're not generating videos that day, check in to keep your streak alive

---

## Way 3: Refer a Friend — Earn Up to 2,000 Credits

This is the highest-value way to earn free credits. When someone you refer makes their first purchase, you automatically receive **20% of their paid credits** — up to 2,000 credits per referral.

**How it works:**
1. Go to your [Check-in & Referral page](/activity/checkin)
2. Copy your unique referral link
3. Share it with friends, on social media, or in your content
4. When your friend signs up through your link and makes a purchase, your reward is credited within 30 days

**Example:**
> Your friend buys a 500-credit pack → You earn 100 credits automatically

**Why this matters:**
If you're a content creator, YouTuber, or anyone with an audience, the referral program can keep your credit balance topped up indefinitely — just by sharing a link you'd recommend anyway.

---

## Summary: 3 Ways to Get Free Credits

| Method | Credits | When |
|--------|---------|------|
| Sign-Up Bonus | Free credits on registration | Instant |
| Daily Check-In | Up to 200 credits total | Daily |
| Refer a Friend | Up to 2,000 credits per referral | Within 30 days of friend's purchase |

---

## Start Creating AI Videos for Free

You now have everything you need to generate AI videos without spending anything. Sign up, check in daily, and share your referral link — your credit balance will grow while you create.

Ready to start? Head to the [AI Video Generator](/ai-video-generator) and generate your first video free.

- [Sign Up Free →](/sign-up)
- [Daily Check-In →](/activity/checkin)
- [Referral & Rewards →](/activity/checkin)`;

async function run() {
  console.log('\n=== Update Blog Post Links ===\n');

  const existing = await db()
    .select()
    .from(post)
    .where(eq(post.slug, SLUG))
    .limit(1);

  if (existing.length === 0) {
    console.log(`❌ Post not found: ${SLUG}`);
    process.exit(1);
  }

  await db()
    .update(post)
    .set({ content: UPDATED_CONTENT })
    .where(eq(post.slug, SLUG));

  console.log(`✅ Updated post: ${SLUG}`);
  console.log(`\n🎉 Done! View at /blog/${SLUG}\n`);
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
