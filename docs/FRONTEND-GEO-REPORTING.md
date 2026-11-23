# Frontend, map and spatial reporting specification

## 1. Experience direction

Build an **airport/observatory-style municipal climate-product command interface**: a premium RainWater product story, national geography control surface, sports-venue discovery/qualification, physical harvest/QMS lifecycle, municipal drill-down and institutional reporting. The visual language must distinguish administrative references, candidates, authorized sites, commissioned harvest nodes and independently verified evidence.

Primary navigation:
- Overview
- Spain map
- Municipalities
- Sports network
- Padel
- Tennis
- Football
- Events & competitions
- Harvest / measurement nodes
- Climate & environment
- ESG / GHG
- Social impact
- Evidence & dMRV
- Reports / institutional access

## 2. Landing page narrative

**Illovediza Fuerza — Sport as a territorial platform for measurable impact.**

A connected Spain-wide programme using padel, tennis and football facilities to activate local communities, connect sports institutions and build an auditable evidence network for environmental, climate, social and governance outcomes.

The landing page must explain:
- why sport venues are the local engagement infrastructure;
- why padel and qualifying football define the primary venue strategy, with selective tennis;
- how national/regional/provincial/municipal competition structures connect communities;
- how venue nodes differ from municipal reporting references;
- how rainfall, measured harvest, treatment, laboratory custody, batch release and cryptographic evidence become reviewed municipal reports;
- how the programme protects data quality and avoids unsupported impact claims.

## 3. Map views

1. **National overview:** Spain, 17+2 autonomous communities/cities, 50 provinces and municipal reference grid.
2. **Autonomous-community view:** province and municipality drill-down, coverage and source quality.
3. **Municipal view:** venues, sport affiliations, clubs, events, candidate/authorized/commissioned nodes.
4. **Sports view:** filter and compare padel, tennis and football; show multi-sport venues once.
5. **Evidence view:** spatially link reportable observations and released evidence with privacy-aware coordinate precision.
6. **Impact view:** indicator coverage, measured/calculated/modelled classes, reporting period, uncertainty and review status.

Every map layer needs a legend, date, source, spatial resolution, licence and quality/coverage state. Provide a searchable accessible list/table fallback; map interaction cannot be the only way to reach information.

## 4. Geospatial stack

Use R's existing global observatory and map methodology as the starting point, not as an unreviewed production dependency. Evaluate:
- Mapbox GL JS for vector maps, styles, geocoding and terrain (token and licence required);
- MapLibre GL JS as an open-source vector-map renderer;
- OpenStreetMap data with attribution and ODbL compliance;
- geoBoundaries and authoritative Spanish administrative boundary sources, with release and licence tracking;
- PostGIS for spatial joins, geometry QA and versioned boundaries;
- deck.gl for high-volume spatial overlays where measured need justifies it;
- Three.js for the existing R globe/3D navigation pattern;
- Unity and Unreal Engine for optional high-fidelity spatial storytelling, simulation or venue-scale digital twins.

Do not make Unity/Unreal a dependency of the public web application. Treat engine handoffs as optional, versioned exports. R already has Unity and Unreal integration guidance and Power BI exports; review those contracts before reuse.

## 5. Climate and environmental data

AquaDMRV is the intended canonical source for authenticated physical harvest, water-quality/QMS and climate-accounting evidence. R's provider adapters can supply source-linked climate/context data. Clearly distinguish weather forecasts, modelled/reanalysis data, satellite products, direct instrument observations, calculations and proxies. A rainfall estimate is not harvested volume, and harvested volume is not a product-quality result. A point weather response is not a municipal area average. Municipal aggregation requires documented spatial weighting, geometry version, coverage threshold and missingness treatment.

## 6. Reporting products

- Municipal scorecard with indicator-level evidence, not opaque composite scores.
- Provincial and autonomous-community portfolio reports with preserved municipal provenance.
- National programme report with coverage and comparability qualifications.
- Sports-club / venue report scoped to the authorized operator and period.
- Product and batch QMS report with specification version, lab scope, custody, deviations, QA holds and authorized release decisions.\n- ESG/GHG report with methodology, boundary, factors, calculations, uncertainty and independent review.\n- Climate-finance readiness report distinguishing eligibility screening, verified impact, credit issuance and retirement.
- Social impact report with definitions, consent, disaggregation safeguards and limitations.
- Governance report with permissions, accountability, controls, complaints and review trail.
- Evidence appendix linking every material figure to source and package identifiers.

## 7. UI state and accessibility

Support loading, unavailable, stale, insufficient coverage, restricted, disputed boundary and QC hold states. Show timestamps and data class beside values. Meet keyboard, screen-reader, reduced-motion, contrast and mobile requirements. Provide non-WebGL fallback. Do not label a page "live" solely because it refreshes.

## 8. Secrets and configuration

Use server-side environment variables only. Commit `.env.example` with names and descriptions, never secrets. Mapbox access tokens must be restricted to intended origins/scopes. Keep provider credentials and anchor keys out of browser bundles, reports and public exports.


## 9. AquaDMRV integration and report access

AquaDMRV owns canonical event ingestion, signed physical observations, evidence-package lifecycle, water-quality/QMS state, cryptographic anchoring/readback and climate-accounting assurance. Illovediza owns the Spanish project profile and municipal product/reporting experience. R is a read-only geospatial and analytical consumer.

The Illovediza frontend includes a municipal reporting centre at `/reports`, a rendered report at `/reports/municipal?ineCode=<five-digit-INE>`, and a machine-readable endpoint at `/api/reports/municipal?ineCode=<five-digit-INE>`. R exposes a read-only proxy at `/api/illovediza/municipal-report?ineCode=<five-digit-INE>`.

Until AquaDMRV's repository schemas are inspected and the service connection passes a live authenticated handshake, these reports are reference-only and must show unavailable/pending evidence states. No scheduled report may claim live harvest, laboratory compliance, product release, carbon verification or blockchain anchoring without source-backed records and persisted run receipts.
