# Spain administrative geometry and sports venue crosswalk

## 1. Reference layers

The 8,132 municipal records are already represented by official INE municipality codes. The R Spain map now overlays the IGN-CNIG INSPIRE WMS layers:
- `AU.AdministrativeUnit` — administrative-unit polygons/labels;
- `AU.AdministrativeBoundary` — administrative boundary lines.

WMS service: https://www.ign.es/wms-inspire/unidades-administrativas?

This is the visualization layer. It does not replace a versioned local geometry extract for spatial joins, offline analysis, venue-to-municipality binding or reproducible reporting.

## 2. Official geometry source

Use the IGN-CNIG *Límites municipales, provinciales y autonómicos* product and the corresponding WFS/OGC API Features services. The CNIG download catalogue currently lists the national current-boundaries release dated **18 August 2026**, available as Shapefile (156.96 MB) and GML (63.18 MB); the catalogue also lists historical GeoPackage releases. The national administrative-unit dataset is exposed through the IGN WFS and API Features services. Pin the exact downloaded archive and checksum in each geometry-ingestion run; do not rely on a moving 'current' download URL. The IGN states that the geometry registered in the Registro Central de Cartografía can contain provisional boundary segments and that general geometric uncertainty is around 40 metres, with more precise exceptions where formal technical/legal delimitation work has been completed.

Sources:
- IGN/CNIG product and licence (current 18-08-2026 release): https://centrodedescargas.cnig.es/CentroDescargas/limites-municipales-provinciales-autonomicos
- IGN-CNIG service catalogue: https://centrodedescargas.cnig.es/CentroDescargas/servicios-web
- IGN administrative-unit WFS: https://www.ign.es/wfs-inspire/unidades-administrativas?REQUEST=GetCapabilities&SERVICE=WFS&VERSION=2.0.0
- IGN WFS/API metadata: https://datos.gob.es/es/catalogo/e0dat0002-divisiones-administrativas-de-espana1
- IGN WMS: https://www.ign.es/wms-inspire/unidades-administrativas?

Retain the exact release date, layer name, source CRS, transformed CRS, attribution, licence, checksum and boundary validity metadata. The CNIG product page describes a licence compatible with CC-BY 4.0 and requires attribution to IGN-CNIG; inspect the actual archive's licence notice before redistribution. The current CNIG product describes a CC-BY-compatible licence with required source acknowledgement. Confirm the licence notice attached to the actual download before redistributing derivative geometry.

## 3. Current official file and local ingestion

The CNIG catalogue identifies the 2026 current GML archive as `LINEAS_LIMITE_GML.ZIP`, dated **10 August 2026**, 63.18 MB, and the Shapefile archive as `LINEAS_LIMITE.ZIP`, dated **28 July 2026**, 156.96 MB. CNIG's update notice records a new national boundary release on **18 August 2026**. Keep the catalogue file date and product update date as separate provenance fields; the actual downloaded archive must be checked against the selected release.

