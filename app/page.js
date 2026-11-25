"use client";
import { useEffect, useState } from "react";
import { FAQ, ABOUT, TESTIMONIALS } from "../lib/content";

const WA = process.env.NEXT_PUBLIC_WHATSAPP; // digits only, with country code
const CATS = ["All","Instagram Reels","YouTube Shorts","Cinematic Videos","Product Advertisements","Business Promotions","Motion Graphics","Social Media Ads"];
const SERVICES = [
  ["🎬","Instagram Reels Editing","Trendy, scroll-stopping reels."],["▶️","YouTube Video Editing","Long-form edits with pacing and polish."],
  ["📱","Shorts Editing","Vertical clips built to retain."],["🛍️","Product Advertisement Videos","Ads that sell your product."],
  ["🏢","Business Promotional Videos","Clear, professional brand videos."],["🎞️","Cinematic Video Editing","Film-style grading and storytelling."],
  ["✨","Motion Graphics","Animated titles and visuals."],["🎨","Graphic Designing","Thumbnails, posters and branding."],
];
const PACKAGES = [
  ["Basic",["Basic video editing","Clean transitions","Basic text and effects"]],
  ["Standard",["Professional editing","Advanced transitions","Color correction","Motion graphics"]],
  ["Premium",["Cinematic editing","Advanced effects","Professional color grading","Premium animations"]],
];

export default function Home() {
  const [cat, setCat] = useState("All");
  const [videos, setVideos] = useState(null);
  const [prices, setPrices] = useState({});
  useEffect(() => {
    fetch("/api/videos").then((r) => r.json()).then((j) => setVideos(Array.isArray(j) ? j : [])).catch(() => setVideos([]));
    fetch("/api/prices").then((r) => r.json()).then(setPrices).catch(() => {});
  }, []);
  const list = (videos || []).filter((v) => cat === "All" || v.category === cat);
  return (<>
    <div className="bg" />
    <nav><b>AAYU EDITOR</b><div><a href="#work">Work</a><a href="#services">Services</a><a href="#pricing">Pricing</a><a href="#faq">FAQ</a><a href="/contact">Contact</a></div></nav>

    <section style={{ paddingTop: 100 }}>
      <h1>WE TURN YOUR IDEAS INTO <span className="grad">CINEMATIC EXPERIENCES.</span></h1>
      <p style={{ margin: "16px 0", opacity: .8, fontSize: 18 }}>Professional Video Editing That Makes Your Brand Stand Out.</p>
      <a className="btn p" href="#work">Explore My Work</a>
      <a className="btn" href="/order">Order Your Video</a>
    </section>

    <section id="work">
      <h2>Sample <span className="grad">Reels</span></h2>
      <div className="chips">{CATS.map((c) => (
        <button key={c} className={"chip" + (c === cat ? " on" : "")} onClick={() => setCat(c)}>{c}</button>))}</div>
      <div className="grid">
        {videos === null && <p>Loading samples…</p>}
        {videos && list.length === 0 && <p>{videos.length === 0 ? "Sample videos are coming soon." : "No videos in this category yet."}</p>}
        {list.map((v) => (
          <div className="card" key={v.id}>
            <video controls playsInline preload="metadata" poster={v.thumbnail_url || undefined} src={v.video_url} />
            <h3 style={{ marginTop: 10 }}>{v.title}</h3><p>{v.category}</p><p>{v.description}</p>
            <a className="btn p" href={`/order?ref=${encodeURIComponent(v.title)}`}>Order Similar Video</a>
          </div>))}
      </div>
    </section>

    <section id="services">
      <h2>Our <span className="grad">Services</span></h2>
      <div className="grid">{SERVICES.map(([i, t, d]) => (
        <div className="card" key={t}><div style={{ fontSize: 34 }}>{i}</div><h3>{t}</h3><p>{d}</p><p>Pricing depends on the package you choose.</p>
          <a className="btn p" href={`/order?service=${encodeURIComponent(t)}`}>Order Now</a></div>))}</div>
    </section>

    <section id="pricing">
      <h2>Pricing <span className="grad">Packages</span></h2>
      <div className="grid">{PACKAGES.map(([n, f]) => (
        <div className="card" key={n}><h3>{n}</h3>
          <div className="price">{prices[n] > 0 ? `₹${prices[n]}` : "Custom quote"}</div>
          <ul style={{ margin: "10px 0 0 18px", opacity: .8 }}>{f.map((x) => <li key={x}>{x}</li>)}</ul>
          <a className="btn p" href={`/order?pkg=${n}`}>Choose {n}</a></div>))}
        <div className="card"><h3>Custom</h3><div className="price">Your idea</div><p>Need something different? Describe it and get a quote.</p>
          <a className="btn p" href="/order">Request Custom Order</a></div>
      </div>
    </section>

    <section id="about"><h2>About <span className="grad">Us</span></h2><p style={{ opacity: .85, maxWidth: 700 }}>{ABOUT}</p></section>

    {TESTIMONIALS.length > 0 && <section><h2>What Clients <span className="grad">Say</span></h2>
      <div className="grid">{TESTIMONIALS.map((t, i) => <div className="card" key={i}><p>“{t.text}”</p><b>{t.name}</b></div>)}</div></section>}

    <section id="faq"><h2>Frequently Asked <span className="grad">Questions</span></h2>
      {FAQ.map(([q, a]) => <details className="card" key={q} style={{ marginBottom: 10 }}><summary style={{ cursor: "pointer", fontWeight: 600 }}>{q}</summary><p>{a}</p></details>)}
    </section>

    <footer>
      <a href="https://aayush653.github.io/Ayush-ed/">Portfolio</a> · <a href="https://www.instagram.com/wish_master._.76/">Instagram</a> · <a href="/contact">Contact</a><br />
      <a href="/legal/privacy">Privacy Policy</a> · <a href="/legal/terms">Terms</a> · <a href="/legal/refund">Refund &amp; Cancellation</a>
      <p>© AAYU EDITOR</p>
    </footer>
    {WA && <a className="wa" href={`https://wa.me/${WA}?text=${encodeURIComponent("Hi AAYU EDITOR!")}`}>WhatsApp</a>}
  </>);
}
