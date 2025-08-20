import { admin } from "../_shared/supabase.ts";
import { jsonResponse } from "../_shared/util.ts";

type Input = { user_id: string };

Deno.serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "POST only" }, 405);
  const { user_id }: Input = await req.json();
  if (!user_id) return jsonResponse({ error: "user_id required" }, 400);

  // Diversity: unique brands / total
  const { data: brands } = await admin.rpc("sql", { query: `
    select count(distinct b.name)::int as uniq, count(*)::int as total
    from watch_instance wi
    join model m on m.id = wi.model_id
    join brand b on b.id = m.brand_id
    where wi.user_id = '${user_id}'
  ` } as any);
  const uniq = brands?.[0]?.uniq ?? 0;
  const total = brands?.[0]?.total ?? 0;
  const diversity = total ? Math.min(1, uniq / Math.max(3,total)) : 0;

  // Rarity: use latest liquidity_rarity_snapshot rarity_score per model (avg)
  const { data: rar } = await admin.rpc("sql", { query: `
    select avg(lrs.rarity_score)::float as r
    from watch_instance wi
    join liquidity_rarity_snapshot lrs on lrs.model_id = wi.model_id
    where wi.user_id = '${user_id}'
  ` } as any);
  const rarity = Math.min(1, Math.max(0, rar?.[0]?.r ?? 0));

  // Liquidity: bucket mapping (fast=1, medium=0.5, slow=0)
  const { data: liq } = await admin.rpc("sql", { query: `
    select avg(case lrs.liquidity_bucket when 'fast' then 1.0 when 'medium' then 0.5 else 0 end)::float as l
    from watch_instance wi
    join liquidity_rarity_snapshot lrs on lrs.model_id = wi.model_id
    where wi.user_id = '${user_id}'
  ` } as any);
  const liquidity = Math.min(1, Math.max(0, liq?.[0]?.l ?? 0));

  // Weighted score
  const score = Math.round(100 * (0.4*diversity + 0.3*rarity + 0.3*liquidity));

  await admin.from("profile").update({ collection_score: score }).eq("id", user_id);
  return jsonResponse({ ok: true, score });
});
