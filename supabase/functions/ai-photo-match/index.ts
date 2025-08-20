// /supabase/functions/ai-photo-match/index.ts
import { admin } from "../_shared/supabase.ts";
import { jsonResponse } from "../_shared/util.ts";
import { toBase64FromRequest } from "../_shared/image.ts";

type Candidate = { brand: string; model: string; reference?: string; confidence: number; model_id?: string };

async function heuristicCandidates(): Promise<Candidate[]> {
  // TODO: replace with actual ML service (CLIP embeddings).
  // For now, return 3 popular models as placeholders.
  return [
    { brand: "Rolex", model: "Submariner Date", reference: "116610LN", confidence: 0.62 },
    { brand: "Omega", model: "Speedmaster Professional", reference: "311.30.42.30.01.005", confidence: 0.54 },
    { brand: "Patek Philippe", model: "Nautilus", reference: "5711/1A", confidence: 0.33 }
  ];
}

async function attachModelIds(cands: Candidate[]) {
  for (const c of cands) {
    const { data } = await admin
      .from("model")
      .select("id, name, reference, brand_id")
      .ilike("name", `%${c.model}%`)
      .maybeSingle();
    c.model_id = data?.id;
  }
  return cands;
}

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") return jsonResponse({ error: "POST only" }, 405);
    // We read image but don't use it in heuristic; keep for future ML
    await toBase64FromRequest(req).catch(()=>null);
    let cands = await heuristicCandidates();
    cands = await attachModelIds(cands);
    return jsonResponse({ ok: true, candidates: cands });
  } catch (e) {
    return jsonResponse({ error: (e as Error).message }, 500);
  }
});
