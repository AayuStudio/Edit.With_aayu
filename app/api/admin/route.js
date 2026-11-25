import { db, isAdmin, STATUSES, getPrices, rzpAuth } from "../../../lib/server";
export const dynamic = "force-dynamic";
const J = (o, s = 200) => Response.json(o, { status: s });
const bad = () => J({ error: "Bad input" }, 400);
const https = (u) => /^https:\/\/\S+$/.test(u || "");
const T = (req) => new URL(req.url).searchParams.get("t") || "orders";
const UUID = /^[0-9a-f-]{36}$/;
const CATS = ["Instagram Reels","YouTube Shorts","Cinematic Videos","Product Advertisements","Business Promotions","Motion Graphics","Social Media Ads"];
async function guard(req, fn) {
  if (!isAdmin(req)) return J({ error: "Unauthorized" }, 401);
  try { return await fn(); } catch (e) { console.error(e); return J({ error: "Server error" }, 500); }
}
function vid(b) {
  const v = { title: String(b.title || "").trim().slice(0, 120), category: b.category,
    description: String(b.description || "").trim().slice(0, 500), video_url: b.video_url, thumbnail_url: b.thumbnail_url || null };
  if (!v.title || !CATS.includes(v.category) || !https(v.video_url) || (v.thumbnail_url && !https(v.thumbnail_url))) return null;
  return v;
}
export const GET = (req) => guard(req, async () => {
  const t = T(req);
  if (t === "orders") return J(await db("orders?select=*&order=created_at.desc&limit=200"));
  if (t === "inquiries") return J(await db("inquiries?select=*&order=created_at.desc&limit=200"));
  if (t === "videos") return J(await db("videos?select=*&order=created_at.desc"));
  if (t === "prices") return J(await getPrices());
  if (t === "health") {
    const E = process.env, out = [];
    for (const k of ["SUPABASE_URL","SUPABASE_SERVICE_KEY","RAZORPAY_KEY_ID","RAZORPAY_KEY_SECRET","RAZORPAY_WEBHOOK_SECRET","RESEND_API_KEY","OWNER_EMAIL","ADMIN_PASSWORD","NEXT_PUBLIC_WHATSAPP"])
      out.push({ name: `Setting ${k}`, ok: !!E[k] });
    for (const tb of ["orders","videos","inquiries","settings"]) {
      let ok = false; try { await db(`${tb}?select=*&limit=1`); ok = true; } catch {}
      out.push({ name: `Database table: ${tb}`, ok });
    }
    let rz = false;
    try { rz = (await fetch("https://api.razorpay.com/v1/orders?count=1", { headers: { Authorization: rzpAuth() }, cache: "no-store" })).ok; } catch {}
    out.push({ name: "Razorpay keys accepted", ok: rz });
    out.push({ name: `Razorpay mode: ${(E.RAZORPAY_KEY_ID || "").startsWith("rzp_live_") ? "LIVE (real money)" : "TEST"}`, ok: true });
    return J(out);
  }
  return bad();
});
export const POST = (req) => guard(req, async () => {
  const v = vid(await req.json()); if (!v) return bad();
  return J((await db("videos", { method: "POST", body: JSON.stringify(v) }))[0]);
});
export const PUT = (req) => guard(req, async () => {
  const t = T(req), b = await req.json();
  if (t === "videos") {
    const v = vid(b); if (!v || !UUID.test(b.id || "")) return bad();
    await db(`videos?id=eq.${b.id}`, { method: "PATCH", body: JSON.stringify(v) }); return J({ ok: true });
  }
  if (t === "prices") {
    const p = {};
    for (const k of ["Basic", "Standard", "Premium"]) { const n = Math.round(Number(b[k])); if (!(n >= 0 && n <= 1000000)) return bad(); p[k] = n; }
    await db("settings?on_conflict=key", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify({ key: "prices", value: p }) });
    return J({ ok: true });
  }
  return bad();
});
export const PATCH = (req) => guard(req, async () => {
  const { order_id, status } = await req.json();
  if (!STATUSES.includes(status) || !/^AAYU-[0-9A-F]{8}$/.test(order_id || "")) return bad();
  await db(`orders?order_id=eq.${order_id}`, { method: "PATCH", body: JSON.stringify({ status }) }); return J({ ok: true });
});
export const DELETE = (req) => guard(req, async () => {
  const id = new URL(req.url).searchParams.get("id") || ""; if (!UUID.test(id)) return bad();
  await db(`videos?id=eq.${id}`, { method: "DELETE" }); return J({ ok: true });
});
