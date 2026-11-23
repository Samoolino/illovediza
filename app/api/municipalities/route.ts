import { NextRequest, NextResponse } from "next/server";
import { loadSpainMunicipalities } from "@/lib/spain-registry";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { index, municipalities } = await loadSpainMunicipalities();
    const params = request.nextUrl.searchParams;
    const q = (params.get("q") || "").trim().toLocaleLowerCase("es");
    const community = params.get("community");
    const offset = Math.max(0, Number(params.get("offset") || 0));
    const limit = Math.min(250, Math.max(1, Number(params.get("limit") || 100)));

    const filtered = municipalities.filter((municipality) => {
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
      representedMunicipalities: municipalities.length,
      matchedMunicipalities: filtered.length,
      offset,
      limit,
      items: filtered.slice(offset, offset + limit)
    }, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" }
    });
  } catch (error) {
    return NextResponse.json({
      error: "Spain municipality registry unavailable",
      detail: error instanceof Error ? error.message : "unknown_registry_error"
    }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
