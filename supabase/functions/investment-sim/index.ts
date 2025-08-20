import { admin } from "../_shared/supabase.ts";
import { jsonResponse } from "../_shared/util.ts";

type Input = { model_id?: string; model_ref?: string; date_purchase: string; price_purchase: number };

async function latestModelMedian(model_id?: string, model_ref?: string): Promise<number|null> {
  if (model_id) {
    const { data } = await admin.from("price_snapshot").select("median,captured_at").eq("model_id", model_id).order("captured_at",{ascending:false}).limit(1).maybeSingle();
    return data?.median ?? null;
  }
  if (model_ref) {
    const { data: m } = await admin.from("model").select("id").eq("reference", model_ref).maybeSingle();
    if (!m?.id) return null;
    const { data } = await admin.from("price_snapshot").select("median,captured_at").eq("model_id", m.id).order("captured_at",{ascending:false}).limit(1).maybeSingle();
    return data?.median ?? null;
  }
  return null;
}

async function growthFromBaseline(name:string, since:string): Promise<number|null> {
  const { data: start } = await admin.from("index_baseline").select("value").eq("name", name).gte("d", since).order("d",{ascending:true}).limit(1).maybeSingle();
  const { data: end } = await admin.from("index_baseline").select("value").eq("name", name).order("d",{ascending:false}).limit(1).maybeSingle();
  if (!start?.value || !end?.value) return null;
  return (end.value - start.value)/start.value;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "POST only" }, 405);
  const { model_id, model_ref, date_purchase, price_purchase }: Input = await req.json();
  if (!date_purchase || !price_purchase) return jsonResponse({ error: "date_purchase & price_purchase required" }, 400);

  const current = await latestModelMedian(model_id, model_ref);
  const model_growth_pct = current ? (current - price_purchase)/price_purchase : null;
  const gold_growth_pct = await growthFromBaseline("gold", date_purchase);
  const sp500_growth_pct = await growthFromBaseline("sp500", date_purchase);

  return jsonResponse({
    ok: true,
    model_current_value: current,
    model_growth_pct,
    gold_growth_pct,
    sp500_growth_pct
  });
});
