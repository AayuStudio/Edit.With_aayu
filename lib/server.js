import crypto from "crypto";
import { PRICES } from "./prices";
const E = process.env;
export async function db(path, opts = {}) {
  const r = await fetch(`${E.SUPABASE_URL}/rest/v1/${path}`, {
    ...opts, cache: "no-store",
    headers: { apikey: E.SUPABASE_SERVICE_KEY, Authorization: `Bearer ${E.SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json", Prefer: "return=representation", ...(opts.headers || {}) },
  });
  if (!r.ok) throw new Error("DB " + r.status + " " + (await r.text()));
  return r.json();
}
export async function mail(to, subject, text) {
  if (!E.RESEND_API_KEY || !to) return;
  try {
    const r = await fetch("https://api.resend.com/emails", { method: "POST",
      headers: { Authorization: `Bearer ${E.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: E.MAIL_FROM || "AAYU EDITOR <onboarding@resend.dev>", to: [to], subject, text }) });
    if (!r.ok) console.error("mail failed", to, await r.text());
  } catch (e) { console.error("mail error", e); }
}
export const rzpAuth = () => "Basic " + Buffer.from(`${E.RAZORPAY_KEY_ID}:${E.RAZORPAY_KEY_SECRET}`).toString("base64");
export const hmac = (secret, data) => crypto.createHmac("sha256", secret).update(data).digest("hex");
export function safeEq(a, b) {
  const x = Buffer.from(a || ""), y = Buffer.from(b || "");
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
export const isAdmin = (req) => !!E.ADMIN_PASSWORD && safeEq(req.headers.get("x-admin") || "", E.ADMIN_PASSWORD);
export const STATUSES = ["New Order", "Payment Pending", "Payment Failed", "Paid", "In Progress", "Completed"];

// Marks an order paid exactly once (verify route and webhook can both call it safely).
export async function markPaid(rzpOrderId, paymentId) {
  const open = encodeURIComponent('in.("Payment Pending","Payment Failed","New Order")');
  const rows = await db(`orders?razorpay_order_id=eq.${encodeURIComponent(rzpOrderId)}&status=${open}`,
    { method: "PATCH", body: JSON.stringify({ status: "Paid", payment_id: paymentId }) });
  if (!rows.length) return false;
  const o = rows[0];
  await mail(E.OWNER_EMAIL, `PAID ₹${o.amount} – ${o.order_id}`,
    `Payment received.\nOrder: ${o.order_id}\nPayment ID: ${paymentId}\nAmount: ₹${o.amount}\nCustomer: ${o.name}\nWhatsApp: ${o.whatsapp}\nService: ${o.service} (${o.package})`);
  await mail(o.email, `Order confirmed – ${o.order_id}`,
    `Hi ${o.name},\n\nThank you! We received your payment of ₹${o.amount}.\nOrder ID: ${o.order_id}\nService: ${o.service}\n\nWe will contact you on WhatsApp shortly.\n\n– AAYU EDITOR`);
  return true;
}

// Prices: admin-saved values win; lib/prices.js is the fallback.
export async function getPrices() {
  try { const [r] = await db("settings?key=eq.prices&select=value"); if (r) return { ...PRICES, ...r.value }; }
  catch (e) { console.error("prices", e); }
  return PRICES;
}
