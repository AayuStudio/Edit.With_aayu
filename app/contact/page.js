"use client";
import { useState } from "react";
const inp = { width: "100%", padding: 12, margin: "6px 0 14px", borderRadius: 10, border: "1px solid #fff3", background: "#ffffff10", color: "#fff", fontSize: 16 };
export default function Contact() {
  const [f, setF] = useState({ name: "", email: "", message: "", website: "" });
  const [state, setState] = useState(""); const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function send() {
    setBusy(true); setState("");
    try {
      const r = await fetch("/api/contact", { method: "POST", body: JSON.stringify(f) }); const j = await r.json();
      setState(r.ok ? "ok" : j.error || "Could not send"); if (r.ok) setF({ name: "", email: "", message: "", website: "" });
    } catch { setState("Could not send. Please try again."); }
    setBusy(false);
  }
  return (<><div className="bg" /><section style={{ maxWidth: 560 }}>
    <h2>Contact <span className="grad">Us</span></h2>
    <label>Name<input style={inp} value={f.name} onChange={set("name")} /></label>
    <label>Email<input style={inp} type="email" value={f.email} onChange={set("email")} /></label>
    <label>Message<textarea style={inp} rows={5} value={f.message} onChange={set("message")} /></label>
    <input style={{ display: "none" }} tabIndex={-1} autoComplete="off" value={f.website} onChange={set("website")} />
    {state === "ok" ? <p style={{ color: "#4ade80" }}>Thank you! We received your message.</p> : state && <p style={{ color: "#f87171" }}>{state}</p>}
    <button className="btn p" disabled={busy} onClick={send}>{busy ? "Sending…" : "Send Message"}</button>
    <a className="btn" href="/">Back to home</a>
  </section></>);
}
