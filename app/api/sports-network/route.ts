import { NextResponse } from "next/server";
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
