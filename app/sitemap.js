export default function sitemap() {
  const base = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || "localhost:3000"}`;
  return ["", "/order", "/contact", "/legal/privacy", "/legal/terms", "/legal/refund"].map((p) => ({ url: base + p }));
}
