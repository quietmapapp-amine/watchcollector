export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

export function median(values: number[]) {
  const arr = [...values].sort((a,b)=>a-b);
  const n = arr.length;
  if (!n) return null;
  const mid = Math.floor(n/2);
  return n % 2 ? arr[mid] : (arr[mid-1]+arr[mid])/2;
}

export function iqr(values: number[]) {
  const arr = [...values].sort((a,b)=>a-b);
  if (arr.length < 4) return { p25: null, p75: null };
  const q = (p:number)=> {
    const pos = (arr.length-1)*p, base = Math.floor(pos), rest = pos-base;
    return arr[base] + (arr[base+1]-arr[base]) * rest;
  };
  return { p25: q(0.25), p75: q(0.75) };
}

export function filterOutliers(vals: number[]) {
  if (vals.length < 4) return vals;
  const { p25, p75 } = iqr(vals);
  if (p25==null || p75==null) return vals;
  const iqrValue = (p75 as number) - (p25 as number);
  const low = (p25 as number) - 1.5 * iqrValue;
  const high = (p75 as number) + 1.5 * iqrValue;
  return vals.filter(v => v >= low && v <= high);
}
