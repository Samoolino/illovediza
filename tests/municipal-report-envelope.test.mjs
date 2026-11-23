import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMunicipalReportEnvelope } from '../src/reports/municipal-report.mjs';

const municipality = {
  ineCode: '28079',
  name: 'Madrid',
  provinceName: 'Madrid',
  autonomousCommunityName: 'Comunidad de Madrid'
};

test('creates a municipal report without fabricating climate or harvest observations', () => {
  const result = buildMunicipalReportEnvelope({
    municipality,
    generatedAt: '2026-11-23T17:00:00.000Z',
    aquaDmrVStatus: 'NOT_CONNECTED',
    geometryStatus: 'NOT_LOADED',
    activeVenueCount: 0
  });
  assert.equal(result.projectId, 'ILL-FUERZA-ES');
  assert.equal(result.geography.ineCode, '28079');
  assert.equal(result.report.factors.rainfall.status, 'NOT_CONFIGURED');
  assert.equal(result.report.factors.harvestedRainwater.status, 'NOT_CONFIGURED');
  assert.equal(result.report.claims.verifiedClimateClaim, false);
  assert.equal(result.report.claims.productReleaseStatus, 'NOT_RELEASED');
  assert.equal(result.sourceStatus.aquaDmrV, 'NOT_CONNECTED');
  assert.equal(result.sourceStatus.geometry, 'NOT_LOADED');
  assert.equal(result.reportStatus, 'REFERENCE_ONLY_PENDING_EVIDENCE');
});

test('rejects invalid municipality identity and invalid report timestamps', () => {
  assert.throws(() => buildMunicipalReportEnvelope({
    municipality: { ineCode: '2807', name: 'Madrid' }
  }), /valid five-digit INE municipality identity/);
  assert.throws(() => buildMunicipalReportEnvelope({
    municipality,
    generatedAt: 'not-a-date'
  }), /generatedAt must be a valid timestamp/);
});

test('does not allow connected status to be inferred from a configured-looking base URL', () => {
  const result = buildMunicipalReportEnvelope({
    municipality,
    generatedAt: '2026-11-23T17:00:00.000Z',
    aquaDmrVStatus: 'NOT_CONNECTED',
    aquaDmrVBaseUrlConfigured: true
  });
  assert.equal(result.sourceStatus.aquaDmrV, 'NOT_CONNECTED');
  assert.equal(result.reportStatus, 'REFERENCE_ONLY_PENDING_EVIDENCE');
});


test('reports provisional OSM candidates and official source leads without promoting them to active venues', () => {
  const result = buildMunicipalReportEnvelope({
    municipality,
    generatedAt: '2026-11-23T17:00:00.000Z',
    activeVenueCount: 0,
    osmDiscoveryCandidateCount: 2,
    officialVenueLeadCount: 1,
    spatialCrosswalkStatus: 'NOT_VERIFIED_IGN_GEOMETRY_NOT_INGESTED'
  });
  assert.equal(result.sourceStatus.activeVenueCount, 0);
  assert.equal(result.sourceStatus.osmDiscoveryCandidatesProvisional, 2);
  assert.equal(result.sourceStatus.officialSourceLeadsAddressOnly, 1);
  assert.equal(result.sourceStatus.spatialCrosswalk, 'NOT_VERIFIED_IGN_GEOMETRY_NOT_INGESTED');
  assert.equal(result.reportStatus, 'REFERENCE_ONLY_PENDING_EVIDENCE');
});
