import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMunicipalSportsRegistry,
  validateSportsVenue,
  buildRainwaterBrandRecord
} from '../src/sports/qualification.mjs';

const municipalities = [
  { ineCode: '28079', name: 'Madrid', provinceCode: '28', autonomousCommunityCode: '13' },
  { ineCode: '08019', name: 'Barcelona', provinceCode: '08', autonomousCommunityCode: '09' }
];

const majorPadel = {
  id: 'venue-padel-1',
  municipalityCode: '28079',
  name: 'Municipal Padel Centre',
  sport: 'padel',
  venueType: 'polideportivo',
  latitude: 40.4168,
  longitude: -3.7038,
  qualification: 'MAJOR_PADEL',
  significanceEvidence: 'municipal-sports-report-2026',
  source: { name: 'Ayuntamiento venue directory', url: 'https://example.org/venues', retrievedAt: '2026-11-20T10:00:00Z', license: 'test fixture' }
};

const football = {
  id: 'venue-football-1',
  municipalityCode: '28079',
  name: 'Municipal Football Stadium',
  sport: 'football',
  venueType: 'stadium',
  latitude: 40.4178,
  longitude: -3.7048,
  qualification: 'FOOTBALL_STADIUM',
  sharedSportsComplexId: 'complex-1',
  coLocatedMajorPadelEvidence: 'municipal-complex-plan-2026',
  source: { name: 'Ayuntamiento venue directory', url: 'https://example.org/stadium', retrievedAt: '2026-11-20T10:00:00Z', license: 'test fixture' }
};

const tennis = {
  id: 'venue-tennis-1',
  municipalityCode: '08019',
  name: 'Municipal Polideportivo Tennis Centre',
  sport: 'tennis',
  venueType: 'polideportivo',
  latitude: 41.3874,
  longitude: 2.1686,
  qualification: 'SIGNIFICANT_TENNIS_POLIDEPORTIVO',
  municipalOperator: true,
  municipalManagementEvidence: 'ayuntamiento-management-report-2026',
  sustainabilitySignificanceEvidence: 'municipal-sustainability-plan-2026',
  source: { name: 'Ayuntamiento facility report', url: 'https://example.org/tennis', retrievedAt: '2026-11-20T10:00:00Z', license: 'test fixture' }
};

test('represents every supplied municipality even when it has no qualified sports venue', () => {
  const result = buildMunicipalSportsRegistry(municipalities, []);
  assert.equal(result.municipalities.length, 2);
  assert.equal(result.summary.municipalitiesRepresented, 2);
  assert.equal(result.municipalities[1].venues.length, 0);
  assert.equal(result.municipalities[1].sportsCoverage.padel, 'NOT_ASSESSED');
});

test('accepts major padel and a football stadium co-located with that municipal padel complex', () => {
  const result = buildMunicipalSportsRegistry(municipalities, [
    { ...majorPadel, sharedSportsComplexId: 'complex-1' },
    football
  ]);
  assert.equal(result.summary.qualifiedPadelVenues, 1);
  assert.equal(result.summary.qualifiedFootballStadiums, 1);
  assert.equal(result.municipalities[0].sportsCoverage.football, 'QUALIFIED_VENUE_IDENTIFIED');
});

test('does not qualify a football stadium without a major padel co-location relationship', () => {
  const result = buildMunicipalSportsRegistry(municipalities, [
    majorPadel,
    { ...football, sharedSportsComplexId: 'different-complex', coLocatedMajorPadelEvidence: '' }
  ]);
  assert.equal(result.summary.qualifiedFootballStadiums, 0);
  assert.equal(result.municipalities[0].sportsCoverage.football, 'CANDIDATE_NOT_QUALIFIED');
});

test('only qualifies tennis in an evidenced Ayuntamientos-managed significant polideportivo', () => {
  const qualified = buildMunicipalSportsRegistry(municipalities, [tennis]);
  assert.equal(qualified.summary.qualifiedTennisVenues, 1);

  const unqualified = buildMunicipalSportsRegistry(municipalities, [
    { ...tennis, municipalOperator: false, municipalManagementEvidence: '' }
  ]);
  assert.equal(unqualified.summary.qualifiedTennisVenues, 0);
});

