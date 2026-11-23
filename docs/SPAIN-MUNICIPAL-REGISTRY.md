# Spain municipal registry — 8,132 reporting references

## Current dataset

The Illovediza repository contains a versioned 2026 municipal reference registry partitioned by autonomous community/city under `data/spain/municipalities/`.

- 17 autonomous communities and 2 autonomous cities
- 50 provinces
- 8,132 municipality records
- Official five-digit INE municipality codes preserved as strings, including leading zeroes
- Province and autonomous-community relationships
- One administrative reporting reference per municipality
- Padel, football and tennis coverage initialized to `NOT_ASSESSED`
- Venue lists empty until source-backed venue records are imported
- Geometry status remains `NOT_LOADED` until official boundary geometry is ingested and validated

## Source lineage

Primary authority: Instituto Nacional de Estadística (INE), *Relación de municipios y sus códigos por provincias*, reference date 1 January 2026, published 4 February 2026. INE explains that the municipality list follows the names registered in the Registro de Entidades Locales and that the INE assigns the five-digit municipality code (province code + municipality code) and a sixth check digit.

Processed source snapshot: `codeforspain/ds-organizacion-administrativa`, `data/municipios.json`, source commit `e757c424faea328387cc12e5893ff36c87221fe2`. The upstream README records that its latest processed INE source is the 1 January 2026 listing. The autonomous-community mapping is an explicit province-code crosswalk maintained in the generation process; it must be independently checked against the official administrative hierarchy before the registry is promoted to verified.

Reference links:
- INE listing: https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736177031&idp=1254734710990&menu=ultiDatos
- INE 2026 municipality code workbook pattern: https://www.ine.es/daco/daco42/codmun/26codmun.xlsx
- Processed dataset: https://github.com/codeforspain/ds-organizacion-administrativa

## Important limits

The registry is a complete administrative reference layer, not a complete sports-facility gazetteer. It does not currently establish:
- official municipal polygon geometry;
- verified centroid coordinates;
- the existence or significance of a sports venue;
- Ayuntamientos management or endorsement;
- site access, rainwater harvesting permission or instrument installation;
- live climate observations;
- actual harvested water, quality or product batches;
- verified GHG reductions or carbon-credit eligibility.

Do not use municipality centroids as sports venue coordinates. Venue coordinates must be sourced from the actual facility record and checked against the official municipality geometry. IGN/CNIG administrative boundary products are the preferred geometry source; retain their release date, coordinate reference system, geometry uncertainty, attribution and licence. Some boundary sections may be provisional and the IGN describes approximately 40 m uncertainty for portions of its boundary dataset.

## Registry refresh and acceptance

A future refresh must:
1. retrieve the new INE municipal code release;
2. compare additions, removals, code changes and renamed municipalities;
3. preserve historical identity and supersession links;
4. reconcile province and autonomous-community parent codes;
5. validate exactly one active municipality record per official INE code;
6. compare the count against the release metadata;
7. import and QA the matching IGN geometry release separately;
8. record source checksums, release dates, licence/attribution and reviewer approval.

A municipality is shown as represented when its official reporting reference exists. It is not shown as sports-covered until qualified venues have been source-checked and geotagged.
