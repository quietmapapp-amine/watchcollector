// /supabase/functions/send-alerts/index.ts
import { admin } from "../_shared/supabase.ts";
import { jsonResponse } from "../_shared/util.ts";

async function latestSnapshot(model_id: string) {
  const { data, error } = await admin
    .from("price_snapshot")
    .select("median,captured_at")
    .eq("model_id", model_id)
    .order("captured_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function sendPush(playerId: string, title: string, body: string) {
  const key = Deno.env.get("ONESIGNAL_API_KEY");
  const appId = Deno.env.get("ONESIGNAL_APP_ID");
  if (!key || !appId) return;
  await fetch("https://api.onesignal.com/notifications", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      app_id: appId,
      include_player_ids: [playerId],
      headings: { en: title, fr: title },
      contents: { en: body, fr: body }
    })
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "POST only" }, 405);

  // 1) Load alerts
  const { data: alerts, error: e1 } = await admin
    .from("price_alert")
    .select("id,user_id,model_id,direction,threshold_numeric,active")
    .eq("active", true);
  if (e1) return jsonResponse({ error: e1.message }, 500);

  let sent = 0;
  for (const a of alerts ?? []) {
    const snap = await latestSnapshot(a.model_id);
    if (!snap?.median) continue;

    let trigger = false;
    if (a.direction === "above" && snap.median >= a.threshold_numeric) trigger = true;
    if (a.direction === "below" && snap.median <= a.threshold_numeric) trigger = true;

    if (!trigger) continue;

    // fetch player id
    const { data: prof } = await admin.from("profile").select("onesignal_player_id,pseudo").eq("id", a.user_id).maybeSingle();
    if (prof?.onesignal_player_id) {
      const title = "Alerte de prix";
      const body = `Le modèle ${a.model_id} a atteint ${snap.median} (direction ${a.direction}).`;
      await sendPush(prof.onesignal_player_id, title, body);
      sent++;
    }
  }
  return jsonResponse({ ok: true, sent });
});
