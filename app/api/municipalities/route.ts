import { NextRequest, NextResponse } from "next/server";
import { loadSpainMunicipalities, loadSpainSportsVenues } from "@/lib/spain-registry";
import { buildMunicipalSportsRegistry } from "@/src/sports/qualification.mjs";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const [{ index, municipalities }, sportsRegistry] = await Promise.all([
      loadSpainMunicipalities(),
      loadSpainSportsVenues()
    ]);
    const registry = buildMunicipalSportsRegistry(municipalities, sportsRegistry.venues as never[]);
    const params = request.nextUrl.searchParams;
    const q = (params.get("q") || "").trim().toLocaleLowerCase("es");
    const community = params.get("community");
    const offsetValue = Number(params.get("offset") || 0);
    const limitValue = Number(params.get("limit") || 100);
    const offset = Number.isFinite(offsetValue) ? Math.max(0, offsetValue) : 0;
    const limit = Number.isFinite(limitValue) ? Math.min(10000, Math.max(1, limitValue)) : 100;

    const filtered = registry.municipalities.filter((municipality) => {
      const matchesQuery = !q || [
        municipality.ineCode,
        municipality.name,
        municipality.provinceName,
        municipality.autonomousCommunityName
      ].some((value) => value.toLocaleLowerCase("es").includes(q));
      const matchesCommunity = !community || municipality.autonomousCommunityCode === community;
      return matchesQuery && matchesCommunity;
    });

    return NextResponse.json({
      schemaVersion: "1.0.0",
      projectId: "ILL-FUERZA-ES",
      generatedAt: new Date().toISOString(),
      source: index.source,
      referenceCounts: index.referenceCounts,
      representedMunicipalities: registry.municipalities.length,
      matchedMunicipalities: filtered.length,
      venueQualificationSummary: registry.summary,
      qualificationErrors: registry.errors,
      offset,
      limit,
      items: filtered.slice(offset, offset + limit)
    }, {
      headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" }
    });
  } catch (error) {
    return NextResponse.json({
      error: "Spain municipality and sports registry unavailable",
      detail: error instanceof Error ? error.message : "unknown_registry_error"
    }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
