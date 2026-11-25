import { db } from "../../../lib/server";
export const dynamic = "force-dynamic";
export async function GET(req) {
  try {
    const id = new URL(req.url).searchParams.get("id") || "";
    if (!/^AAYU-[0-9A-F]{8}$/.test(id)) return Response.json({ error: "Invalid ID" }, { status: 400 });
    const [o] = await db(`orders?order_id=eq.${id}&select=order_id,status,amount,service,package,razorpay_order_id`);
    if (!o) return Response.json({ error: "Order not found" }, { status: 404 });
    const canPay = o.razorpay_order_id && ["Payment Pending", "Payment Failed"].includes(o.status);
    return Response.json({ ...o, razorpay_order_id: canPay ? o.razorpay_order_id : null,
      key: canPay ? process.env.RAZORPAY_KEY_ID : null });
  } catch (e) { console.error(e); return Response.json({ error: "Server error" }, { status: 500 }); }
}
