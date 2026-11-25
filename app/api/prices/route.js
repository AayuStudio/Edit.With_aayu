import { getPrices } from "../../../lib/server";
export const dynamic = "force-dynamic";
export async function GET() { return Response.json(await getPrices()); }
