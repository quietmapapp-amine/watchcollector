// /supabase/functions/generate-pdf/index.ts
import { admin } from "../_shared/supabase.ts";
import { jsonResponse } from "../_shared/util.ts";
import { PDFDocument, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";
import { encode as hex } from "https://deno.land/std@0.201.0/encoding/hex.ts";

async function sha256Hex(data: Uint8Array) {
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2,"0")).join("");
}

Deno.serve( async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "POST only" }, 405);
  const { user_id } = await req.json().catch(()=> ({}));
  if (!user_id) return jsonResponse({ error: "user_id required" }, 400);

  // Load watches
  const { data: watches, error } = await admin
    .from("watch_instance")
    .select("id,notes,serial_hash,purchase_price,purchase_date,visibility,model:model_id(name,reference),brand:model_id!inner(brand_id)")
    .eq("user_id", user_id);
  if (error) return jsonResponse({ error: error.message }, 500);

  // Build PDF
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const page = pdf.addPage([595, 842]); // A4
  const draw = (text:string, x:number, y:number, size=11) => page.drawText(text, { x, y, size, font });

  let y = 810;
  draw("Watch Collector — Inventaire Assurance", 40, y, 16); y -= 28;
  draw(`Utilisateur: ${user_id}`, 40, y); y -= 16;
  draw(`Créé le: ${new Date().toISOString()}`, 40, y); y -= 24;

  for (const w of (watches ?? [])) {
    if (y < 80) { pdf.addPage([595,842]); y = 810; }
    draw(`• ${w.model?.name ?? 'Modèle'} (${(w as any).model?.reference ?? '-'}) — Prix achat: ${w.purchase_price ?? '-'} — Date: ${w.purchase_date ?? '-'}`, 40, y); y -= 14;
    draw(`  Serial (hash): ${w.serial_hash ?? '-'}`, 40, y); y -= 14;
    draw(`  Visibilité: ${w.visibility}`, 40, y); y -= 18;
  }

  const bytes = await pdf.save();
  const checksum = await sha256Hex(bytes);

  // Store to Supabase Storage (optional) or return directly; we log hash regardless
  // For simplicity we return base64 data url (caller can upload). Also log.
  const { error: e2 } = await admin.from("export_logs").insert({
    user_id, export_type: "pdf", file_url: "data:application/pdf;base64,inline", checksum_sha256: checksum
  });
  if (e2) return jsonResponse({ error: e2.message }, 500);

  const base64 = btoa(String.fromCharCode(...bytes));
  return new Response(base64, { headers: { "content-type":"application/pdf", "content-transfer-encoding":"base64" } });
});
