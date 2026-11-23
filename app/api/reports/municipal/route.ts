import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { loadSpainMunicipalities, loadSpainSportsVenues } from "@/lib/spain-registry";
import { buildMunicipalReportEnvelope } from "@/src/reports/municipal-report.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function hasQualifiedVenueStatus(venue: Record<string, unknown>): boolean {
  const raw = venue.qualificationStatuses;
  const statuses: unknown[] = Array.isArray(raw) ? raw : [venue.qualificationStatus];
  return statuses.some(status => String(status || "").startsWith("QUALIFIED_"));
}

export async function GET(request: NextRequest) {
  const ineCode = request.nextUrl.searchParams.get("ineCode") || "";
  if (!/^\d{5}$/.test(ineCode)) {
    return NextResponse.json({ error: "Provide a valid five-digit INE municipality code as ineCode." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  try {
    const [{ municipalities }, sports, discoveryBatch, officialLeadRegistry] = await Promise.all([
      loadSpainMunicipalities(),
      loadSpainSportsVenues(),
      readFile(join(process.cwd(), 'data/spain/sports-venues.discovery-batch-2026-11-23.json'), 'utf8').then(JSON.parse),
      readFile(join(process.cwd(), 'data/spain/venue-discovery/official-municipal-leads-2026-11-23.json'), 'utf8').then(JSON.parse)
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
      activeVenueCount: sports.venues.filter((venue: Record<string, unknown>) => venue.municipalityCode === ineCode && hasQualifiedVenueStatus(venue)).length,
      osmDiscoveryCandidateCount: discoveryBatch.candidates.filter((venue: Record<string, unknown>) => venue.municipalityCode === ineCode).length,
      officialVenueLeadCount: officialLeadRegistry.leads.filter((lead: Record<string, unknown>) =>
        String(lead.municipalityName || '').toLocaleLowerCase('es') === municipality.name.toLocaleLowerCase('es')
      ).length,
      spatialCrosswalkStatus: 'NOT_VERIFIED_IGN_GEOMETRY_NOT_INGESTED'
    });
    return NextResponse.json(report, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Municipal report could not be generated from the current registry." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
