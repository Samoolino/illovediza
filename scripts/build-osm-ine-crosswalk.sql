-- Illovediza Fuerza: source-backed OSM venue -> official INE municipality crosswalk.
-- Prerequisites:
--   osm_sports_candidates(osm_element_id text PRIMARY KEY, longitude double precision, latitude double precision)
--   spain_municipality_boundaries(ine_code text, geom geometry(MultiPolygon,4326), boundary_release text)
-- Load only the official, versioned IGN-CNIG municipal geometry extract.

CREATE EXTENSION IF NOT EXISTS postgis;

-- Keep every spatial match so ambiguous cases can be reviewed rather than guessed.
CREATE OR REPLACE VIEW illovediza_osm_municipality_matches AS
SELECT
  o.osm_element_id,
  m.ine_code,
  m.boundary_release,
  COUNT(*) OVER (PARTITION BY o.osm_element_id) AS match_count
FROM osm_sports_candidates AS o
JOIN spain_municipality_boundaries AS m
  ON ST_Covers(
    m.geom,
    ST_SetSRID(ST_MakePoint(o.longitude, o.latitude), 4326)
  )
WHERE m.ine_code ~ '^[0-9]{5}$';

-- Accepted one-to-one matches only. Anything with zero or multiple matches
-- remains unresolved and must be reviewed.
CREATE OR REPLACE VIEW illovediza_osm_municipality_crosswalk AS
SELECT osm_element_id, ine_code, boundary_release
FROM illovediza_osm_municipality_matches
WHERE match_count = 1;

-- Export JSON object keyed by OSM type/id for scripts/import-osm-sports-venues.mjs.
-- Example:
-- SELECT jsonb_object_agg(osm_element_id, ine_code)
-- FROM illovediza_osm_municipality_crosswalk;

-- Exception report:
-- SELECT o.osm_element_id, COUNT(m.ine_code) AS match_count
-- FROM osm_sports_candidates o
-- LEFT JOIN illovediza_osm_municipality_matches m USING (osm_element_id)
-- GROUP BY o.osm_element_id
-- HAVING COUNT(m.ine_code) <> 1;
