"use client";
import { useEffect, useRef, useState } from "react";
const loadRzp = () => new Promise((ok, fail) => {
  if (window.Razorpay) return ok();
  const s = document.createElement("script"); s.src = "https://checkout.razorpay.com/v1/checkout.js";
  s.onload = ok; s.onerror = () => fail(new Error("Could not load payment window")); document.body.appendChild(s);
});
export default function Status() {
  const [o, setO] = useState(null); const [msg, setMsg] = useState(""); const [err, setErr] = useState("");
  const auto = useRef(false);
  const idOf = () => new URLSearchParams(location.search).get("id");
  async function load() {
    const r = await fetch(`/api/status?id=${idOf()}`, { cache: "no-store" }); const j = await r.json();
    if (!r.ok) { setErr(j.error || "Error"); return null; } setO(j); return j;
  }
  async function pay(x) {
    try {
      await loadRzp(); setMsg("");
      const rz = new window.Razorpay({ key: x.key, order_id: x.razorpay_order_id, name: "AAYU EDITOR", description: x.service,
        theme: { color: "#7c3aed" },
        handler: async (resp) => {
          setMsg("Verifying payment…");
          const r = await fetch("/api/verify", { method: "POST", body: JSON.stringify(resp) });
          if (r.ok) { setMsg(""); load(); } else setMsg("We could not verify the payment yet. If money was deducted, it will update shortly or WhatsApp us your Order ID.");
        },
        modal: { ondismiss: () => setMsg("Payment not completed. You can retry below.") } });
      rz.on("payment.failed", () => setMsg("Payment failed. You can retry below."));
      rz.open();
    } catch (e) { setMsg(e.message); }
  }
  useEffect(() => { load().then((x) => {
    if (x && x.key && new URLSearchParams(location.search).get("auto") && !auto.current) { auto.current = true; pay(x); } }); }, []);
  const canPay = o && o.key;
  return (<><div className="bg" /><section style={{ maxWidth: 560 }}>
    <h2>Order <span className="grad">Status</span></h2>
    {err && <p style={{ color: "#f87171" }}>{err}</p>}
    {!o && !err && <p>Loading…</p>}
    {o && <div className="card">
      <p>Order ID</p><h3>{o.order_id}</h3><p>{o.service} · {o.package}</p>
      {o.amount > 0 && <p>Amount: ₹{o.amount}</p>}
      <p style={{ fontSize: 18, opacity: 1 }}>Status: <b>{o.status}</b></p>
      {o.status === "Paid" && <p>Payment received. Thank you! We will contact you on WhatsApp.</p>}
      {o.status === "New Order" && <p>Order received. We will contact you on WhatsApp with a quote.</p>}
      {canPay && <button className="btn p" onClick={() => pay(o)}>{o.status === "Payment Failed" ? "Retry Payment" : "Pay Now"}</button>}
      {msg && <p style={{ color: "#fbbf24" }}>{msg}</p>}
      <p>Save this Order ID. Bookmark this page to check progress.</p>
    </div>}
    <a className="btn" href="/">Back to home</a>
  </section></>);
}
