import { NextResponse } from "next/server";
import { loadSpainSportsVenues } from "@/lib/spain-registry";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const registry = await loadSpainSportsVenues();
    return NextResponse.json({
      ...registry,
      generatedAt: new Date().toISOString(),
      venueCount: registry.venues.length,
      note: registry.venues.length === 0
        ? "No sports venues have yet been imported and qualified. Municipality reporting references remain represented."
        : "Venue records retain source provenance, geotags and qualification status."
    }, { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" } });
  } catch {
    return NextResponse.json({ error: "Sports venue registry unavailable" }, { status: 503 });
  }
}
