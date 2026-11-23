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

## 3. Convert to a spatially queryable format

Use GDAL/OGR to inspect and convert the downloaded official source. Do not guess the layer name or field names:

```bash
ogrinfo -so -al ./LINEAS_LIMITE.gml
ogr2ogr -f PostgreSQL PG:"host=$PGHOST dbname=$PGDATABASE user=$PGUSER" \
  ./LINEAS_LIMITE.gml -nln spain_municipality_boundaries \
  -nlt PROMOTE_TO_MULTI -t_srs EPSG:4326
```

The actual input file and layer must be selected after inspecting the official archive. The output table must include an official five-digit INE code, geometry, boundary release, source CRS and provenance. Validate polygon topology and official code coverage before using it.

## 4. OSM venue crosswalk

OpenStreetMap venue coordinates are discovery data. Join each OSM point to the official municipal polygon in PostGIS and export an element-to-INE-code crosswalk. Use `scripts/build-osm-ine-crosswalk.sql` as the starting template.

A venue is not assigned by matching its name to a municipality or by using a municipality centroid. Points with zero or multiple polygon matches, invalid geometry, or proximity to a disputed/provisional boundary are exceptions for manual review.

## 5. Acceptance

- One active municipality polygon per INE municipality code for the selected release, subject to documented exceptions.
- All 8,132 active municipality reference codes match or have an explicit exception.
- Province and autonomous-community parent codes reconcile with the municipal registry.
- Geometry validity, topology, CRS, coordinate range and parent containment pass.
- Boundary release, uncertainty and source licence remain attached to every derived spatial result.
- Venue crosswalk contains only unique one-to-one accepted point-in-polygon matches.
- Every exception remains unassigned until reviewed; do not guess.

## 6. Historical reporting

A municipal report must retain the boundary release valid for its reporting period. IGN's administrative WMS supports a temporal parameter for historical boundary display from 2009 onward. Do not recompute old venue/indicator reports against a new boundary release without recording the changed spatial basis.
