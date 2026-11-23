# Illovediza Fuerza

**Product:** Spain Municipal RainWater, Sports Venue & Climate DMRV Platform  
**Home repository:** `Samoolino/illovediza`  
**Shared water/harvest/QMS/cryptographic DMRV engine:** [AquaDMRV](https://github.com/Samoolino/AquaDMRV) (repository access pending)  
**Geospatial/reporting platform:** [R](https://github.com/Samoolino/R)

Illovediza Fuerza is a Spain-wide **municipal climate-product enhancer**. Major padel courts and qualifying municipal football stadiums are its primary physical engagement anchors; significant Ayuntamiento-managed tennis venues in selected Polideportivos are a selective extension. Authorized sports complexes can host monitored rainwater catchments and, after physical quality and regulatory approval, municipal-branded Premium RainWater products.

## Spain territorial reference

The programme is designed against the documented territorial reference scope:

- **17 + 2** autonomous communities and autonomous cities
- **50** provinces
- **8,132** municipalities

These are programme reference counts, not proof that every administrative boundary has been ingested, reconciled, verified or activated. The canonical geography registry must retain official identifiers, source, licence, release/version, parent relationships and QA status. Do not treat all municipalities as active sports or measurement sites.

## Sports venue qualification

1. **Padel — primary:** major courts, dedicated centres and Polideportivos with documented significance.
2. **Football — primary:** municipal stadiums/grounds qualifying where the same documented municipal sports complex also contains a qualified major padel anchor.
3. **Tennis — selective:** significant or sustainability-relevant tennis facilities in Ayuntamiento-managed Polideportivos, supported by municipal management evidence.

A physical complex has one canonical venue identity and may have multiple sport affiliations. A map tag or OSM record creates a candidate, not a qualified venue, municipal partnership or harvest authorization.

## Product promise

- Discover Spain through an accessible territorial map and municipal directory.
- Locate and qualify sports venues and potential harvest/measurement nodes.
- Connect clubs, facilities, local organizers, municipal actors and competition structures.
- Qualify sports venues as potential authorized rainwater harvesting hosts.\n- Bind municipal/Polideportivo product identity to venue coordinates, rain event, harvest timestamp, batch, seal, evidence package and SHA-256 root.\n- Record approved environmental, climate, participation and social-impact activity.
- Run project-specific digital MRV (dMRV), quality controls, review and reporting.
- Anchor approved evidence-package hashes for integrity and independent checking.
- Produce municipal, provincial, autonomous-community, national and institutional reports.

## Evidence rule

`ACTIVITY ≠ MEASUREMENT ≠ VALIDATED IMPACT ≠ VERIFIED CLAIM ≠ ISSUED CREDIT`

A venue, map pin, sports event, participation count or blockchain transaction alone does not establish an ESG outcome or carbon credit. Every claim requires an applicable indicator definition, source, time, geography, method, quality checks, calculation, uncertainty and review. Carbon claims additionally require an eligible methodology, baseline, additionality where applicable, validation/verification and registry issuance.

## Repository boundaries

- This repository owns Illovediza's product identity, Spain sports registry, sports-specific indicators, project UI, Spain project reports and its DMRV project profile.
- AquaDMRV is the designated shared water/harvest evidence, QMS, cryptographic and climate-accounting engine. OMI-OJO remains a related evidence/governance platform; its legacy BE-EVIDENCE-1.0 schema is retained as a compatibility fixture, not as the live water/harvest runtime.
- R owns reusable geospatial discovery, climate/map reporting services and spatial visualization adapters.
- Repositories integrate through versioned APIs and contracts; they do not merge their unrelated product identities or copy one project's evidence into another.

## Reporting centre\n\n- `/reports` — municipal reporting catalogue and INE-code launcher.\n- `/reports/municipal?ineCode=28079` — rendered municipal evidence report.\n- `/api/reports/municipal?ineCode=28079` — machine-readable municipal report envelope. Until AquaDMRV and physical source feeds are authenticated, reports are explicitly reference-only and contain no invented measurements.\n\n## Spain municipal registry and APIs

- `data/spain/municipalities/index.json` indexes all 19 autonomous communities/cities and 8,132 municipality records.
- `GET /api/municipalities?limit=10000&offset=0` returns the complete municipal reference set; supports `q`, `community`, `offset` and `limit`.
- `GET /api/sports-network` returns source-backed venue records, qualification results, municipal sports summary and the Illovediza-owned reportable-factor registry. The current venue registry is empty until qualified geotagged records are imported.\n- [R Spain map](https://r-global-climate.vercel.app/illovediza-spain-map.html) consumes the Illovediza APIs, displays the 8,132 municipal directory, IGN boundary overlay, sports filters and reportable factors.
- `scripts/verify-spain-registry.mjs` and `npm run test:registry` validate record count, uniqueness, hierarchy partition counts and initial unassessed states.\n- `scripts/ingest-spain-ign-boundaries.mjs` and `npm run ingest:spain:ign` validate a locally converted official IGN/CNIG municipal polygon dataset against all 8,132 INE codes and create a checksummed local-only manifest.\n- The first OSM-backed venue discovery seed is `data/spain/sports-venues.discovery-batch-2026-11-23.json`: seven candidates, zero qualified venues.\n- The first official-source facility lead batch is `data/spain/venue-discovery/official-municipal-leads-2026-11-23.json`: seven authority-backed, address-only leads, zero geotagged or qualified.\n- `npm run discover:sports:spain` fetches a live OSM candidate snapshot; `npm run fetch:spain:ign -- --boundary-release YYYY-MM-DD` fetches a paginated official IGN OGC API snapshot after the release date is checked.

Primary municipal source: INE *Relación de municipios y sus códigos por provincias*, 1 January 2026 (published 4 February 2026), processed through the versioned CodeForSpain dataset snapshot. See [Spain Municipal Registry](docs/SPAIN-MUNICIPAL-REGISTRY.md).

## Shared AquaDMRV architecture\n\n- AquaDMRV is the intended shared engine for physical water/harvest evidence, event streaming, QMS/batch assurance, cryptographic anchoring/readback and climate-accounting controls.\n- Illovediza owns the Spanish municipal/venue network, product identity, project methodology profile, municipal reporting and product/batch presentation.\n- R consumes the same versioned evidence and reporting contracts as a read-only geospatial/analytical client. It is not a second evidence ledger.\n- Project profiles are defined in `config/aquadmrv/illovediza-project-profile.json` and `config/aquadmrv/illovediza-rainwater-qms-profile.json`. The detailed contract is in `docs/AQUADMRV-ILL-FUERZA-INTEGRATION.md`.\n- The supplied AquaDMRV GitHub URL currently returns 404 through the connected GitHub integration. Its runtime schemas and endpoints have not been inspected; no live connection or real-time blockchain stream is claimed.\n- Water source classification, competent-authority approval, applicable quality specification, laboratory chain of custody, QMS release and packaging compliance must pass before a batch can be released. A blockchain anchor cannot override a product hold.\n\n## Documentation

- [Project charter](docs/PROJECT-CHARTER.md)
- [Architecture and repository boundaries](docs/ARCHITECTURE.md)
- [Sports node and measurement model](docs/SPORTS-NODES-AND-MEASUREMENT.md)
- [Sports venue discovery and qualification](docs/SPORTS-VENUE-DISCOVERY.md)
- [Frontend and geospatial specification](docs/FRONTEND-GEO-REPORTING.md)
- [DMRV and cryptographic evidence lifecycle](docs/DMRV-EVIDENCE-AND-INTEGRITY.md)
- [AquaDMRV Illovediza integration](docs/AQUADMRV-ILL-FUERZA-INTEGRATION.md)\n- [OMI-OJO DMRV contract compatibility](docs/OMI-OJO-DMRV-CONTRACT.md)
- [Migration and extraction manifest](docs/MIGRATION-MANIFEST.md)
- [Spain municipal registry](docs/SPAIN-MUNICIPAL-REGISTRY.md)
- [Official geography and venue crosswalk](docs/SPAIN-GEOGRAPHY-AND-VENUE-CROSSWALK.md)
- [Integration contracts](docs/INTEGRATIONS.md)

## Delivery posture

The repository bootstrap and architecture are being established first. Historical Illovediza material remains in OMI-OJO until a verified inventory, migration, build/test and route-compatibility check is completed. No physical deployment, live sports partnership, verified environmental outcome, token issuance or carbon-credit issuance is implied by this repository's creation.
