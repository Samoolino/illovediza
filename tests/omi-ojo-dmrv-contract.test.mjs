import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canonicalEvidencePackage,
  evidenceRoot,
  verifyEvidenceRoot,
  buildIllovedizaEvidencePackage
} from '../src/dmrv/omi-ojo-contract.mjs';

const omiVector = () => canonicalEvidencePackage({
  evidenceId: 'EVID-001',
  projectId: 'OMI-OJO',
  evidenceClass: 'OBSERVED',
  sourceRefs: ['rain-provider'],
  observationRefs: ['OBS-2', 'OBS-1'],
  eventSiteRefs: ['SITE-01'],
  methodologyRef: 'RAIN-1.0',
  qualityState: 'REPORTABLE',
  createdAt: '2026-09-22T10:00:00+00:00',
  observationWindow: { start: '2026-09-22T09:00:00+00:00', end: '2026-09-22T10:00:00+00:00' },
  geographyRef: 'LAGOS-SITE-01',
  contentHashes: ['bb', 'aa']
});

test('matches the OMI-OJO Python canonical evidence-root test vector', () => {
  const packageRecord = omiVector();
  assert.deepEqual(packageRecord.observation_refs, ['OBS-1', 'OBS-2']);
  assert.deepEqual(packageRecord.content_hashes, ['aa', 'bb']);
  assert.equal(evidenceRoot(packageRecord), 'cf705408f5e5f0695aec0c5d65ceb03237e16fcea7cf523f4b024811b64ea0d2');
});

test('canonical evidence root is order-independent for reference arrays and object keys', () => {
  const a = omiVector();
  const b = canonicalEvidencePackage({
    evidenceId: 'EVID-001',
    projectId: 'OMI-OJO',
    evidenceClass: 'OBSERVED',
    sourceRefs: ['rain-provider'],
    observationRefs: ['OBS-1', 'OBS-2'],
    eventSiteRefs: ['SITE-01'],
    methodologyRef: 'RAIN-1.0',
    qualityState: 'REPORTABLE',
    createdAt: '2026-09-22T10:00:00+00:00',
    observationWindow: { end: '2026-09-22T10:00:00+00:00', start: '2026-09-22T09:00:00+00:00' },
    geographyRef: 'LAGOS-SITE-01',
    contentHashes: ['aa', 'bb']
  });
  assert.equal(evidenceRoot(a), evidenceRoot(b));
});

test('detects tampering after the evidence package root is calculated', () => {
  const packageRecord = omiVector();
  const root = evidenceRoot(packageRecord);
  assert.equal(verifyEvidenceRoot(packageRecord, root), 'MATCHED');
  packageRecord.quality_state = 'VERIFIED';
  assert.equal(verifyEvidenceRoot(packageRecord, root), 'MISMATCHED');
});

test('builds Illovediza packages with the project namespace and municipal venue references', () => {
  const result = buildIllovedizaEvidencePackage({
    evidenceId: 'ILL-ES-2026-0001',
    evidenceClass: 'OBSERVED',
    sourceRefs: ['meter:PAD-01', 'aemet:station-123'],
    observationRefs: ['OBS-RAIN-01', 'OBS-HARVEST-01'],
    eventSiteRefs: ['VENUE-MADRID-001', 'RAIN-EVENT-001'],
    methodologyRef: 'ILL-RAIN-HARVEST-1.0',
    qualityState: 'REPORTABLE',
    createdAt: '2026-11-23T09:00:00+00:00',
    observationWindow: { start: '2026-11-23T08:00:00+00:00', end: '2026-11-23T09:00:00+00:00' },
    geographyRef: 'ES-MUNI-28079',
    contentHashes: ['sha256:meter-record', 'sha256:rain-record']
  });
  assert.equal(result.package.project_id, 'ILL-FUERZA-ES');
  assert.equal(result.package.schema_version, 'BE-EVIDENCE-1.0');
  assert.match(result.evidenceRoot, /^[a-f0-9]{64}$/);
  assert.equal(result.anchorStatus, 'NOT_SUBMITTED');
});

test('requires a source reference and municipality geography reference', () => {
  assert.throws(() => canonicalEvidencePackage({
    evidenceId: 'E-1', projectId: 'ILL-FUERZA-ES', evidenceClass: 'OBSERVED',
    sourceRefs: [], observationRefs: [], eventSiteRefs: [], methodologyRef: 'M-1',
    qualityState: 'REPORTABLE', createdAt: '2026-11-23T09:00:00Z',
    observationWindow: null, geographyRef: 'ES-MUNI-28079', contentHashes: []
  }), /at least one source reference is required/);
});
