import { db, hmac, safeEq, markPaid } from "../../../lib/server";
export async function POST(req) {
  const raw = await req.text();
  if (!safeEq(hmac(process.env.RAZORPAY_WEBHOOK_SECRET || "\0", raw), req.headers.get("x-razorpay-signature") || ""))
    return new Response("bad signature", { status: 400 });
  try {
    const ev = JSON.parse(raw);
    const pay = ev?.payload?.payment?.entity;
    if (pay?.order_id) {
      if (ev.event === "payment.captured" || ev.event === "order.paid") await markPaid(pay.order_id, pay.id);
      else if (ev.event === "payment.failed") {
        const f = encodeURIComponent('in.("Payment Pending")');
        await db(`orders?razorpay_order_id=eq.${encodeURIComponent(pay.order_id)}&status=${f}`,
          { method: "PATCH", body: JSON.stringify({ status: "Payment Failed" }) });
      }
    }
    return new Response("ok");
  } catch (e) { console.error(e); return new Response("error", { status: 500 }); }
}