test('rejects venues without valid geotags, source provenance or municipality linkage', () => {
  assert.ok(validateSportsVenue({ ...majorPadel, latitude: 200 }).errors.includes('invalid_coordinates'));
  assert.ok(validateSportsVenue({ ...majorPadel, source: null }).errors.includes('missing_source_provenance'));
  assert.ok(buildMunicipalSportsRegistry(municipalities, [{ ...majorPadel, municipalityCode: '99999' }]).errors.some(error => error.code === 'unknown_municipality'));
});

test('creates a municipal RainWater brand record only when the venue and batch lineage are present', () => {
  const brand = buildRainwaterBrandRecord({
    projectId: 'ILL-FUERZA-ES',
    municipalityCode: '28079',
    municipalityName: 'Madrid',
    venueId: 'venue-padel-1',
    venueName: 'Municipal Padel Centre',
    batchId: 'RW-2026-0001',
    packageId: 'ILL-EVID-2026-0001',
    evidenceRoot: 'a'.repeat(64),
    harvestEventId: 'RAIN-2026-001',
    harvestedAt: '2026-11-20T12:00:00Z',
    coordinates: { latitude: 40.4168, longitude: -3.7038 },
    productFormat: 'BOTTLE',
    brandName: 'Madrid Municipal Padel Centre RainWater',
    dmrvStatus: 'REVIEW_PENDING'
  });
  assert.equal(brand.branding.municipalityCode, '28079');
  assert.equal(brand.provenance.batchId, 'RW-2026-0001');
  assert.equal(brand.claims.carbonCreditIssued, false);
});

test('refuses to create a product brand record without a batch identity or harvest timestamp', () => {
  assert.throws(() => buildRainwaterBrandRecord({
    projectId: 'ILL-FUERZA-ES',
    municipalityCode: '28079',
    municipalityName: 'Madrid',
    venueId: 'venue-padel-1',
    venueName: 'Municipal Padel Centre',
    batchId: '',
    packageId: 'ILL-EVID-2026-0001',
    evidenceRoot: 'a'.repeat(64),
    harvestEventId: 'RAIN-2026-001',
    harvestedAt: '',
    coordinates: { latitude: 40.4168, longitude: -3.7038 },
    productFormat: 'CAN',
    brandName: 'Test',
    dmrvStatus: 'REVIEW_PENDING'
  }), /batchId and harvestedAt are required/);
});

test('keeps a multi-sport municipal complex as one venue identity with multiple qualified sport roles', () => {
  const complex = {
    ...majorPadel,
    venueType: 'stadium',
    sport: 'padel',
    sports: ['padel', 'football'],
    qualification: 'MAJOR_PADEL',
    qualifications: ['MAJOR_PADEL', 'FOOTBALL_STADIUM'],
    sharedSportsComplexId: 'complex-1',
    coLocatedMajorPadelEvidence: 'municipal-complex-plan-2026'
  };
  const result = buildMunicipalSportsRegistry(municipalities, [complex]);
  assert.equal(result.municipalities[0].venues.length, 1);
  assert.ok(result.municipalities[0].venues[0].qualificationStatuses.includes('QUALIFIED_MAJOR_PADEL'));
  assert.ok(result.municipalities[0].venues[0].qualificationStatuses.includes('QUALIFIED_FOOTBALL_STADIUM'));
  assert.equal(result.summary.qualifiedPadelVenues, 1);
  assert.equal(result.summary.qualifiedFootballStadiums, 1);
});

test('supports a single multi-sport Polideportivo identity with padel and tennis roles', () => {
  const venue = {
    ...majorPadel,
    venueType: 'polideportivo',
    sport: 'padel',
    sports: ['padel', 'tennis'],
    qualifications: ['MAJOR_PADEL', 'SIGNIFICANT_TENNIS_POLIDEPORTIVO'],
    municipalOperator: true,
    municipalManagementEvidence: 'ayuntamiento-management-report',
    sustainabilitySignificanceEvidence: 'municipal-sustainability-plan'
  };
  const result = buildMunicipalSportsRegistry(municipalities, [venue]);
  assert.equal(result.municipalities[0].venues.length, 1);
  assert.ok(result.municipalities[0].venues[0].qualificationStatuses.includes('QUALIFIED_MAJOR_PADEL'));
  assert.ok(result.municipalities[0].venues[0].qualificationStatuses.includes('QUALIFIED_MUNICIPAL_TENNIS'));
  assert.equal(result.summary.qualifiedPadelVenues, 1);
  assert.equal(result.summary.qualifiedTennisVenues, 1);
});
