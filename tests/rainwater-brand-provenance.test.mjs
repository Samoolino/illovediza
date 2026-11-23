import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRainwaterBrandRecord } from '../src/sports/qualification.mjs';

const input = {
  projectId: 'ILL-FUERZA-ES',
  municipalityCode: '28079',
  municipalityName: 'Madrid',
  venueId: 'VENUE-MADRID-001',
  venueName: 'Polideportivo Municipal',
  batchId: 'RW-ES-2026-0001',
  harvestEventId: 'RAIN-ES-2026-001',
  harvestedAt: '2026-11-23T10:15:00Z',
  coordinates: { latitude: 40.4168, longitude: -3.7038 },
  productFormat: 'BOTTLE',
  brandName: 'Madrid · Polideportivo Municipal · RainWater',
  dmrvStatus: 'REVIEW_PENDING',
  packageId: 'ILL-EVID-2026-0001',
  evidenceRoot: 'a'.repeat(64),
  anchorStatus: 'NOT_SUBMITTED'
};

test('brand provenance binds municipality, venue, coordinates, batch, package and evidence root', () => {
  const brand = buildRainwaterBrandRecord(input);
  assert.equal(brand.branding.municipalityName, 'Madrid');
  assert.equal(brand.branding.municipalityCode, '28079');
  assert.equal(brand.branding.venueId, 'VENUE-MADRID-001');
  assert.equal(brand.provenance.batchId, 'RW-ES-2026-0001');
  assert.equal(brand.provenance.packageId, 'ILL-EVID-2026-0001');
  assert.equal(brand.provenance.evidenceRoot, 'a'.repeat(64));
  assert.deepEqual(brand.provenance.coordinates, input.coordinates);
  assert.equal(brand.claims.productReleaseStatus, 'NOT_RELEASED');
  assert.equal(brand.claims.carbonCreditIssued, false);
});

test('anchored bottle provenance requires a transaction, network and block timestamp', () => {
  assert.throws(() => buildRainwaterBrandRecord({
    ...input,
    anchorStatus: 'ANCHORED'
  }), /anchor network, transaction hash and block timestamp are required/);

  const brand = buildRainwaterBrandRecord({
    ...input,
    anchorStatus: 'ANCHORED',
    anchor: {
      networkId: 'eip155:1',
      transactionHash: '0x' + 'b'.repeat(64),
      blockTimestamp: '2026-11-23T10:20:00Z',
      blockNumber: 24000000
    }
  });
  assert.equal(brand.provenance.anchor.status, 'ANCHORED');
  assert.equal(brand.provenance.anchor.networkId, 'eip155:1');
});

test('rejects invalid INE codes and malformed evidence roots for product provenance', () => {
  assert.throws(() => buildRainwaterBrandRecord({ ...input, municipalityCode: '2807' }), /valid five-digit INE municipality code/);
  assert.throws(() => buildRainwaterBrandRecord({ ...input, evidenceRoot: 'not-a-hash' }), /64-character SHA-256 evidenceRoot/);
});

test('a cryptographic anchor never upgrades water quality or authorizes product release', () => {
  const brand = buildRainwaterBrandRecord({
    ...input,
    anchorStatus: 'ANCHORED',
    anchor: {
      networkId: 'eip155:1',
      transactionHash: '0x' + 'b'.repeat(64),
      blockTimestamp: '2026-11-23T10:20:00Z',
      blockNumber: 24000000
    }
  });
  assert.equal(brand.claims.waterQualityStatus, 'PENDING_QMS_REVIEW');
  assert.equal(brand.claims.productReleaseStatus, 'NOT_RELEASED');
  assert.equal(brand.claims.verifiedClimateClaim, false);
  assert.equal(brand.claims.carbonCreditIssued, false);
});
