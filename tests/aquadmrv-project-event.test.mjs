import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildIllovedizaAquaEvent,
  validateIllovedizaAquaEvent
} from '../src/dmrv/aquadmrv-project-event.mjs';

const event = () => ({
  eventId: 'evt-harvest-0001',
  eventType: 'HARVEST_MEASURED',
  municipalityCode: '28079',
  venueId: 'VENUE-MADRID-001',
  catchmentId: 'CATCHMENT-001',
  deviceId: 'METER-001',
  observedAt: '2026-11-23T10:00:00Z',
  receivedAt: '2026-11-23T10:00:02Z',
  sequenceNumber: 101,
  payload: {
    meterStartLitres: 1200,
    meterEndLitres: 1550,
    harvestVolumeLitres: 350,
    firstFlushDivertedLitres: 40,
    tankId: 'TANK-001',
    calibrationReference: 'CAL-METER-001-2026',
    tamperState: 'CLEAR'
  },
  signature: 'base64-device-signature',
  sourceId: 'device:METER-001'
});

test('builds canonical Illovediza project event without claiming it is already verified', () => {
  const result = buildIllovedizaAquaEvent(event());
  assert.equal(result.projectId, 'ILL-FUERZA-ES');
  assert.equal(result.eventId, 'evt-harvest-0001');
  assert.match(result.payloadHash, /^[a-f0-9]{64}$/);
  assert.equal(result.lifecycleState, 'INGESTION_CANDIDATE');
  assert.equal(result.cryptographicStatus, 'NOT_ANCHORED');
  assert.equal(result.qualityState, 'PENDING_REVIEW');
});

test('rejects harvest event when measured meter volume does not reconcile', () => {
  const input = event();
  input.payload.harvestVolumeLitres = 351;
  assert.throws(() => buildIllovedizaAquaEvent(input), /meter difference/);
});

test('does not treat forecast rainfall or calculated potential as physical harvest', () => {
  const input = event();
  input.payload.rainfallEvidenceType = 'FORECAST';
  assert.throws(() => buildIllovedizaAquaEvent(input), /must not be submitted as a measured harvest/);
});

test('requires a valid municipality, site, device, signature and monotonic sequence', () => {
  assert.throws(() => buildIllovedizaAquaEvent({ ...event(), municipalityCode: '2807' }), /five-digit INE/);
  assert.throws(() => buildIllovedizaAquaEvent({ ...event(), signature: '' }), /device signature/);
  assert.throws(() => buildIllovedizaAquaEvent({ ...event(), sequenceNumber: 0 }), /sequenceNumber/);
});

test('detects payload tampering when validating a previously built event', () => {
  const built = buildIllovedizaAquaEvent(event());
  const tampered = { ...built, payload: { ...built.payload, harvestVolumeLitres: 351 } };
  assert.throws(() => validateIllovedizaAquaEvent(tampered), /payload hash mismatch/);
});
