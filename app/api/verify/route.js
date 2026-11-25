import { hmac, safeEq, markPaid } from "../../../lib/server";
export async function POST(req) {
  try {
    const { razorpay_order_id: o, razorpay_payment_id: p, razorpay_signature: sig } = await req.json();
    if (!o || !p || !sig) return Response.json({ ok: false }, { status: 400 });
    if (!safeEq(hmac(process.env.RAZORPAY_KEY_SECRET, `${o}|${p}`), sig)) return Response.json({ ok: false }, { status: 400 });
    await markPaid(o, p);
    return Response.json({ ok: true });
  } catch (e) { console.error(e); return Response.json({ ok: false }, { status: 500 }); }
}
