import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeOsmSportsVenues } from '../src/osm-sports-import.mjs';

const elements = [
  { type: 'node', id: 101, lat: 40.4168, lon: -3.7038, tags: { name: 'Municipal Padel Centre', sport: 'padel', leisure: 'sports_centre' } },
  { type: 'way', id: 202, center: { lat: 40.4178, lon: -3.7048 }, tags: { name: 'Municipal Stadium', sport: 'soccer', leisure: 'stadium' } },
  { type: 'relation', id: 303, center: { lat: 41.3874, lon: 2.1686 }, tags: { name: 'Municipal Tennis Courts', sport: 'tennis', leisure: 'sports_centre' } },
  { type: 'node', id: 404, lat: 40.4, lon: -3.7, tags: { name: 'Swimming Pool', sport: 'swimming', leisure: 'sports_centre' } }
];

test('imports only padel, football stadium and tennis facility candidates', () => {
  const result = normalizeOsmSportsVenues(elements, {
    municipalityCodeByElementId: { 'node/101': '28079', 'way/202': '28079', 'relation/303': '08019' },
    retrievedAt: '2026-11-23T09:00:00Z'
  });
  assert.equal(result.venues.length, 3);
  assert.deepEqual(result.venues.map(v => v.sport), ['padel', 'football', 'tennis']);
});

test('does not infer major padel, municipal football anchor or significant tennis status from OSM tags', () => {
  const result = normalizeOsmSportsVenues(elements.slice(0, 3), {
    municipalityCodeByElementId: { 'node/101': '28079', 'way/202': '28079', 'relation/303': '08019' },
    retrievedAt: '2026-11-23T09:00:00Z'
  });
  assert.ok(result.venues.every(v => v.qualification === 'CANDIDATE'));
  assert.ok(result.venues.every(v => !v.significanceEvidence));
  assert.ok(result.venues.every(v => v.qualificationStatus === 'CANDIDATE_REQUIRES_MUNICIPAL_REVIEW'));
});

test('requires an official INE municipality crosswalk and does not guess from venue names', () => {
  const result = normalizeOsmSportsVenues(elements.slice(0, 1), { retrievedAt: '2026-11-23T09:00:00Z' });
  assert.equal(result.venues.length, 0);
  assert.equal(result.rejected[0].reason, 'municipality_code_unresolved');
});

test('rejects duplicate OSM elements and invalid or missing coordinates', () => {
  const result = normalizeOsmSportsVenues([
    elements[0],
    elements[0],
    { type: 'node', id: 505, lat: 200, lon: -3, tags: { name: 'Bad Padel', sport: 'padel' } }
  ], {
    municipalityCodeByElementId: { 'node/101': '28079', 'node/505': '28079' },
    retrievedAt: '2026-11-23T09:00:00Z'
  });
  assert.equal(result.venues.length, 1);
  assert.ok(result.rejected.some(item => item.reason === 'duplicate_osm_element'));
  assert.ok(result.rejected.some(item => item.reason === 'invalid_coordinates'));
});

test('preserves OpenStreetMap attribution, source element and retrieval time', () => {
  const result = normalizeOsmSportsVenues(elements.slice(0, 1), {
    municipalityCodeByElementId: { 'node/101': '28079' },
    retrievedAt: '2026-11-23T09:00:00Z'
  });
  const venue = result.venues[0];
  assert.equal(venue.source.name, 'OpenStreetMap');
  assert.equal(venue.source.license, 'ODbL 1.0');
  assert.equal(venue.sourceRecordId, 'node/101');
  assert.equal(venue.source.retrievedAt, '2026-11-23T09:00:00Z');
});
