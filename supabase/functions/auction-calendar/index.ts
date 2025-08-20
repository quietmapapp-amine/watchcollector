import { admin } from "../_shared/supabase.ts";
import { jsonResponse } from "../_shared/util.ts";

async function fetchAuctions(): Promise<Array<{house:string, brand?:string, model?:string, model_ref?:string, event_date:string, lot_url?:string}>> {
  // TODO: Replace with real RSS/HTML parsers.
  const today = new Date();
  const in10 = new Date(today.getTime() + 10*86400000);
  return [
    { house: "Phillips", brand: "Rolex", model: "Submariner", model_ref: "116610LN", event_date: in10.toISOString().slice(0,10), lot_url: "https://example.com/phillips/lot1" }
  ];
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "POST only" }, 405);
  const lots = await fetchAuctions();
  if (!lots.length) return jsonResponse({ ok: true, inserted: 0 });

  const { error } = await admin.from("auction_events").insert(lots as any);
  if (error) return jsonResponse({ error: error.message }, 500);

  return jsonResponse({ ok: true, inserted: lots.length });
});
