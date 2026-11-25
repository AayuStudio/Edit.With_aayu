import { db, mail } from "../../../lib/server";
export async function POST(req) {
  try {
    const b = await req.json();
    if (b.website) return Response.json({ ok: true }); // spam trap
    const s = (v, n) => String(v || "").trim().slice(0, n);
    const row = { name: s(b.name, 100), email: s(b.email, 200), message: s(b.message, 3000) };
    if (!row.name || !row.message || !/^\S+@\S+\.\S+$/.test(row.email)) return Response.json({ error: "Please fill name, a valid email and message." }, { status: 400 });
    await db("inquiries", { method: "POST", body: JSON.stringify(row) });
    await mail(process.env.OWNER_EMAIL, `New inquiry from ${row.name}`, `${row.name} <${row.email}>\n\n${row.message}`);
    return Response.json({ ok: true });
  } catch (e) { console.error(e); return Response.json({ error: "Could not send. Please try again." }, { status: 500 }); }
}
