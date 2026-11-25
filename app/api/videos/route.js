import { db } from "../../../lib/server";
export const dynamic = "force-dynamic";
export async function GET() {
  try { return Response.json(await db("videos?select=*&order=created_at.desc")); }
  catch (e) { console.error(e); return Response.json([], { status: 200 }); }
}
