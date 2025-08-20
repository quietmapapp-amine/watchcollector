// /supabase/functions/_shared/image.ts
export async function toBase64FromRequest(req: Request): Promise<string> {
  const ctype = req.headers.get("content-type") || "";
  if (ctype.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    if (body.image_base64) return body.image_base64 as string;
    if (body.imageDataUrl?.startsWith("data:")) return body.imageDataUrl.split(",")[1];
    throw new Error("No image_base64 in JSON body");
  }
  if (ctype.startsWith("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) throw new Error("file field missing");
    const buf = new Uint8Array(await file.arrayBuffer());
    return btoa(String.fromCharCode(...buf));
  }
  // fallback: raw binary
  const buf = new Uint8Array(await req.arrayBuffer());
  return btoa(String.fromCharCode(...buf));
}
