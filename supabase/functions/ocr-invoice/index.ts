// /supabase/functions/ocr-invoice/index.ts
import { admin } from "../_shared/supabase.ts";
import { jsonResponse } from "../_shared/util.ts";
import { toBase64FromRequest } from "../_shared/image.ts";

type OCRResult = {
  brand?: string; model?: string; reference?: string;
  serial?: string; purchase_price?: number; purchase_currency?: string;
  purchase_date?: string; // ISO date
  raw_text?: string;
};

function extractHeuristics(text: string): Partial<OCRResult> {
  const r: Partial<OCRResult> = { raw_text: text };
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // brand/model naive guess
  const brandMatch = lines.find(l => /(rolex|omega|patek|cartier|tudor|audemars|iwc|grand seiko|seiko|tag heuer)/i.test(l));
  if (brandMatch) r.brand = brandMatch.match(/(rolex|omega|patek|cartier|tudor|audemars|iwc|grand seiko|seiko|tag heuer)/i)?.[1];

  // reference patterns (e.g. 116610LN, 15500ST, 311.30.42.30.01.005)
  const ref = text.match(/\b([A-Z0-9]{4,}[A-Z0-9.-]*)\b/g)?.find(v => /[0-9]/.test(v) && v.length <= 15);
  if (ref) r.reference = ref;

  // serial (very heuristic)
  const serial = text.match(/\b(Serial|S\/N|SN|No\.?)\s*[:#]?\s*([A-Z0-9\-]{5,})/i)?.[2];
  if (serial) r.serial = serial;

  // price + currency
  const priceMatch = text.match(/([\$€£])\s?([\d.,]+)/);
  if (priceMatch) {
    const cur = priceMatch[1];
    const val = parseFloat(priceMatch[2].replace(/[,.](?=\d{3}\b)/g,"").replace(",","."));
    r.purchase_currency = cur === "$" ? "USD" : cur === "€" ? "EUR" : cur === "£" ? "GBP" : undefined;
    r.purchase_price = isFinite(val) ? Math.round(val) : undefined;
  } else {
    const alt = text.match(/\b([0-9]{3,6})(?:[.,][0-9]{2})?\s?(EUR|USD|GBP)\b/i);
    if (alt) {
      r.purchase_currency = alt[2].toUpperCase();
      r.purchase_price = Math.round(parseFloat(alt[1].replace(",",".")));
    }
  }

  // date
  const date = text.match(/\b(20\d{2}[-\/.]\d{1,2}[-\/.]\d{1,2}|\d{1,2}[-\/.]\d{1,2}[-\/.]20\d{2})\b/);
  if (date) {
    const raw = date[1].replace(/[.]/g,"-").replace(/\//g,"-");
    const parts = raw.split("-");
    let iso = raw;
    if (parts[0].length === 2) iso = `20${parts[2]}-${parts[1].padStart(2,"0")}-${parts[0].padStart(2,"0")}`;
    r.purchase_date = new Date(iso).toISOString().slice(0,10);
  }
  return r;
}

async function runVision(base64: string): Promise<OCRResult> {
  const key = Deno.env.get("GOOGLE_VISION_API_KEY");
  if (!key) throw new Error("VISION_KEY_MISSING");
  const url = `https://vision.googleapis.com/v1/images:annotate?key=${key}`;
  const body = {
    requests: [{ image: { content: base64 }, features: [{ type: "TEXT_DETECTION" }] }]
  };
  const res = await fetch(url, { method:"POST", headers:{"content-type":"application/json"}, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`Vision error: ${res.status}`);
  const json = await res.json();
  const text = json?.responses?.[0]?.fullTextAnnotation?.text || "";
  return extractHeuristics(text);
}

async function runTesseract(base64: string): Promise<OCRResult> {
  // Lightweight remote OCR via ocr.space (free tier) possible; here we stick to heuristic fallback:
  // As a placeholder, we decode and only return no raw OCR; in real project, wire tesseract.js or OCR API.
  return { raw_text: "(fallback) OCR unavailable in this environment" };
}

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") return jsonResponse({ error: "POST only" }, 405);
    const base64 = await toBase64FromRequest(req);
    let result: OCRResult;
    try {
      result = await runVision(base64);
    } catch (_e) {
      result = await runTesseract(base64);
    }
    return jsonResponse({ ok: true, result });
  } catch (e) {
    return jsonResponse({ error: (e as Error).message }, 500);
  }
});
