"use client";
import { useEffect, useState } from "react";
const SERVICES = ["Instagram Reels Editing","YouTube Video Editing","Shorts Editing","Product Advertisement Videos","Business Promotional Videos","Cinematic Video Editing","Motion Graphics","Graphic Designing"];
const inp = { width: "100%", padding: 12, margin: "6px 0 14px", borderRadius: 10, border: "1px solid #fff3", background: "#ffffff10", color: "#fff", fontSize: 16 };
export default function Order() {
  const [f, setF] = useState({ name: "", email: "", whatsapp: "", service: SERVICES[0], pkg: "Custom", duration: "", requirements: "", link: "", date: "", instructions: "" });
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    setF((p) => ({ ...p, service: SERVICES.includes(q.get("service")) ? q.get("service") : p.service,
      pkg: ["Basic","Standard","Premium"].includes(q.get("pkg")) ? q.get("pkg") : p.pkg,
      instructions: q.get("ref") ? `I want a video similar to: ${q.get("ref")}` : p.instructions }));
  }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function submit() {
    setErr(""); setBusy(true);
    try {
      const r = await fetch("/api/order", { method: "POST", body: JSON.stringify(f) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      location.href = `/status?id=${j.order_id}&auto=1`;
    } catch (e) { setErr(e.message || "Something went wrong"); setBusy(false); }
  }
  return (<><div className="bg" /><section style={{ maxWidth: 560 }}>
    <h2>Order Your <span className="grad">Video</span></h2>
    <label>Name*<input style={inp} value={f.name} onChange={set("name")} /></label>
    <label>Email*<input style={inp} type="email" value={f.email} onChange={set("email")} /></label>
    <label>WhatsApp number*<input style={inp} type="tel" value={f.whatsapp} onChange={set("whatsapp")} /></label>
    <label>Service*<select style={inp} value={f.service} onChange={set("service")}>{SERVICES.map((s) => <option key={s}>{s}</option>)}</select></label>
    <label>Package<select style={inp} value={f.pkg} onChange={set("pkg")}>{["Basic","Standard","Premium","Custom"].map((s) => <option key={s}>{s}</option>)}</select></label>
    <label>Video duration<input style={inp} placeholder="e.g. 30 seconds" value={f.duration} onChange={set("duration")} /></label>
    <label>Editing requirements<textarea style={inp} rows={4} value={f.requirements} onChange={set("requirements")} /></label>
    <label>Reference video link<input style={inp} value={f.link} onChange={set("link")} /></label>
    <label>Preferred delivery date<input style={inp} type="date" value={f.date} onChange={set("date")} /></label>
    <label>Additional instructions<textarea style={inp} rows={3} value={f.instructions} onChange={set("instructions")} /></label>
    {err && <p style={{ color: "#f87171" }}>{err}</p>}
    <button className="btn p" disabled={busy} onClick={submit}>{busy ? "Please wait…" : "Place Order"}</button>
    <p style={{ opacity: .6, fontSize: 13 }}>Custom orders get a quote on WhatsApp. Packages with a set price go to secure payment.</p>
  </section></>);
}
