// /app/src/services/functions.ts

export async function callOCRInvoice(params: { image_base64?: string; imageDataUrl?: string; file?: Blob }) {
  const headers: Record<string,string> = {};
  let body: BodyInit;
  if (params.file) {
    const fd = new FormData();
    fd.append("file", params.file);
    body = fd;
  } else {
    headers["content-type"] = "application/json";
    body = JSON.stringify({ image_base64: params.image_base64, imageDataUrl: params.imageDataUrl });
  }
  
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
  
  const url = `${supabaseUrl}/functions/v1/ocr-invoice`;
  const res = await fetch(url, { 
    method: "POST", 
    headers: { 
      ...headers,
      "Authorization": `Bearer ${supabaseKey}`
    }, 
    body 
  });
  if (!res.ok) throw new Error(`OCR failed: ${res.status}`);
  return res.json();
}

export async function callPhotoMatch(params: { image_base64?: string; imageDataUrl?: string; file?: Blob }) {
  const headers: Record<string,string> = {};
  let body: BodyInit;
  if (params.file) {
    const fd = new FormData();
    fd.append("file", params.file);
    body = fd;
  } else {
    headers["content-type"] = "application/json";
    body = JSON.stringify({ image_base64: params.image_base64, imageDataUrl: params.imageDataUrl });
  }
  
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
  
  const url = `${supabaseUrl}/functions/v1/ai-photo-match`;
  const res = await fetch(url, { 
    method: "POST", 
    headers: { 
      ...headers,
      "Authorization": `Bearer ${supabaseKey}`
    }, 
    body 
  });
  if (!res.ok) throw new Error(`PhotoMatch failed: ${res.status}`);
  return res.json();
}
