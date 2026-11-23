const sports = [
  { no: "01 / GROWTH & COMMUNITY", title: "Padel", text: "Emerging municipal padel cultures, dedicated clubs, multi-sport centres, leagues and tournaments create a flexible local activation network.", tags: ["Clubs & courts", "Municipal reach", "Tournaments"] },
  { no: "02 / CLUB & ACADEMY", title: "Tennis", text: "Established clubs, academies, public courts and regional competition structures connect recurring participation with local facilities.", tags: ["Clubs & academies", "Regional circuits", "Facilities"] },
  { no: "03 / NATIONAL REACH", title: "Football", text: "Clubs, stadiums, municipal pitches, academies and league systems provide a broad territorial framework for community engagement.", tags: ["Clubs & grounds", "League structures", "Community sport"] },
];

export default function Home() {
  return (
    <main>
      <header className="shell topbar">
        <a className="brand" href="#"><span className="brandmark">IF</span><span>ILLOVEDIZA <span style={{color:"var(--lime)"}}>FUERZA</span></span></a>
        <nav className="nav"><a href="#territory">Territory</a><a href="#sports">Sports network</a><a href="#evidence">Evidence system</a><a href="#reports">Reporting</a></nav>
        <a className="cta secondary" href="#network">EXPLORE THE NETWORK ↗</a>
      </header>

      <section className="shell hero">
        <div>
          <div className="kicker">SPAIN · SPORTS ESG · TERRITORIAL INTELLIGENCE</div>
          <h1>Sport becomes a platform for <span style={{color:"var(--lime)"}}>measurable impact.</span></h1>
          <p>Illovediza Fuerza connects Spain's padel, tennis and football ecosystems to a territorial network for local participation, environmental measurement, social impact and evidence-backed institutional reporting.</p>
          <div className="actions"><a className="cta" href="#sports">DISCOVER THE SPORTS NETWORK ↗</a><a className="cta secondary" href="#evidence">HOW THE EVIDENCE WORKS</a></div>
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
          <div className="stat"><strong>03</strong><span>Anchor sports</span></div>
        </div>
      </section>

      <section className="shell section" id="sports">
        <div className="section-head"><div><div className="eyebrow">THE SPORTS NETWORK</div><h2>Three sports. One territorial platform.</h2></div><p>Each sport contributes a different engagement structure. Facilities can be multi-sport; the platform records one venue identity with multiple sport affiliations.</p></div>
        <div className="sports">{sports.map(s => <article className="sport" key={s.title}><div><div className="sport-no">{s.no}</div><h3>{s.title}</h3><p>{s.text}</p></div><div>{s.tags.map(t=><span className="tag" key={t}>{t}</span>)}</div></article>)}</div>
      </section>

      <section className="shell section grid-two" id="network">
        <article className="panel"><div className="eyebrow">TERRITORIAL ENGAGEMENT</div><h2>From national structures to the local court.</h2><p style={{color:"var(--muted)",fontSize:13,lineHeight:1.8}}>The programme maps existing sports relationships rather than imposing one artificial hierarchy. National, autonomous-community, provincial and municipal competition structures connect to clubs, operators, venues and community events where documented.</p><div className="hierarchy"><span><b>01</b> Spain</span><span><b>02</b> Autonomous community</span><span><b>03</b> Province</span><span><b>04</b> Municipality</span><span><b>05</b> Club / venue</span><span><b>06</b> Event / node</span></div></article>
        <article className="panel"><div className="eyebrow">MUNICIPAL INTELLIGENCE</div><h2>Every municipality gets a clear status.</h2><p style={{color:"var(--muted)",fontSize:13,lineHeight:1.8}}>Municipal pages distinguish geography coverage, discovered venues, partner validation, permission status, commissioned measurement nodes and reviewed evidence. A municipal boundary is a reporting reference, not proof of a physical installation.</p><div className="notice">Territorial reference counts are planning scope. Official identifiers, boundary releases, source licences and municipal coverage must be validated before being represented as verified coverage.</div></article>
      </section>

      <section className="shell section" id="evidence">
        <div className="section-head"><div><div className="eyebrow">THE DMRV EVIDENCE SPINE</div><h2>From activity to an auditable report.</h2></div><p>Illovediza uses the shared OMI-OJO evidence lifecycle while maintaining its own sports-specific measurable indicators, baselines and project identity.</p></div>
        <div className="panel"><div className="steps">{[["01","Authorize","Project, venue, operator and monitoring scope."],["02","Collect","Timestamped source, activity and instrument records."],["03","Quality","QC, reconciliation, method and uncertainty."],["04","Package","Deterministic evidence package and version."],["05","Review","Independent decision and controlled status."],["06","Anchor","Cryptographic commitment and proof readback."],["07","Report","Municipal, provincial and national outputs."],["08","Release","Authorized publication and claim controls."]].map(s=><div className="step" key={s[0]}><small>{s[0]}</small><strong>{s[1]}</strong><span>{s[2]}</span></div>)}</div><div className="notice">A blockchain anchor establishes integrity of a recorded evidence commitment. It does not independently prove environmental truth, social impact, GHG reductions or carbon-credit issuance.</div></div>
      </section>

      <section className="shell section grid-two" id="reports">
        <article className="panel"><div className="eyebrow">SPATIAL REPORTING</div><h2>One view from venue to territory.</h2><p style={{color:"var(--muted)",fontSize:13,lineHeight:1.8}}>The planned map experience combines Spanish administrative geography, sports venue layers, climate context and approved evidence locations. Mapbox or MapLibre, PostGIS, OpenStreetMap and versioned official boundaries are evaluated through the R geospatial integration.</p><div className="hierarchy"><span>National map</span><span>Regional / province</span><span>Municipal view</span><span>Sports venues</span><span>Evidence layers</span></div></article>
        <article className="panel"><div className="eyebrow">INSTITUTIONAL OUTPUTS</div><h2>Reports built for scrutiny.</h2><p style={{color:"var(--muted)",fontSize:13,lineHeight:1.8}}>Municipal and portfolio reports will expose indicator definitions, source records, calculations, methodology, limitations, review status and integrity references. ESG, GHG, social and governance outputs remain distinct, transparent and evidence-linked.</p><div className="hierarchy"><span>ESG / GHG</span><span>Social impact</span><span>Governance</span><span>Sports participation</span><span>Evidence register</span></div></article>
      </section>

      <footer className="shell footer"><span>ILLOVEDIZA FUERZA · SPAIN SPORTS ESG</span><span>PROJECT ID: ILL-FUERZA-ES · ARCHITECTURE BOOTSTRAP</span><span>OMI-OJO DMRV × R GEO REPORTING</span></footer>
    </main>
  );
}
