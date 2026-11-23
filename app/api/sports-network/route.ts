import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { loadSpainMunicipalities, loadSpainSportsVenues } from "@/lib/spain-registry";
import { buildMunicipalSportsRegistry } from "@/src/sports/qualification.mjs";
import reportableFactors from "@/data/spain/reportable-factors.json";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [{ municipalities }, sportsRegistry] = await Promise.all([
      loadSpainMunicipalities(),
      loadSpainSportsVenues()
    ]);
    const [discoveryBatch, officialLeadRegistry] = await Promise.all([
      readFile(join(process.cwd(), "data/spain/sports-venues.discovery-batch-2026-11-23.json"), "utf8").then(JSON.parse),
      readFile(join(process.cwd(), "data/spain/venue-discovery/official-municipal-leads-2026-11-23.json"), "utf8").then(JSON.parse)
    ]);
    const registry = buildMunicipalSportsRegistry(municipalities, sportsRegistry.venues as never[]);
    const venues = registry.municipalities.flatMap(municipality => municipality.venues);
    return NextResponse.json({
      schemaVersion: "1.0.0",
      projectId: "ILL-FUERZA-ES",
      generatedAt: new Date().toISOString(),
      sourcePolicy: sportsRegistry.sourcePolicy,
      venueCount: sportsRegistry.venues.length,
      venues,
      candidateVenues: discoveryBatch.candidates,
      officialVenueLeads: officialLeadRegistry.leads,
      officialLeadSummary: officialLeadRegistry.summary,
      candidateBatch: { batchId: discoveryBatch.batchId, retrievedAt: discoveryBatch.retrievedAt, summary: discoveryBatch.summary },
      summary: registry.summary,
      qualificationErrors: registry.errors,
      reportableFactors,
      note: venues.length === 0
        ? "No venues have been promoted to the active qualified registry. OSM candidates and official source-backed leads are exposed separately and remain unqualified until IGN spatial matching, venue significance and authorization are complete."
        : "Venue records retain source provenance, geotags and explicit qualification states."
    }, { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } });
  } catch {
    return NextResponse.json({ error: "Sports venue registry unavailable" }, { status: 503 });
  }
}
