import Link from "next/link";

const examples = [
  { code: "50297", name: "Zaragoza" },
  { code: "04053", name: "Huércal-Overa" },
  { code: "41091", name: "Sevilla" },
  { code: "48020", name: "Bilbao" },
  { code: "15030", name: "A Coruña" },
  { code: "24089", name: "León" }
];

export default function ReportsPage() {
  return (
    <main className="shell section">
      <div className="eyebrow">ILL-FUERZA-ES · REPORTING CENTRE</div>
      <h1>Municipal climate-product reporting</h1>
      <p style={{maxWidth:760,color:"var(--muted)",lineHeight:1.8}}>
        Generate a municipality-scoped evidence report from the official INE reference registry. The report clearly separates administrative identity from measured rainfall, physical harvest, product quality, cryptographic anchoring and verified climate outcomes.
      </p>
      <section className="panel" style={{marginTop:24}}>
        <div className="eyebrow">MUNICIPAL REPORT</div>
        <h2>Open a municipal evidence report</h2>
        <form action="/reports/municipal" method="get" style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"end"}}>
          <label style={{display:"grid",gap:8}}>
            <span>Five-digit INE municipality code</span>
            <input name="ineCode" required pattern="[0-9]{5}" maxLength={5} placeholder="e.g. 50297" style={{padding:12,borderRadius:8,border:"1px solid var(--line)",background:"var(--surface)",color:"inherit"}} />
          </label>
          <button className="cta" type="submit">GENERATE REPORT ↗</button>
        </form>
        <p style={{color:"var(--muted)",fontSize:12}}>The current report is a reference-only baseline until AquaDMRV evidence feeds, IGN geometry, field measurements and QA/QMS records are connected.</p>
      </section>
      <section className="panel" style={{marginTop:20}}>
        <div className="eyebrow">DISCOVERY BATCH</div>
        <h2>First venue candidates</h2>
        <p style={{color:"var(--muted)",lineHeight:1.7}}>The first candidate set includes two padel locations and five football stadium candidates. None has been promoted to qualified status or authorized harvest-site status.</p>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          {examples.map(item => <Link key={item.code} className="tag" href={`/reports/municipal?ineCode=${item.code}`}>{item.name} · {item.code}</Link>)}
        </div>
      </section>
      <section className="grid-two" style={{marginTop:20}}>
        <article className="panel"><div className="eyebrow">SHARED ASSURANCE</div><h2>AquaDMRV</h2><p style={{color:"var(--muted)",lineHeight:1.7}}>The intended shared engine for signed water observations, physical harvest evidence, quality management, batch release, cryptographic proof and climate accounting.</p><Link href="/docs/AQUADMRV-ILL-FUERZA-INTEGRATION.md">Integration requirements ↗</Link></article>
        <article className="panel"><div className="eyebrow">GEOSPATIAL REPORTING</div><h2>R observatory</h2><p style={{color:"var(--muted)",lineHeight:1.7}}>R consumes the Illovediza municipal and sports APIs for map-based reporting and municipal comparisons.</p><a href="https://r-global-climate.vercel.app/illovediza-spain-map.html">Open Spain map ↗</a></article>
      </section>
    </main>
  );
}
