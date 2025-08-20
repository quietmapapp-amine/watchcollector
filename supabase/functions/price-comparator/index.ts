import { admin } from "../_shared/supabase.ts";
import { jsonResponse, median, iqr, filterOutliers } from "../_shared/util.ts";

type PriceSource = "ebay" | "chrono24" | "watchcharts";
type Input = { brand: string; model_ref: string; limit?: number };

async function fetchEbay(_brand:string,_ref:string): Promise<number[]> { return Array.from({length: 10}, () => 6000 + Math.random()*3000); }
async function fetchChrono24(_brand:string,_ref:string): Promise<number[]> { return Array.from({length: 8}, () => 6200 + Math.random()*2800); }
async function fetchWatchCharts(_brand:string,_ref:string): Promise<number[]> { return Array.from({length: 6}, () => 5800 + Math.random()*3200); }

Deno.serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "POST only" }, 405);
  const { brand, model_ref }: Input = await req.json();
  if (!brand || !model_ref) return jsonResponse({ error: "brand & model_ref required" }, 400);

  const sources: [PriceSource, Promise<number[]>][] = [
    ["ebay", fetchEbay(brand, model_ref)],
    ["chrono24", fetchChrono24(brand, model_ref)],
    ["watchcharts", fetchWatchCharts(brand, model_ref)],
  ];

  const results: Record<string, number[]> = {};
  for (const [name, p] of sources) results[name] = await p;
  const flat = Object.values(results).flat().map(v => Math.round(v));
  const filtered = filterOutliers(flat);
  const { p25, p75 } = iqr(filtered);
  const med = median(filtered);

  // persist sample (optional)
  const currency = "EUR";
  const now = new Date().toISOString();
  const rows = Object.entries(results).flatMap(([source, arr]) =>
    arr.slice(0, 10).map(price => ({
      brand, model_ref, source, currency, price, url: null as unknown as string, fetched_at: now
    }))
  );
  if (rows.length) await admin.from("market_prices").insert(rows as any);

  return jsonResponse({
    ok: true,
    brand, model_ref,
    summary: { median: med, p25, p75, sample: filtered.length },
    by_source: Object.fromEntries(Object.entries(results).map(([k, v]) => [k, { count: v.length, min: Math.min(...v), max: Math.max(...v) }]))
  });
});
