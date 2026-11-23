import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const batch = JSON.parse(await readFile(new URL('../data/spain/sports-venues.discovery-batch-2026-11-23.json', import.meta.url), 'utf8'));

test('first discovery batch has source-backed, geotagged and INE-linked candidates only', () => {
  assert.equal(batch.projectId, 'ILL-FUERZA-ES');
  assert.equal(batch.summary.candidateCount, batch.candidates.length);
  assert.equal(batch.summary.qualifiedVenues, 0);
  for (const venue of batch.candidates) {
    assert.match(venue.municipalityCode, /^\d{5}$/);
    assert.equal(venue.municipalityAssignmentStatus, 'PROVISIONAL_NAME_TO_INE_MATCH_PENDING_IGN_SPATIAL_JOIN');
    assert.equal(venue.spatialCrosswalkStatus, 'NOT_VERIFIED_IGN_GEOMETRY_NOT_INGESTED');
    assert.ok(Number.isFinite(venue.latitude) && venue.latitude >= -90 && venue.latitude <= 90);
    assert.ok(Number.isFinite(venue.longitude) && venue.longitude >= -180 && venue.longitude <= 180);
    assert.match(venue.sourceRecordId, /^(node|way|relation)\/\d+$/);
    assert.match(venue.source.url, /^https:\/\/www\.openstreetmap\.org\//);
    assert.match(venue.source.discoveryUrl, /^https:\/\/mapcarta\.com\//);
    assert.equal(venue.source.license, 'ODbL 1.0');
    assert.equal(venue.candidateStatus.includes('CANDIDATE'), true);
    assert.equal(venue.significanceStatus === 'QUALIFIED', false);
  }
});

test('football candidates are never qualified without same-complex major padel evidence', () => {
  const football = batch.candidates.filter(venue => venue.sport === 'football');
  assert.ok(football.length > 0);
  assert.ok(football.every(venue =>
    venue.candidateStatus === 'FOOTBALL_STADIUM_CANDIDATE_REQUIRES_SHARED_PADEL_COMPLEX_REVIEW' &&
    venue.sharedFootballComplexStatus === 'NOT_ESTABLISHED'
  ));
});

test('padel candidates do not imply major-venue significance or municipal authorization', () => {
  const padel = batch.candidates.filter(venue => venue.sport === 'padel');
  assert.ok(padel.length > 0);
  assert.ok(padel.every(venue =>
    venue.significanceStatus === 'NOT_ESTABLISHED' &&
    venue.municipalManagementStatus === 'NOT_ESTABLISHED'
  ));
});
