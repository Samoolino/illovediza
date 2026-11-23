import Link from "next/link";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { loadSpainMunicipalities, loadSpainSportsVenues } from "@/lib/spain-registry";
import { buildMunicipalReportEnvelope } from "@/src/reports/municipal-report.mjs";

type Props = { searchParams: Promise<{ ineCode?: string }> };

function hasQualifiedVenueStatus(venue: Record<string, unknown>): boolean {
  const raw = venue.qualificationStatuses;
  const statuses: unknown[] = Array.isArray(raw) ? raw : [venue.qualificationStatus];
  return statuses.some(status => String(status || "").startsWith("QUALIFIED_"));
}

export default async function MunicipalReportPage({ searchParams }: Props) {
  const { ineCode = "" } = await searchParams;
  if (!/^\d{5}$/.test(ineCode)) {
    return <main className="shell section"><h1>Municipal report</h1><p>Enter a valid five-digit INE municipality code.</p><Link href="/reports">Return to reporting centre ↗</Link></main>;
  }

  const [{ municipalities }, sports, discoveryBatch, officialLeadRegistry] = await Promise.all([
    loadSpainMunicipalities(),
    loadSpainSportsVenues(),
    readFile(join(process.cwd(), 'data/spain/sports-venues.discovery-batch-2026-11-23.json'), 'utf8').then(JSON.parse),
    readFile(join(process.cwd(), 'data/spain/venue-discovery/official-municipal-leads-2026-11-23.json'), 'utf8').then(JSON.parse)
  ]);
  const municipality = municipalities.find(item => item.ineCode === ineCode);
  if (!municipality) {
    return <main className="shell section"><h1>Municipality not found</h1><p>The code {ineCode} is not present in the current INE reference registry.</p><Link href="/reports">Return to reporting centre ↗</Link></main>;
  }

  const envelope = buildMunicipalReportEnvelope({
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
  const factors = Object.entries(envelope.report.factors) as Array<[string, { value: number | null; unit: string | null; status: string; evidenceClass: string | null; limitations: string[] }]>;

  return (
    <main className="shell section">
      <div className="eyebrow">ILL-FUERZA-ES · MUNICIPAL EVIDENCE REPORT</div>
      <h1>{municipality.name}</h1>
      <p style={{color:"var(--muted)"}}>{municipality.provinceName} · {municipality.autonomousCommunityName} · INE {municipality.ineCode}</p>
      <div className="notice" style={{marginTop:18}}>REFERENCE ONLY — AquaDMRV is not connected to this deployment. This report contains no live rainfall, measured harvest, laboratory, product batch or verified climate observations.</div>
      <section className="stats" style={{marginTop:20}}>
        <div className="stat"><strong>{envelope.sourceStatus.activeVenueCount}</strong><span>Qualified active venues</span></div>
        <div className="stat"><strong>{municipality.geometryStatus || "NOT_LOADED"}</strong><span>Municipal geometry state</span></div>
        <div className="stat"><strong>{envelope.sourceStatus.aquaDmrV}</strong><span>AquaDMRV connection</span></div>
        <div className="stat"><strong>{envelope.report.claims.productReleaseStatus}</strong><span>Product release</span></div>
      </section>
      <section className="panel" style={{marginTop:20}}>
        <div className="eyebrow">VENUE DISCOVERY — NOT QUALIFICATION</div>
        <h2>Sports facility evidence leads</h2>
        <div className="stats">
          <div className="stat"><strong>{envelope.sourceStatus.osmDiscoveryCandidatesProvisional}</strong><span>OSM candidates · provisional INE match</span></div>
          <div className="stat"><strong>{envelope.sourceStatus.officialSourceLeadsAddressOnly}</strong><span>Official source leads · address only</span></div>
          <div className="stat"><strong>{envelope.sourceStatus.spatialCrosswalk}</strong><span>IGN spatial crosswalk</span></div>
        </div>
        <p style={{color:"var(--muted)",fontSize:12,lineHeight:1.7}}>These counts are discovery references, not qualified venues. No facility is promoted to a municipal anchor until the physical location intersects the versioned IGN municipal polygon, its official venue identity is reconciled, significance/management is evidenced and authorization is recorded.</p>
      </section>
      <section className="panel" style={{marginTop:22}}>
        <div className="eyebrow">INDICATOR REGISTER</div>
        <h2>Evidence availability</h2>
        <div style={{display:"grid",gap:12}}>
          {factors.map(([key, factor]) => <article key={key} style={{borderBottom:"1px solid var(--line)",paddingBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
              <strong>{key.replaceAll(/([A-Z])/g," $1").replaceAll("_"," ")}</strong>
              <span className="tag">{factor.status}</span>
            </div>
            <p style={{color:"var(--muted)",fontSize:13,margin:"6px 0"}}>{factor.value === null ? "No reportable value" : `${factor.value} ${factor.unit || ""}`} · {factor.evidenceClass || "No evidence class"}</p>
            {factor.limitations?.map((limitation, index) => <small key={index} style={{display:"block",color:"var(--muted)"}}>{limitation}</small>)}
          </article>)}
        </div>
      </section>
      <section className="panel" style={{marginTop:20}}>
        <div className="eyebrow">CLAIM AND INTEGRITY CONTROLS</div>
        <h2>No inferred environmental claims</h2>
        <p style={{color:"var(--muted)",lineHeight:1.7}}>Verified climate claim: NO · Carbon credits issued: NO · Product released: NO. These states can change only after source-backed evidence, applicable methodology and authorized independent review.</p>
        <p><Link href={`/api/reports/municipal?ineCode=${ineCode}`}>Download machine-readable JSON report ↗</Link></p>
        <p><Link href="/reports">Return to reporting centre ↗</Link></p>
      </section>
    </main>
  );
}
