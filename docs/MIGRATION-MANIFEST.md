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
- [ ] Full source inventory and file-by-file classification.
- [ ] Move existing page, assets, project copy and project-specific components.
- [x] Create standalone Next.js app shell, product landing page and CI build workflow (runtime build result not yet verified).
- [ ] Add OMI-OJO project registry and adapter/legacy route transition.
- [ ] Implement R integration against verified versioned interfaces.
- [ ] Validate Spanish geography identifiers, boundaries, licences and counts.
- [ ] End-to-end evidence, anchor readback and report acceptance.

No source files have been deleted from OMI-OJO as part of this bootstrap. This is intentional: a safe migration must not strand the existing route or lose project content.
