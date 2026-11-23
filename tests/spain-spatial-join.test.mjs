import test from 'node:test';
import assert from 'node:assert/strict';
import { assignVenuesToIgnMunicipalities } from '../src/spain-spatial-join.mjs';

const polygon = (code, coordinates, id = code) => ({
  type: 'Feature',
  id,
  properties: { ineCode: code },
  geometry: { type: 'Polygon', coordinates }
});

const square = (x1, y1, x2, y2) => [[
  [x1,y1],[x2,y1],[x2,y2],[x1,y2],[x1,y1]
]];

test('assigns an OSM venue to exactly one official IGN municipality polygon', () => {
  const result = assignVenuesToIgnMunicipalities(
    [{ id: 'OSM-WAY-1', latitude: -3.5, longitude: 40.5, municipalityCode: null }],
    { type: 'FeatureCollection', features: [polygon('28079', square(-4,40,-3,41))] }
  );
  assert.equal(result.venues[0].municipalityCode, '28079');
  assert.equal(result.venues[0].spatialCrosswalkStatus, 'VERIFIED_IGN_POINT_IN_POLYGON');
  assert.equal(result.summary.verified, 1);
});

test('preserves a provisional name match but never uses it when the polygon disagrees', () => {
  const result = assignVenuesToIgnMunicipalities(
    [{ id: 'OSM-WAY-2', latitude: -3.5, longitude: 40.5, municipalityCode: '08019' }],
    { type: 'FeatureCollection', features: [polygon('28079', square(-4,40,-3,41))] }
  );
  assert.equal(result.venues[0].municipalityCode, '28079');
  assert.equal(result.venues[0].provisionalMunicipalityCode, '08019');
  assert.equal(result.venues[0].provisionalMatchStatus, 'CONFLICTS_WITH_IGN_SPATIAL_MATCH');
});

test('does not assign points on a boundary or in overlapping polygons', () => {
  const boundary = assignVenuesToIgnMunicipalities(
    [{ id: 'OSM-NODE-3', latitude: -4, longitude: 40.5 }],
    { type: 'FeatureCollection', features: [polygon('28079', square(-4,40,-3,41))] }
  );
  assert.equal(boundary.venues[0].municipalityCode, null);
  assert.equal(boundary.venues[0].spatialCrosswalkStatus, 'AMBIGUOUS_BOUNDARY_OR_OVERLAP');

  const overlap = assignVenuesToIgnMunicipalities(
    [{ id: 'OSM-NODE-4', latitude: -3.5, longitude: 40.5 }],
    { type: 'FeatureCollection', features: [
      polygon('28079', square(-4,40,-3,41)),
      polygon('08019', square(-3.8,40.2,-2.8,41.2))
    ] }
  );
  assert.equal(overlap.venues[0].municipalityCode, null);
  assert.equal(overlap.venues[0].spatialCrosswalkStatus, 'AMBIGUOUS_BOUNDARY_OR_OVERLAP');
});

test('respects polygon holes and handles MultiPolygon geometry', () => {
  const withHole = {
    type: 'Feature',
    id: '28079',
    properties: { ineCode: '28079' },
    geometry: { type: 'Polygon', coordinates: [
      square(-4,40,-3,41)[0],
      square(-3.6,40.4,-3.4,40.6)[0]
    ] }
  };
  const holeResult = assignVenuesToIgnMunicipalities(
    [{ id: 'OSM-NODE-5', latitude: -3.5, longitude: 40.5 }],
    { type: 'FeatureCollection', features: [withHole] }
  );
  assert.equal(holeResult.venues[0].spatialCrosswalkStatus, 'NO_IGN_POLYGON_MATCH');

  const multi = {
    type: 'Feature',
    id: '08019',
    properties: { ineCode: '08019' },
    geometry: { type: 'MultiPolygon', coordinates: [square(-4,40,-3,41), square(1,40,2,41)] }
  };
  const multiResult = assignVenuesToIgnMunicipalities(
    [{ id: 'OSM-NODE-6', latitude: 1.5, longitude: 40.5 }],
    { type: 'FeatureCollection', features: [multi] }
  );
  assert.equal(multiResult.venues[0].municipalityCode, '08019');
});

test('rejects invalid input and preserves unlocated candidates without guessing', () => {
  assert.throws(() => assignVenuesToIgnMunicipalities([], { type: 'FeatureCollection', features: [] }), /at least one/);
  const result = assignVenuesToIgnMunicipalities(
    [{ id: 'OSM-WAY-7', latitude: null, longitude: null, municipalityCode: '28079' }],
    { type: 'FeatureCollection', features: [polygon('28079', square(-4,40,-3,41))] }
  );
  assert.equal(result.venues[0].municipalityCode, null);
  assert.equal(result.venues[0].provisionalMunicipalityCode, '28079');
  assert.equal(result.venues[0].spatialCrosswalkStatus, 'INVALID_COORDINATES');
});
