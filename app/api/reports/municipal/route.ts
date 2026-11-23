import { NextRequest, NextResponse } from "next/server";
import { loadSpainMunicipalities, loadSpainSportsVenues } from "@/lib/spain-registry";
import { buildMunicipalReportEnvelope } from "@/src/reports/municipal-report.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const ineCode = request.nextUrl.searchParams.get("ineCode") || "";
  if (!/^\d{5}$/.test(ineCode)) {
    return NextResponse.json({ error: "Provide a valid five-digit INE municipality code as ineCode." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  try {
    const [{ municipalities }, sports] = await Promise.all([
      loadSpainMunicipalities(),
      loadSpainSportsVenues()
    ]);
    const municipality = municipalities.find(item => item.ineCode === ineCode);
    if (!municipality) {
      return NextResponse.json({ error: "Municipality code is not present in the current Illovediza INE registry." }, { status: 404, headers: { "Cache-Control": "no-store" } });
    }
    const report = buildMunicipalReportEnvelope({
      municipality,
      generatedAt: new Date().toISOString(),
      aquaDmrVStatus: "NOT_CONNECTED",
      geometryStatus: municipality.geometryStatus || "NOT_LOADED",
      activeVenueCount: sports.venues.filter(venue => venue.municipalityCode === ineCode && venue.qualification === "QUALIFIED").length
    });
    return NextResponse.json(report, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Municipal report could not be generated from the current registry." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
