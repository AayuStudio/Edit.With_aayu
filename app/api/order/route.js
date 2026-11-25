import crypto from "crypto";
import { db, mail, rzpAuth, getPrices } from "../../../lib/server";
const bad = (m) => Response.json({ error: m }, { status: 400 });
export async function POST(req) {
  try {
    const b = await req.json();
    const s = (v, n = 1000) => String(v || "").trim().slice(0, n);
    for (const k of ["name", "email", "whatsapp", "service"]) if (!s(b[k])) return bad(`Please fill: ${k}`);
    if (!/^\S+@\S+\.\S+$/.test(s(b.email))) return bad("Invalid email");
    const PR = await getPrices();
    const pkg = Object.hasOwn(PR, b.pkg) ? b.pkg : "Custom";
    const rupees = Math.max(0, Math.round(Number(PR[pkg]))) || 0;
    const order_id = "AAYU-" + crypto.randomBytes(4).toString("hex").toUpperCase();
    let rzp = null;
    if (rupees > 0) {
      const r = await fetch("https://api.razorpay.com/v1/orders", { method: "POST",
        headers: { Authorization: rzpAuth(), "Content-Type": "application/json" },
        body: JSON.stringify({ amount: rupees * 100, currency: "INR", receipt: order_id }) });
      const j = await r.json();
      if (!r.ok) throw new Error("Razorpay " + JSON.stringify(j));
      rzp = j.id;
    }
    const row = { order_id, name: s(b.name, 100), email: s(b.email, 200), whatsapp: s(b.whatsapp, 30),
      service: s(b.service, 100), package: pkg, duration: s(b.duration, 50), requirements: s(b.requirements, 3000),
      reference_link: s(b.link, 500), delivery_date: s(b.date, 10) || null, instructions: s(b.instructions, 3000),
      amount: rupees, status: rupees > 0 ? "Payment Pending" : "New Order", razorpay_order_id: rzp };
    await db("orders", { method: "POST", body: JSON.stringify(row) });
    await mail(process.env.OWNER_EMAIL, `New order ${order_id} – ${row.service}`,
      Object.entries(row).map(([k, v]) => `${k}: ${v ?? ""}`).join("\n"));
    return Response.json({ order_id });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Could not place order. Please try again or WhatsApp us." }, { status: 500 });
  }
}
