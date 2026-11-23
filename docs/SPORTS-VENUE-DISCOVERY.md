# Spain sports venue discovery and qualification

## Objective

Create geotagged sports-venue loci for the Illovediza Spain network while preserving the full 8,132-municipality administrative reporting grid. The municipality registry is complete as a reference layer; sports venues are discovered, crosswalked, assessed and qualified separately.

Primary anchors:
- Padel: major courts, dedicated centres and municipal Polideportivos with evidence of significance.
- Football: stadiums/grounds documented as part of or co-located within the same municipal sports complex as a major padel anchor.
- Tennis: selective significant/sustainability-relevant tennis venues in Ayuntamientos-managed Polideportivos.

## Source discovery

OpenStreetMap is an open discovery source, not a municipal authority or partnership register. Use Overpass exports in manageable regional/provincial batches rather than one unbounded national request. The reusable national discovery query is stored at `data/spain/venue-discovery/spain-sports-overpass.ql`; execute it in manageable regional/provincial partitions to avoid timeout and endpoint load. The query is a starting filter, not a complete national inventory. Example query:

```overpass
[out:json][timeout:180];
area["ISO3166-1"="ES"][admin_level=2]->.spain;
(
  nwr["sport"~"padel"](area.spain);
  nwr["leisure"="stadium"]["sport"~"soccer|football"](area.spain);
  nwr["leisure"="sports_centre"]["sport"="tennis"](area.spain);
);
out center tags;
```

This is a candidate-discovery query. It will not return every sports facility and OSM tags may be missing, stale, duplicated or inaccurate. Cross-check official Ayuntamiento facility directories, municipal sports plans, competition sources, operators and relevant sports organizations.

## Official municipality crosswalk

Every imported venue must be bound to a five-digit official INE municipality code. The import tool accepts a crosswalk JSON object keyed by OSM element identity, e.g.:

```json
{
  "node/123456": "28079",
  "way/234567": "08019"
}
```

Generate this crosswalk by spatially joining the venue point to the dated official IGN/CNIG municipal polygon release in PostGIS. Preserve boundary release, CRS, geometry validity and the join method. Resolve boundary overlaps, provisional limits and points on boundaries for human review. Do not assign a municipality by matching the venue name or by nearest municipal centroid.

## Import

1. Export Overpass JSON to a local file.
2. Build the OSM-element-to-INE-code crosswalk from official geometry.
3. Run:

```bash
npm run import:sports:osm -- --input ./imports/spain-overpass.json --crosswalk ./imports/osm-ine-crosswalk.json --output ./data/spain/sports-venues.candidates.json
```

4. Review the candidate output and rejected-record file.
5. Enrich candidates with official facility name, significance evidence, municipal management, shared-complex identity, permissions and operator confirmation.
6. Only after review, publish accepted records to `data/spain/sports-venues.json`.

The importer preserves OSM element identity, source URL, retrieval timestamp, coordinates, ODbL licence and attribution. It never promotes an OSM candidate to a qualified venue.

## Qualification policy

- **Major padel:** requires significance evidence, not just `sport=padel`.
- **Football stadium:** requires stadium identity, football sport, shared sports-complex ID and evidence of co-location with the municipality's major padel anchor.
- **Selective tennis:** requires Polideportivo venue type, Ayuntamientos management evidence and sustainability/significance evidence.
- **Multi-sport venues:** one canonical venue ID, multiple sport affiliations and separate qualification roles. Do not duplicate a physical facility to inflate venue counts.

## Data and licensing

Retain OpenStreetMap attribution and assess ODbL obligations before redistributing derived venue databases. Official IGN/CNIG boundaries require the applicable source acknowledgement and licence conditions. INE municipal codes are the administrative identity source. Each source record retains its own licence and provenance; combining datasets does not erase upstream obligations.

## Status model

`DISCOVERED → SOURCE_CHECKED → SIGNIFICANCE_REVIEW → MUNICIPAL_CROSSWALKED → OPERATOR_CONFIRMED → PERMISSION_PENDING → AUTHORIZED → COMMISSIONED`.

Only source-checked/crosswalked records should appear as candidate map pins. Only qualified records count toward the programme's major padel, combined football-stadium or selective tennis metrics. Only authorized and commissioned nodes can be represented as physical measurement/harvest installations.


## First discovery batch — 23 November 2026

The initial review seed is stored at `data/spain/sports-venues.discovery-batch-2026-11-23.json`.

- 2 padel candidates: Zaragoza and Huércal-Overa.
- 5 football stadium candidates: Sevilla, Bilbao, A Coruña, León and Fuenlabrada.
- 0 tennis candidates in this first seed.
- 0 qualified venues.
- 0 confirmed same-complex major-padel/football pairs.

These seven records were identified from OSM-backed Mapcarta discovery pages exposing OSM element IDs and coordinates. They are a **secondary discovery seed**, not a completed primary OSM API/Overpass extraction. The source element, tags, geometry and current status must be re-fetched from OpenStreetMap before production ingestion. Municipality codes are linked to the INE municipal reference; the official IGN polygon crosswalk is still pending.

The two padel entries are not yet proven to be major venues. The five football stadiums are not eligible municipal anchors unless the same sports complex also contains a separately qualified major padel anchor. Municipal ownership/management, venue operator, court count, significance, permission and harvesting suitability remain unverified. They must not be copied into `data/spain/sports-venues.json` as active or qualified venues.

Candidate source pages:
- Zaragoza padel: https://mapcarta.com/es/N5615325321
- Huércal-Overa padel: https://mapcarta.com/es/W1145637290
- Estadio Benito Villamarín: https://mapcarta.com/W28355046
- San Mamés: https://mapcarta.com/W59171758
- Estadio Municipal de Riazor: https://mapcarta.com/W34237293
- Estadio Reino de León: https://mapcarta.com/32915216
- Estadio Fernando Torres: https://mapcarta.com/W198982440

The municipality code references are checked against the INE municipal-code source or its official municipal statistical tables. The batch has automated tests that enforce provenance, valid geotags, candidate-only status and the same-complex football qualification rule.
