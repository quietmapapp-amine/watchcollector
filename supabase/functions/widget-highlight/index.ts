import { admin } from "../_shared/supabase.ts";
import { jsonResponse } from "../_shared/util.ts";

type Input = { user_id: string; date?: string };

Deno.serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "POST only" }, 405);
  const { user_id, date }: Input = await req.json();
  if (!user_id) return jsonResponse({ error: "user_id required" }, 400);
  const today = (date ?? new Date().toISOString().slice(0,10));

  // If already exists → return
  const { data: existing } = await admin.from("daily_highlight").select("id,watch_id").eq("user_id", user_id).eq("date", today).maybeSingle();
  if (existing) return jsonResponse({ ok: true, id: existing.id, watch_id: existing.watch_id });

  // Pick a random watch of user
  const { data: watches } = await admin.from("watch_instance").select("id").eq("user_id", user_id).limit(50);
  if (!watches?.length) return jsonResponse({ ok: true, message: "no watches" });

  const watch = watches[Math.floor(Math.random()*watches.length)];
  const { data, error } = await admin.from("daily_highlight").insert({ user_id, watch_id: watch.id, date: today }).select().maybeSingle();
  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse({ ok: true, id: data?.id, watch_id: data?.watch_id });
});
