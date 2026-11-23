const sports = [
  { no: "01 / GROWTH & COMMUNITY", title: "Padel", text: "Emerging municipal padel cultures, dedicated clubs, multi-sport centres, leagues and tournaments create a flexible local activation network.", tags: ["Clubs & courts", "Municipal reach", "Tournaments"] },
  { no: "02 / MUNICIPAL SPORTS COMPLEX", title: "Football", text: "Municipal stadiums and grounds are prioritized where the same documented sports complex also hosts a major padel anchor. This creates a combined municipal activation point.", tags: ["Municipal stadiums", "Shared sports complex", "Local engagement"] },
  { no: "03 / SELECTIVE FACILITY", title: "Tennis", text: "Tennis is included selectively: significant or sustainability-relevant facilities in Ayuntamiento-managed Polideportivos, supported by municipal management evidence.", tags: ["Polideportivos", "Ayuntamiento-managed", "Selective inclusion"] },
];

export default function Home() {
  return (
    <main>
      <header className="shell topbar">
        <a className="brand" href="#"><span className="brandmark">IF</span><span>ILLOVEDIZA <span style={{color:"var(--lime)"}}>FUERZA</span></span></a>
        <nav className="nav"><a href="#territory">Territory</a><a href="#sports">Sports anchors</a><a href="#rainwater">RainWater product</a><a href="#evidence">DMRV</a><a href="/reports">Reporting centre</a></nav>
        <a className="cta secondary" href="https://r-global-climate.vercel.app/illovediza-spain-map.html" target="_blank" rel="noreferrer">OPEN SPAIN MAP ↗</a>
      </header>

      <section className="shell hero">
        <div>
          <div className="kicker">SPAIN · MUNICIPAL CLIMATE PRODUCT · AQUADMRV</div>
          <h1>Turn municipal sports venues into <span style={{color:"var(--lime)"}}>climate-product infrastructure.</span></h1>
          <p>Illovediza Fuerza connects major padel courts and qualifying municipal football stadiums — with selective Ayuntamiento-managed tennis facilities — to authorized rainwater harvesting, premium municipal product identity and evidence-backed climate, ESG and governance reporting.</p>
          <div className="actions"><a className="cta" href="#rainwater">EXPLORE THE RAINWATER PRODUCT ↗</a><a className="cta secondary" href="#evidence">HOW DMRV WORKS</a></div>
        </div>
        <div className="hero-art" aria-label="Illustrative spatial network graphic">
          <div className="eyebrow">A CONNECTED TERRITORIAL NETWORK</div>
          <div className="orbit three"></div><div className="orbit two"></div><div className="orbit"></div>
          <i className="mapdot dot1"></i><i className="mapdot dot2"></i><i className="mapdot dot3"></i><i className="mapdot dot4"></i>
          <div className="art-label">ILLUSTRATIVE NETWORK · NOT LIVE DEPLOYMENT DATA</div>
        </div>
      </section>

      <section className="shell" id="territory">
        <div className="stats">
          <div className="stat"><strong>17 + 2</strong><span>Autonomous communities / cities</span></div>
          <div className="stat"><strong>50</strong><span>Provinces</span></div>
          <div className="stat"><strong>8,132</strong><span>Municipal reference scope</span></div>
          <div className="stat"><strong>02 + 1</strong><span>Primary sports + selective tennis</span></div>
        </div>
      </section>

      <section className="shell section" id="sports">
        <div className="section-head"><div><div className="eyebrow">THE SPORTS NETWORK</div><h2>Two primary sports anchors. One selective extension.</h2></div><p>Padel and football define the primary municipal venue strategy. Tennis is selectively included where a significant Ayuntamiento-managed Polideportivo adds measurable value. Multi-sport facilities retain one canonical venue identity.</p></div>
        <div className="sports">{sports.map(s => <article className="sport" key={s.title}><div><div className="sport-no">{s.no}</div><h3>{s.title}</h3><p>{s.text}</p></div><div>{s.tags.map(t=><span className="tag" key={t}>{t}</span>)}</div></article>)}</div>
      </section>

      <section className="shell section grid-two" id="network">
        <article className="panel"><div className="eyebrow">TERRITORIAL ENGAGEMENT</div><h2>From national structures to the local court.</h2><p style={{color:"var(--muted)",fontSize:13,lineHeight:1.8}}>The programme maps existing sports relationships rather than imposing one artificial hierarchy. National, autonomous-community, provincial and municipal competition structures connect to clubs, operators, venues and community events where documented.</p><div className="hierarchy"><span><b>01</b> Spain</span><span><b>02</b> Autonomous community</span><span><b>03</b> Province</span><span><b>04</b> Municipality</span><span><b>05</b> Club / venue</span><span><b>06</b> Event / node</span></div></article>
        <article className="panel"><div className="eyebrow">MUNICIPAL INTELLIGENCE</div><h2>Every municipality gets a clear status.</h2><p style={{color:"var(--muted)",fontSize:13,lineHeight:1.8}}>Municipal pages distinguish geography coverage, discovered venues, partner validation, permission status, commissioned measurement nodes and reviewed evidence. A municipal boundary is a reporting reference, not proof of a physical installation.</p><div className="notice">Territorial reference counts are planning scope. Official identifiers, boundary releases, source licences and municipal coverage must be validated before being represented as verified coverage.</div></article>
      </section>


      <section className="shell section grid-two" id="rainwater">
        <article className="panel"><div className="eyebrow">MUNICIPAL CLIMATE PRODUCT</div><h2>From sports venue to premium RainWater identity.</h2><p style={{color:"var(--muted)",fontSize:13,lineHeight:1.8}}>An authorized sports complex can host a rainwater catchment and collection system. Where the physical, laboratory, QMS and regulatory gates pass, a bottle or can can carry the municipality and Polideportivo identity, tied to a real harvest event and batch.</p><div className="hierarchy"><span>Municipality + INE code</span><span>Venue + coordinates</span><span>Harvest timestamp</span><span>Batch + seal</span><span>Evidence QR / root</span></div></article>
        <article className="panel"><div className="eyebrow">PHYSICAL PRODUCT CHAIN</div><h2>Every label must resolve to evidence.</h2><p style={{color:"var(--muted)",fontSize:13,lineHeight:1.8}}>Authorized site → catchment → rain event → first flush → metered collection → sampling and custody → laboratory/QMS → batch and seal → DMRV review → product release.</p><div className="notice">Illustrative brand architecture only. Premium RainWater cannot be sold or labelled as released until water-quality, product, packaging and applicable legal approvals are documented.</div></article>
      </section>
\n      <section className="shell section" id="evidence">
        <div className="section-head"><div><div className="eyebrow">THE DMRV EVIDENCE SPINE</div><h2>From activity to an auditable report.</h2></div><p>Illovediza uses AquaDMRV as its designated shared water, harvest, quality-management, cryptographic and climate-accounting engine while maintaining its own Spanish sports, municipal product and reporting identity. The project event adapter is implemented; live AquaDMRV streaming, persistence and anchoring remain pending repository access and contract alignment.</p></div>
        <div className="panel"><div className="steps">{[["01","Authorize","Project, venue, operator and monitoring scope."],["02","Collect","Timestamped source, activity and instrument records."],["03","Quality","QC, reconciliation, method and uncertainty."],["04","Package","Deterministic evidence package and version."],["05","Review","Independent decision and controlled status."],["06","Anchor","Cryptographic commitment and proof readback."],["07","Report","Municipal, provincial and national outputs."],["08","Release","Authorized publication and claim controls."]].map(s=><div className="step" key={s[0]}><small>{s[0]}</small><strong>{s[1]}</strong><span>{s[2]}</span></div>)}</div><div className="notice">A blockchain anchor establishes integrity of a recorded evidence commitment. It does not independently prove environmental truth, social impact, GHG reductions or carbon-credit issuance.</div></div>
      </section>

      <section className="shell section grid-two" id="reports">
        <article className="panel"><div className="eyebrow">SPATIAL REPORTING</div><h2>One reportable view from venue to municipality.</h2><p style={{color:"var(--muted)",fontSize:13,lineHeight:1.8}}>The R Spain observatory consumes Illovediza's municipal and venue registries and will consume versioned AquaDMRV evidence for geospatial reporting. Its current Leaflet map uses OpenStreetMap and IGN-CNIG administrative boundary layers; local IGN geometry ingestion and official venue crosswalk are the next spatial gates.</p><div className="hierarchy"><span>National map</span><span>Regional / province</span><span>Municipal view</span><span>Sports venues</span><span>Evidence layers</span></div><p><a className="cta" href="/reports">OPEN MUNICIPAL REPORT CENTRE ↗</a></p></article>
        <article className="panel"><div className="eyebrow">INSTITUTIONAL OUTPUTS</div><h2>Climate finance built on qualified evidence.</h2><p style={{color:"var(--muted)",fontSize:13,lineHeight:1.8}}>Municipal reports are designed to connect AquaDMRV-accepted venue activity, measured rainwater production, laboratory/QMS and batch status, GHG inventory, social participation and governance controls. Until the live engine and physical data sources are connected, the reporting centre explicitly identifies reference-only and pending evidence. Eligible climate-finance instruments require a defined baseline, methodology, additionality where applicable, independent verification and legal/registry acceptance.</p><div className="hierarchy"><span>ESG / GHG</span><span>Social impact</span><span>Governance</span><span>Sports participation</span><span>Evidence register</span></div></article>
      </section>

      <footer className="shell footer"><span>ILLOVEDIZA FUERZA · SPAIN MUNICIPAL CLIMATE PRODUCT</span><span>PROJECT ID: ILL-FUERZA-ES · MUNICIPAL RAINWATER & CLIMATE INTELLIGENCE</span><span>AQUADMRV ASSURANCE × R GEO REPORTING</span></footer>
    </main>
  );
}
