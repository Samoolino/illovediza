import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeOsmSportsCandidates } from '../src/osm-sports-import.mjs';

const retrievedAt = '2026-11-23T20:00:00.000Z';

test('preserves OSM padel, tennis and football stadiums as candidates before IGN municipal join', () => {
  const result = normalizeOsmSportsCandidates([
    { type: 'node', id: 1, lat: 40.4, lon: -3.7, tags: { name: 'Padel Centro', sport: 'padel', leisure: 'sports_centre' } },
    { type: 'way', id: 2, center: { lat: 40.5, lon: -3.8 }, tags: { name: 'Polideportivo Municipal', sport: 'tennis', leisure: 'sports_centre' } },
    { type: 'way', id: 3, center: { lat: 40.6, lon: -3.9 }, tags: { name: 'Municipal Stadium', sport: 'soccer', leisure: 'stadium' } }
  ], { retrievedAt });

  assert.equal(result.venues.length, 3);
  assert.deepEqual(result.summary, { candidateVenues: 3, padel: 1, footballStadiums: 1, tennis: 1, rejected: 0 });
  for (const venue of result.venues) {
    assert.equal(venue.qualification, 'CANDIDATE');
    assert.equal(venue.municipalityCode, null);
    assert.equal(venue.municipalityAssignmentStatus, 'PENDING_IGN_POINT_IN_POLYGON');
    assert.equal(venue.spatialCrosswalkStatus, 'NOT_VERIFIED');
    assert.equal(venue.source.license, 'ODbL 1.0');
  }
});

test('does not promote a stadium to municipal anchor without same-complex padel evidence', () => {
  const result = normalizeOsmSportsCandidates([
    { type: 'way', id: 4, center: { lat: 40.6, lon: -3.9 }, tags: { name: 'Stadium', sport: 'football', leisure: 'stadium' } }
  ], { retrievedAt });
  assert.equal(result.venues[0].qualificationStatus, 'FOOTBALL_STADIUM_CANDIDATE_REQUIRES_SHARED_PADEL_COMPLEX_REVIEW');
  assert.equal(result.venues[0].sharedFootballComplexStatus, 'NOT_ESTABLISHED');
});

test('rejects unnamed or unlocated OSM elements and records their reasons', () => {
  const result = normalizeOsmSportsCandidates([
    { type: 'node', id: 5, lat: 40.4, lon: -3.7, tags: { sport: 'padel' } },
    { type: 'way', id: 6, tags: { name: 'No centre', sport: 'tennis' } }
  ], { retrievedAt });
  assert.equal(result.venues.length, 0);
  assert.deepEqual(result.rejected.map(item => item.reason), ['venue_name_missing', 'invalid_coordinates']);
});
