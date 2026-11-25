"use client";
import { useState } from "react";
const ST = ["New Order","Payment Pending","Payment Failed","Paid","In Progress","Completed"];
const CATS = ["Instagram Reels","YouTube Shorts","Cinematic Videos","Product Advertisements","Business Promotions","Motion Graphics","Social Media Ads"];
const inp = { width: "100%", padding: 10, margin: "4px 0 10px", borderRadius: 8, fontSize: 16 };
const EMPTY = { id: "", title: "", category: CATS[0], description: "", video_url: "", thumbnail_url: "" };
export default function Admin() {
  const [pw, setPw] = useState(""); const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState("orders"); const [data, setData] = useState([]); const [prices, setPrices] = useState({});
  const [vf, setVf] = useState(EMPTY); const [err, setErr] = useState(""); const [ok, setOk] = useState("");
  const H = { "x-admin": pw };
  async function load(t = tab, p = pw) {
    setErr(""); setOk("");
    const r = await fetch(`/api/admin?t=${t}`, { headers: { "x-admin": p }, cache: "no-store" }); const j = await r.json();
    if (!r.ok) { setErr(j.error || "Error"); if (r.status === 401) setAuthed(false); return; }
    setAuthed(true); setTab(t); t === "prices" ? setPrices(j) : setData(j);
  }
  async function call(method, t, body, qs = "") {
    setErr(""); setOk("");
    const r = await fetch(`/api/admin?t=${t}${qs}`, { method, headers: H, body: body ? JSON.stringify(body) : undefined }); const j = await r.json();
    if (!r.ok) { setErr(j.error || "Failed"); return false; } setOk("Saved"); return true;
  }
  if (!authed) return (<section style={{ maxWidth: 400 }}><h2>Admin</h2>
    <input type="password" placeholder="Admin password" value={pw} onChange={(e) => setPw(e.target.value)} style={inp} />
    {err && <p style={{ color: "#f87171" }}>{err}</p>}<button className="btn p" onClick={() => load("orders")}>Login</button></section>);
  return (<section>
    <div className="chips">{[["orders","Orders"],["videos","Videos"],["prices","Prices"],["inquiries","Inquiries"],["health","Setup check"]].map(([k, n]) =>
      <button key={k} className={"chip" + (tab === k ? " on" : "")} onClick={() => load(k)}>{n}</button>)}
      <button className="chip" onClick={() => load()}>Refresh</button></div>
    {err && <p style={{ color: "#f87171" }}>{err}</p>}{ok && <p style={{ color: "#4ade80" }}>{ok}</p>}

    {tab === "orders" && <div className="grid">{data.map((o) => (<div className="card" key={o.order_id}>
      <h3>{o.order_id}</h3><p>{new Date(o.created_at).toLocaleString()}</p><p><b>{o.name}</b> · {o.email}</p>
      <p>{o.service} ({o.package}) {o.amount > 0 ? `· ₹${o.amount}` : "· quote"}</p>
      <p>Duration: {o.duration || "-"} · Due: {o.delivery_date || "-"}</p><p>{o.requirements}</p><p>{o.instructions}</p>
      {o.reference_link && <p><a href={o.reference_link} style={{ textDecoration: "underline" }}>Reference</a></p>}
      {o.payment_id && <p>Payment ID: {o.payment_id}</p>}
      <select value={o.status} style={inp} onChange={async (e) => { if (await call("PATCH", "orders", { order_id: o.order_id, status: e.target.value })) load("orders"); }}>
        {ST.map((s) => <option key={s}>{s}</option>)}</select>
      <a className="btn p" href={`https://wa.me/${o.whatsapp.replace(/\D/g, "")}`}>WhatsApp customer</a></div>))}
      {data.length === 0 && <p>No orders yet.</p>}</div>}

    {tab === "videos" && <>
      <div className="card" style={{ marginBottom: 18 }}><h3>{vf.id ? "Edit video" : "Add video"}</h3>
        <input style={inp} placeholder="Title" value={vf.title} onChange={(e) => setVf({ ...vf, title: e.target.value })} />
        <select style={inp} value={vf.category} onChange={(e) => setVf({ ...vf, category: e.target.value })}>{CATS.map((c) => <option key={c}>{c}</option>)}</select>
        <textarea style={inp} rows={2} placeholder="Description" value={vf.description} onChange={(e) => setVf({ ...vf, description: e.target.value })} />
        <input style={inp} placeholder="Video link (https://…)" value={vf.video_url} onChange={(e) => setVf({ ...vf, video_url: e.target.value })} />
        <input style={inp} placeholder="Thumbnail image link (https://…) optional" value={vf.thumbnail_url || ""} onChange={(e) => setVf({ ...vf, thumbnail_url: e.target.value })} />
        <button className="btn p" onClick={async () => { if (await call(vf.id ? "PUT" : "POST", "videos", vf)) { setVf(EMPTY); load("videos"); } }}>{vf.id ? "Save changes" : "Add video"}</button>
        {vf.id && <button className="btn" onClick={() => setVf(EMPTY)}>Cancel</button>}</div>
      <div className="grid">{data.map((v) => (<div className="card" key={v.id}><h3>{v.title}</h3><p>{v.category}</p><p>{v.description}</p>
        <button className="btn" onClick={() => { setVf({ ...EMPTY, ...v, thumbnail_url: v.thumbnail_url || "" }); scrollTo(0, 0); }}>Edit</button>
        <button className="btn" onClick={async () => { if (confirm("Delete this video?") && await call("DELETE", "videos", null, `&id=${v.id}`)) load("videos"); }}>Delete</button></div>))}</div></>}

    {tab === "prices" && <div className="card" style={{ maxWidth: 420 }}><h3>Package prices (₹)</h3><p>0 means custom quote, no online payment.</p>
      {["Basic", "Standard", "Premium"].map((k) => <label key={k}>{k}<input style={inp} type="number" inputMode="numeric" min="0" value={prices[k] ?? 0} onChange={(e) => setPrices({ ...prices, [k]: e.target.value })} /></label>)}
      <button className="btn p" onClick={() => call("PUT", "prices", prices)}>Save prices</button></div>}

    {tab === "health" && <div className="card" style={{ maxWidth: 520 }}><h3>Setup check</h3>
      {data.map((h) => <p key={h.name} style={{ opacity: 1 }}>{h.ok ? "✅" : "❌"} {h.name}</p>)}
      <p>❌ on a Setting means add it in Vercel and Redeploy. ❌ on a table means run the SQL in Supabase.</p></div>}

    {tab === "inquiries" && <div className="grid">{data.map((q) => (<div className="card" key={q.id}><h3>{q.name}</h3><p>{q.email}</p>
      <p>{new Date(q.created_at).toLocaleString()}</p><p style={{ opacity: 1 }}>{q.message}</p></div>))}{data.length === 0 && <p>No inquiries yet.</p>}</div>}
  </section>);
}
