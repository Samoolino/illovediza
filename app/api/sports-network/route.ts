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
    const discoveryBatch = JSON.parse(await readFile(join(process.cwd(), "data/spain/sports-venues.discovery-batch-2026-11-23.json"), "utf8"));
    const registry = buildMunicipalSportsRegistry(municipalities, sportsRegistry.venues as never[]);
    const venues = registry.municipalities.flatMap(municipality => municipality.venues);
    return NextResponse.json({
      schemaVersion: "1.0.0",
      projectId: "ILL-FUERZA-ES",
      generatedAt: new Date().toISOString(),
      sourcePolicy: sportsRegistry.sourcePolicy,
      venueCount: sportsRegistry.venues.length,
      venues,
      summary: registry.summary,
      qualificationErrors: registry.errors,
      reportableFactors,
      note: venues.length === 0
        ? "No sports venues have yet been imported. All municipal reporting references remain represented."
        : "Venue records retain source provenance, geotags and explicit qualification states."
    }, { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } });
  } catch {
    return NextResponse.json({ error: "Sports venue registry unavailable" }, { status: 503 });
  }
}
