# Illovediza Fuerza

**Product:** Spain Sports ESG, Territorial Intelligence & Digital MRV Platform  
**Home repository:** `Samoolino/illovediza`  
**Parent evidence infrastructure:** [OMI-OJO](https://github.com/Samoolino/OMI-OJO)  
**Geospatial/reporting platform:** [R](https://github.com/Samoolino/R)

Illovediza Fuerza is a Spain-wide **municipal climate-product enhancer**. Major padel courts and qualifying municipal football stadiums are its primary physical engagement anchors; significant Ayuntamiento-managed tennis venues in selected Polideportivos are a selective extension. Authorized sports complexes can host monitored rainwater catchments and, after physical quality and regulatory approval, municipal-branded Premium RainWater products.

## Spain territorial reference

The programme is designed against the documented territorial reference scope:

- **17 + 2** autonomous communities and autonomous cities
- **50** provinces
- **8,132** municipalities

These are programme reference counts, not proof that every administrative boundary has been ingested, reconciled, verified or activated. The canonical geography registry must retain official identifiers, source, licence, release/version, parent relationships and QA status. Do not treat all municipalities as active sports or measurement sites.

## Three anchor sports

1. **Padel** — primary growth and community activation opportunity, including emerging municipal cultures and dedicated padel clubs.
2. **Tennis** — established club, academy, facility and federation structures.
3. **Football** — broad territorial reach through clubs, grounds, academies, leagues and recognized competition systems.

A venue may host multiple sports. Model one physical venue with multiple sport affiliations rather than creating duplicate facilities. Sports affiliation does not imply federation endorsement or partnership.

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
- OMI-OJO owns the shared evidence lifecycle, common DMRV contracts, assurance controls and cross-project governance.
- R owns reusable geospatial discovery, climate/map reporting services and spatial visualization adapters.
- Repositories integrate through versioned APIs and contracts; they do not merge their unrelated product identities or copy one project's evidence into another.

## Spain municipal registry and APIs

- `data/spain/municipalities/index.json` indexes all 19 autonomous communities/cities and 8,132 municipality records.
- `GET /api/municipalities?limit=10000&offset=0` returns the complete municipal reference set; supports `q`, `community`, `offset` and `limit`.
- `GET /api/sports-network` returns source-backed venue records, qualification results, municipal sports summary and the Illovediza-owned reportable-factor registry. The current venue registry is empty until qualified geotagged records are imported.\n- [R Spain map](https://r-global-climate.vercel.app/illovediza-spain-map.html) consumes the Illovediza APIs, displays the 8,132 municipal directory, IGN boundary overlay, sports filters and reportable factors.
- `scripts/verify-spain-registry.mjs` and `npm run test:registry` validate record count, uniqueness, hierarchy partition counts and initial unassessed states.

Primary municipal source: INE *Relación de municipios y sus códigos por provincias*, 1 January 2026 (published 4 February 2026), processed through the versioned CodeForSpain dataset snapshot. See [Spain Municipal Registry](docs/SPAIN-MUNICIPAL-REGISTRY.md).

## Shared DMRV runtime boundary\n\n- Illovediza prepares canonical `BE-EVIDENCE-1.0` packages and SHA-256 roots.\n- `POST /api/dmrv/validate-shared` relays a package to OMI-OJO's authenticated `POST /api/integrations/illovediza/evidence` intake.\n- OMI-OJO validates the project namespace, canonical package and root, returning `VALIDATED_NOT_PERSISTED`. Durable evidence storage, reviewer workflow, audit receipts and blockchain anchor submission/readback are separate deployment gates.\n- A cryptographic anchor never proves water quality, product release or carbon-credit eligibility.\n\n## Documentation

- [Project charter](docs/PROJECT-CHARTER.md)
- [Architecture and repository boundaries](docs/ARCHITECTURE.md)
- [Sports node and measurement model](docs/SPORTS-NODES-AND-MEASUREMENT.md)
- [Sports venue discovery and qualification](docs/SPORTS-VENUE-DISCOVERY.md)
- [Frontend and geospatial specification](docs/FRONTEND-GEO-REPORTING.md)
- [DMRV and cryptographic evidence lifecycle](docs/DMRV-EVIDENCE-AND-INTEGRITY.md)
- [OMI-OJO DMRV contract compatibility](docs/OMI-OJO-DMRV-CONTRACT.md)
- [Migration and extraction manifest](docs/MIGRATION-MANIFEST.md)
- [Spain municipal registry](docs/SPAIN-MUNICIPAL-REGISTRY.md)
- [Official geography and venue crosswalk](docs/SPAIN-GEOGRAPHY-AND-VENUE-CROSSWALK.md)
- [Integration contracts](docs/INTEGRATIONS.md)

## Delivery posture

The repository bootstrap and architecture are being established first. Historical Illovediza material remains in OMI-OJO until a verified inventory, migration, build/test and route-compatibility check is completed. No physical deployment, live sports partnership, verified environmental outcome, token issuance or carbon-credit issuance is implied by this repository's creation.
