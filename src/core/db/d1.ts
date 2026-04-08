/// <reference types="@cloudflare/workers-types" />
import { drizzle } from 'drizzle-orm/d1';

// D1 singleton instance (reused across requests in the same isolate)
let d1DbInstance: ReturnType<typeof drizzle> | null = null;

/**
 * Get the D1 database binding from Cloudflare Workers environment.
 *
 * In Workers / OpenNext on Cloudflare, the D1 binding is available via
 * `process.env.DB` (OpenNext injects CF bindings into process.env) or
 * via `getRequestContext().env.DB` from @cloudflare/next-on-pages.
 *
 * The binding name "DB" must match the `[[d1_databases]]` binding in wrangler.toml.
 */
function getD1Binding(): D1Database {
  // 1. Try process.env (OpenNext on Cloudflare injects bindings here)
  const fromEnv = (process.env as any).DB;
  if (fromEnv) return fromEnv;

  // 2. Try globalThis.Cloudflare (available in Workers runtime via opennextjs-cloudflare)
  const cf = (globalThis as any).Cloudflare;
  if (cf?.env?.DB) return cf.env.DB;

  throw new Error(
    'D1 database binding "DB" not found. Make sure [[d1_databases]] is configured in wrangler.toml with binding = "DB".'
  );
}

export function getD1Db() {
  if (d1DbInstance) return d1DbInstance;

  const binding = getD1Binding();
  d1DbInstance = drizzle(binding);
  return d1DbInstance;
}
