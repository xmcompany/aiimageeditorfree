import { db } from '@/core/db';
import { config } from '@/config/db/schema';

async function run() {
  const keys: [string, string][] = [
    ['checkin_enabled', 'true'],
    ['checkin_week1_credits', '1'],
    ['checkin_week2_credits', '2'],
    ['checkin_week3_credits', '3'],
    ['checkin_max_credits', '200'],
    ['checkin_credits_valid_days', '0'],
    ['referral_enabled', 'true'],
    ['referral_reward_rate', '0.2'],
    ['referral_max_credits', '2000'],
    ['referral_reward_days', '30'],
  ];
  for (const [name, value] of keys) {
    await db().insert(config).values({ name, value })
      .onConflictDoUpdate({ target: config.name, set: { value } });
    console.log(`✅ ${name} = ${value}`);
  }
  console.log('\nDone!');
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
