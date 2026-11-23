import { createHash } from 'node:crypto';

const nonEmpty = value => typeof value === 'string' && value.trim().length > 0;
const allowedEventTypes = new Set([
  'RAINFALL_OBSERVED',
  'HARVEST_MEASURED',
  'FIRST_FLUSH',
  'TANK_LEVEL',
  'SAMPLE_COLLECTED',
  'LAB_RESULT',
  'TREATMENT_RUN',
  'BATCH_STATE',
  'QA_DECISION',
  'GHG_ACTIVITY'
]);

function sortCanonical(value) {
  if (Array.isArray(value)) return value.map(sortCanonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, sortCanonical(value[key])]));
  }
  return value;
}

function canonicalEventBody(input) {
  return JSON.stringify(sortCanonical({
    schemaVersion: 'AQUADMRV-PROJECT-EVENT-1.0',
    projectId: 'ILL-FUERZA-ES',
    eventId: input.eventId,
    eventType: input.eventType,
    municipalityCode: input.municipalityCode,
    venueId: input.venueId,
    catchmentId: input.catchmentId,
    deviceId: input.deviceId,
    observedAt: input.observedAt,
    receivedAt: input.receivedAt,
    sequenceNumber: input.sequenceNumber,
    sourceId: input.sourceId,
    payload: input.payload
  }));
}

function validateCommon(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('event input is required');
  if (!nonEmpty(input.eventId)) throw new Error('eventId is required');
  if (!allowedEventTypes.has(input.eventType)) throw new Error('unsupported AquaDMRV eventType');
  if (!/^\d{5}$/.test(String(input.municipalityCode || ''))) throw new Error('five-digit INE municipality code is required');
  for (const field of ['venueId', 'catchmentId', 'deviceId', 'sourceId', 'signature']) {
    if (!nonEmpty(input[field])) throw new Error(`${field === 'signature' ? 'device signature' : field} is required`);
  }
  for (const field of ['observedAt', 'receivedAt']) {
    if (!nonEmpty(input[field]) || !Number.isFinite(Date.parse(input[field]))) throw new Error(`${field} must be a valid timestamp`);
  }
  if (!Number.isSafeInteger(input.sequenceNumber) || input.sequenceNumber < 1) {
    throw new Error('sequenceNumber must be a positive safe integer');
  }
  if (!input.payload || typeof input.payload !== 'object' || Array.isArray(input.payload)) {
    throw new Error('event payload must be an object');
  }
}

function validateHarvest(input) {
  if (input.eventType !== 'HARVEST_MEASURED') return;
  const p = input.payload;
  for (const field of ['meterStartLitres', 'meterEndLitres', 'harvestVolumeLitres', 'firstFlushDivertedLitres']) {
    if (!Number.isFinite(p[field]) || p[field] < 0) throw new Error(`${field} must be a non-negative measured value`);
  }
  if (p.meterEndLitres < p.meterStartLitres) throw new Error('meterEndLitres cannot be less than meterStartLitres');
  if (Math.abs((p.meterEndLitres - p.meterStartLitres) - p.harvestVolumeLitres) > 0.001) {
    throw new Error('harvestVolumeLitres must equal the meter difference');
  }
  if (!nonEmpty(p.tankId) || !nonEmpty(p.calibrationReference)) {
    throw new Error('tankId and calibrationReference are required for a measured harvest');
  }
  if (p.tamperState !== 'CLEAR') throw new Error('measured harvest requires tamperState CLEAR');
  if (p.rainfallEvidenceType === 'FORECAST' || p.volumeEvidenceType === 'MODELLED') {
    throw new Error('forecast rainfall or modelled potential must not be submitted as a measured harvest');
  }
}

export function buildIllovedizaAquaEvent(input) {
  validateCommon(input);
  validateHarvest(input);
  const payloadHash = createHash('sha256').update(canonicalEventBody(input), 'utf8').digest('hex');
  return {
    schemaVersion: 'AQUADMRV-PROJECT-EVENT-1.0',
    projectId: 'ILL-FUERZA-ES',
    eventId: input.eventId,
    eventType: input.eventType,
    municipalityCode: input.municipalityCode,
    venueId: input.venueId,
    catchmentId: input.catchmentId,
    deviceId: input.deviceId,
    observedAt: input.observedAt,
    receivedAt: input.receivedAt,
    sequenceNumber: input.sequenceNumber,
    sourceId: input.sourceId,
    payload: sortCanonical(input.payload),
    payloadHash,
    deviceSignature: input.signature,
    signatureStatus: 'PRESENT_NOT_VERIFIED_BY_ILLovediza',
    lifecycleState: 'INGESTION_CANDIDATE',
    qualityState: 'PENDING_REVIEW',
    cryptographicStatus: 'NOT_ANCHORED'
  };
}

export function validateIllovedizaAquaEvent(event) {
  if (event?.projectId !== 'ILL-FUERZA-ES') throw new Error('event projectId must be ILL-FUERZA-ES');
  if (event?.schemaVersion !== 'AQUADMRV-PROJECT-EVENT-1.0') throw new Error('unsupported AquaDMRV project event schema');
  validateCommon({
    ...event,
    signature: event.deviceSignature
  });
  const expected = createHash('sha256').update(canonicalEventBody({
    ...event,
    signature: event.deviceSignature
  }), 'utf8').digest('hex');
  if (expected !== String(event.payloadHash || '').toLowerCase()) throw new Error('payload hash mismatch');
  validateHarvest(event);
  return { valid: true, payloadHash: expected, signatureStatus: 'PRESENT_NOT_VERIFIED', cryptographicStatus: 'NOT_ANCHORED' };
}
