// /supabase/functions/prices-snapshot/index.ts
import { admin } from "../_shared/supabase.ts";
import { jsonResponse, median, iqr, filterOutliers } from "../_shared/util.ts";

type Input = { model_id?: string };

async function fetchMockCompletedPrices(modelId: string): Promise<number[]> {
  // TODO: replace with real adapters (eBay, WatchCharts, auctions)
  // mock: returns ~20 prices around 5k–9k
  const base = 7000; const jitter = () => base + (Math.random()-0.5)*2000;
  return Array.from({length: 20}).map(jitter).map(v => Math.max(500, Math.round(v)));
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "POST only" }, 405);
  const { model_id }: Input = await req.json().catch(()=> ({}));
  if (!model_id) return jsonResponse({ error: "model_id required" }, 400);

  // 1) Pull recent completed prices (mock)
  const prices = await fetchMockCompletedPrices(model_id);
  const filtered = filterOutliers(prices);
  const med = median(filtered);
  const { p25, p75 } = iqr(filtered);

  // 2) Upsert snapshot
  const { error } = await admin.from("price_snapshot").insert({
    model_id,
    median: med,
    p25,
    p75,
    sample_size: filtered.length,
    source_breakdown: { mock: filtered.length }
  });
  if (error) return jsonResponse({ error: error.message }, 500);

  return jsonResponse({ ok: true, model_id, median: med, p25, p75, sample_size: filtered.length });
});
