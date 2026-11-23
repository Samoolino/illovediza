# Migration manifest — OMI-OJO to Illovediza

## Objective

Move all Illovediza-specific composition into `Samoolino/illovediza` while retaining OMI-OJO's shared DMRV and the existing R geospatial platform as connected services.

## Source identified

The inspected OMI-OJO main branch contains:
- `apps/web/app/illovediza-fuerza/page.tsx` — current Spain project page;
- project-specific text and reference counts embedded in that page;
- common DMRV, evidence, ESG/GHG, assurance and institutional components that must remain owned by OMI-OJO.

The former page establishes 17+2 autonomous communities/cities, 50 provinces and 8,132 municipalities as the stated territorial reference. These values need dated authoritative validation in the new Spain geography registry.

## Migration rules

1. Inventory every Illovediza-specific file, route, asset, dataset, workflow, config and document in OMI-OJO, including references in navigation, registries, tests and deployment configuration.
2. Classify each item as project-owned (move), shared platform (remain), reusable generic component (extract/version), or historical reference (retain with redirect/deprecation).
3. Copy project-owned composition with Git history where feasible; preserve attribution and original source references.
4. Replace hard-coded shared evidence logic with the documented OMI-OJO adapter; do not fork the DMRV engine.
5. Replace embedded map/geography logic with R service/component contracts after verifying current APIs.
6. Build/test the standalone Illovediza application and confirm all required assets/routes work.
7. Add OMI-OJO project registry entry and route compatibility/redirect. Keep the legacy route until the new deployment is verified.
8. Verify no Illovediza-only content remains duplicated as an active product in OMI-OJO.
9. Record migration manifest, source commit, destination commit, checksums, test output and reviewer sign-off.

## Current migration status

- [x] Target repository exists and is writable.
- [x] Target repository is confirmed empty before bootstrap.
- [x] Product identity and target architecture documented.
- [x] Sports node, territorial and DMRV boundaries documented.
- [x] Full OMI-OJO path inventory identified the legacy page, five project documents, four project configurations, the project registry entry and shared DMRV references.
- [x] Migrated five project documents and four project configurations; archived the original OMI-OJO page source and replaced it with a standalone product frontend. No separate legacy image assets were found in the source route.
- [x] Standalone Next.js app, product landing page, municipal API, sports API and CI build/typecheck/registry tests pass.
- [x] Added OMI-OJO project registration, local package compatibility adapter and shared DMRV contract tests; legacy route retained pending an approved redirect.
- [x] R map service, API proxy, IGN administrative boundary WMS overlay and reportable-factor view are deployed; server-to-server protected API request is verified.
- [x] Import and CI-validate 8,132 unique 2026 INE-code municipal references across 19 autonomous communities/cities. Official local IGN geometry extract, topology/licence QA and spatial venue crosswalk remain pending.
- [ ] Import and qualify actual sports venues from official municipal directories and OSM; populate geotags and shared-complex evidence.\n- [ ] Implement authenticated durable evidence persistence and a deployed OMI-OJO runtime service connection.\n- [ ] Physical RainWater field pilot, custody/QMS, batch/seal, product release and independent anchor readback.

No source files have been deleted from OMI-OJO as part of this bootstrap. This is intentional: a safe migration must not strand the existing route or lose project content.


## Sports and product clarification — 2026-11-23

The Spain product is a municipal climate-product enhancer, not a generic sports listing. Padel and football are the primary anchor sports; football stadiums are qualified for the combined municipal node when their shared sports-complex relationship with a major padel anchor is documented. Tennis is selective and requires a significant/sustainability-relevant Ayuntamientos-managed Polideportivo. Every venue must have a geotag and official INE municipality crosswalk.

The municipal sports facility may become a Premium RainWater host only after site permission and physical installation. Bottle/can branding can reference the municipality and Polideportivo/sports-complex, with batch, harvest timestamp, venue coordinates and evidence root. Product quality, release, GHG reductions and carbon-credit issuance remain separate evidence and approval gates.

R integration includes `/api/illovediza/network` and `/illovediza-spain-map.html`; the network response bundles the reportable-factor registry. The R production deployment has `ILLOVEDIZA_API_BASE_URL` and `ILLOVEDIZA_API_BYPASS_SECRET` configured, and a protected service-to-service request has been verified. The R serverless function count was consolidated to 12 to remain within the Vercel Hobby limit.


## Deployment references

- Illovediza production: https://illovediza-fuerza.vercel.app
- R Spain observatory: https://r-global-climate.vercel.app/illovediza-spain-map.html
- R integration endpoint: https://r-global-climate.vercel.app/api/illovediza/network
- Illovediza municipal API: https://illovediza-fuerza.vercel.app/api/municipalities?limit=10000

## DMRV integration boundary

Illovediza's TypeScript package generator passes the OMI-OJO Python canonical SHA-256 test vector. OMI-OJO's local adapter validates the project namespace and package root. There is not yet an authenticated deployed OMI-OJO HTTP service or durable cross-repository evidence store; the contract adapter must not be described as a live backend submission.


## Ownership clarification — 2026-11-23

Sports qualification, municipal coverage enrichment, RainWater calculations and reportable-factor definitions are implemented in this Illovediza repository. R consumes the enriched municipality/sports APIs and renders the official IGN boundary overlay, venue markers and factor views. R is not the source of truth for Spain sports eligibility or Illovediza's project-specific climate/product calculations.


## Product traceability update — 2026-11-23

RainWater brand records now bind the municipal name and five-digit INE code, canonical venue identity, WGS84 coordinates, harvest event/time, batch, product format, evidence package ID, SHA-256 root and optional anchor network/transaction/block timestamp. An anchor never upgrades water-quality status or product release; those remain QMS and regulatory decisions. Bottle/can formats are traceability options, not a claim that production or sale has commenced.
