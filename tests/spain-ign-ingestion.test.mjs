import test from 'node:test';
import assert from 'node:assert/strict';
import {
  inspectSpainMunicipalBoundaries,
  buildSpainBoundaryManifest
} from '../src/spain-ign-ingestion.mjs';

const square = (x = -3.7, y = 40.4) => ({
  type: 'Polygon',
  coordinates: [[[x,y],[x+0.01,y],[x+0.01,y+0.01],[x,y+0.01],[x,y]]]
});
const feature = (code, x) => ({
  type: 'Feature',
  id: code,
  properties: { INE_CODE: code, NAMEUNIT: 'Test municipality' },
  geometry: square(x)
});

test('accepts complete unique Spain municipality polygons with explicit INE property', () => {
  const result = inspectSpainMunicipalBoundaries({
    type: 'FeatureCollection',
    features: [feature('28079', -3.7), feature('08019', 2.1)]
  }, { expectedCodes: ['28079', '08019'], codeProperty: 'INE_CODE' });
  assert.equal(result.ok, true);
  assert.equal(result.featureCount, 2);
  assert.equal(result.matchedMunicipalityCount, 2);
  assert.equal(result.geometryTypeCounts.Polygon, 2);
});

test('rejects missing, duplicate and unexpected INE municipality codes', () => {
  const duplicate = inspectSpainMunicipalBoundaries({
    type: 'FeatureCollection',
    features: [feature('28079'), feature('28079', -3.6)]
  }, { expectedCodes: ['28079', '08019'], codeProperty: 'INE_CODE' });
  assert.equal(duplicate.ok, false);
  assert.ok(duplicate.errors.some(error => error.code === 'duplicate_ine_code'));
  assert.ok(duplicate.errors.some(error => error.code === 'missing_ine_codes'));

  const unexpected = inspectSpainMunicipalBoundaries({
    type: 'FeatureCollection',
    features: [feature('99999')]
  }, { expectedCodes: ['28079'], codeProperty: 'INE_CODE' });
  assert.ok(unexpected.errors.some(error => error.code === 'unexpected_ine_code'));
});

test('rejects invalid geometry, unclosed rings and out-of-range coordinates', () => {
  const invalid = feature('28079');
  invalid.geometry.coordinates[0][4] = [-3.69, 40.41];
  const result = inspectSpainMunicipalBoundaries({
    type: 'FeatureCollection',
    features: [invalid, {
      type: 'Feature', id: '08019', properties: { INE_CODE: '08019' },
      geometry: { type: 'Polygon', coordinates: [[[200, 40], [201, 40], [201, 41], [200, 41]]] }
    }]
  }, { expectedCodes: ['28079', '08019'], codeProperty: 'INE_CODE' });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(error => error.code === 'unclosed_ring'));
  assert.ok(result.errors.some(error => error.code === 'coordinate_out_of_range'));
});

test('does not guess the source code property', () => {
  const result = inspectSpainMunicipalBoundaries({
    type: 'FeatureCollection', features: [feature('28079')]
  }, { expectedCodes: ['28079'], codeProperty: 'MISSING_FIELD' });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(error => error.code === 'invalid_ine_code'));
  assert.ok(result.errors.some(error => error.code === 'missing_ine_codes'));
});

test('creates a provenance manifest with source and transformed geometry checksums', () => {
  const manifest = buildSpainBoundaryManifest({
    boundaryRelease: '2026-08-18',
    sourcePublisher: 'IGN-CNIG',
    sourceArchive: 'LINEAS_LIMITE_GML.ZIP',
    sourceSha256: 'a'.repeat(64),
    geojsonSha256: 'b'.repeat(64),
    featureCount: 8132,
    matchedMunicipalityCount: 8132,
    codeProperty: 'INE_CODE',
    sourceCrs: 'ETRS89/REGCAN95',
    targetCrs: 'EPSG:4326',
    license: 'CC-BY-4.0-compatible',
    attribution: 'Obra derivada de BDLJE CC-BY 4.0 ign.es'
  });
  assert.equal(manifest.status, 'QA_PASSED_LOCAL_NOT_PUBLISHED');
  assert.equal(manifest.featureCount, 8132);
  assert.equal(manifest.sourceSha256, 'a'.repeat(64));
});