- [Current GML archive record](https://centrodedescargas.cnig.es/CentroDescargas/detalleArchivo?sec=12408588)
- [Current Shapefile archive record](https://centrodedescargas.cnig.es/CentroDescargas/detalleArchivo?sec=9000029)
- [CNIG 18 August 2026 update notice](https://centrodedescargas.cnig.es/CentroDescargas/novedades?codSerie=LILIM)

The catalogue's GML file is named `LINEAS_LIMITE_GML.ZIP`; do not assume that every layer inside it is a polygon layer. Inspect the archive's geometry types before conversion. The IGN INSPIRE WFS distinguishes `au:AdministrativeBoundary` (boundary lines) from `au:AdministrativeUnit` (administrative units). For municipality polygons, use the actual `au:AdministrativeUnit` features at the third administrative order, or a validated polygonization workflow; never relabel boundary lines as municipal polygons.

Official WFS service: [Unidades Administrativas](https://www.ign.es/wfs-inspire/unidades-administrativas?SERVICE=WFS&REQUEST=GetCapabilities). IGN documentation describes the `au:AdministrativeUnit` and `au:AdministrativeBoundary` feature types and the `nationalLevel` field. Use `ogrinfo`/DescribeFeatureType to verify the exact INE-code property in the selected service release. The live WFS is useful for a current spatial cross-check, but it is not a substitute for a locally archived and checksummed release when historical reproducibility is required. CNIG also notes that some provisional boundary segments can have uncertainty of approximately 40 m. For venue points within a conservative 50 m review buffer of a provisional segment, do not auto-assign the municipality without boundary-source review; retain candidate municipal identities and an explicit spatial-review flag. The 50 m buffer is an Illovediza QA rule, not an official accuracy guarantee.

The Illovediza ingestion implementation is:
- `src/spain-ign-ingestion.mjs` — structural geometry QA and strict IGN nationalCode to INE identity extraction;
- `scripts/fetch-spain-ign-boundaries.mjs` — paginated official IGN OGC API Features snapshot fetcher, checksummed local cache and 8,132-code acceptance gate;
- `npm run fetch:spain:ign -- --boundary-release 2026-08-18` — live official API snapshot command (only use the release date after checking the current IGN metadata);
- `scripts/ingest-spain-ign-boundaries.mjs` — local CLI and checksum manifest;
- `tests/spain-ign-ingestion.test.mjs` — test coverage;
- `npm run ingest:spain:ign` — command entry point.

First inspect the real archive's layer and property names. Never guess the five-digit municipality field:

```bash
unzip -l LINEAS_LIMITE_GML.ZIP
ogrinfo -so -al /path/to/extracted/LINEAS_LIMITE.gml
```

After selecting the actual municipal polygon layer and its verified INE code property, convert it to RFC 7946 GeoJSON. If the archive contains only line geometries, retrieve the municipality polygons from `au:AdministrativeUnit` or use a topology-validated polygonization step first; the ingestion script deliberately rejects line geometries:

```bash
ogr2ogr -f GeoJSON /tmp/spain-municipalities.geojson \
  /path/to/extracted/LINEAS_LIMITE.gml VERIFIED_MUNICIPAL_POLYGON_LAYER \
  -t_srs EPSG:4326 -lco RFC7946=YES
```

Then run structural QA against the complete 8,132-code Illovediza registry:

```bash
npm run ingest:spain:ign -- \
  --source-archive /path/to/LINEAS_LIMITE_GML.ZIP \
  --geojson /tmp/spain-municipalities.geojson \
  --code-property VERIFIED_INE_FIELD \
  --boundary-release 2026-08-18 \
  --archive-date 2026-08-10
```

The command writes the large geometry and manifest to `.cache/spain/ign/`, which is intentionally excluded from Git. It requires exactly 8,132 unique features matching the 8,132 municipal codes. The structural QA does not claim topology validity or legal finality.

## 4. Convert to a spatially queryable format

Use GDAL/OGR to inspect and convert the downloaded official source. Do not guess the layer name or field names:

```bash
ogrinfo -so -al ./LINEAS_LIMITE.gml
ogr2ogr -f PostgreSQL PG:"host=$PGHOST dbname=$PGDATABASE user=$PGUSER" \
  ./LINEAS_LIMITE.gml -nln spain_municipality_boundaries \
  -nlt PROMOTE_TO_MULTI -t_srs EPSG:4326
```

The actual input file and layer must be selected after inspecting the official archive. The output table must include an official five-digit INE code, geometry, boundary release, source CRS and provenance. Validate polygon topology and official code coverage before using it.

## 5. OSM venue crosswalk

OpenStreetMap venue coordinates are discovery data. Join each OSM point to the official municipal polygon in PostGIS and export an element-to-INE-code crosswalk. Use `scripts/build-osm-ine-crosswalk.sql` as the starting template.

A venue is not assigned by matching its name to a municipality or by using a municipality centroid. Points with zero or multiple polygon matches, invalid geometry, or proximity to a disputed/provisional boundary are exceptions for manual review.

## 6. Acceptance

- One active municipality polygon per INE municipality code for the selected release, subject to documented exceptions.
- All 8,132 active municipality reference codes match or have an explicit exception.
- Province and autonomous-community parent codes reconcile with the municipal registry.
- Geometry validity, topology, CRS, coordinate range and parent containment pass.
- Boundary release, uncertainty and source licence remain attached to every derived spatial result.
- Venue crosswalk contains only unique one-to-one accepted point-in-polygon matches.
- Every exception remains unassigned until reviewed; do not guess.

## 7. Historical reporting

A municipal report must retain the boundary release valid for its reporting period. IGN's administrative WMS supports a temporal parameter for historical boundary display from 2009 onward. Do not recompute old venue/indicator reports against a new boundary release without recording the changed spatial basis.

### Live OGC API Features ingestion

The IGN OGC API Features service exposes the administrativeunit collection as GeoJSON. Its published collection metadata identifies the storage CRS as OGC:CRS84 and exposes an items endpoint. The project fetcher follows the service's rel=next pagination links, retains the original page responses for a reproducible snapshot hash, extracts only records whose INSPIRE nationalCode resolves to one of the project's five-digit INE codes, and rejects duplicates or missing municipalities.

```bash
npm run fetch:spain:ign -- --boundary-release 2026-08-18
```

The boundary release argument is mandatory and must be confirmed against the current CNIG catalogue before execution. The resulting .cache/spain/ign/spain-municipalities.geojson and manifest.json remain local and are not automatically published to Git. Structural QA is not topology QA: run GDAL/OGR geometry validity, polygon topology, and PostGIS one-to-one venue point-in-polygon checks before the data is promoted. Source attribution: **Obra derivada de BDLJE CC-BY 4.0 ign.es**.

The official OGC API Features collection metadata: https://api-features.ign.es/collections/administrativeunit?f=json
The items endpoint: https://api-features.ign.es/collections/administrativeunit/items?f=json
