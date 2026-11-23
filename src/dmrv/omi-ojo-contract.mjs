import { createHash } from 'node:crypto';

const asString = value => typeof value === 'string' && value.trim().length > 0;
const sorted = values => [...values].sort();

function sortObject(value) {
  if (Array.isArray(value)) return value.map(sortObject);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, sortObject(value[key])]));
  }
  return value;
}

export function canonicalEvidencePackage(input) {
  if (!input || typeof input !== 'object') throw new Error('evidence package input is required');
  if (!asString(input.evidenceId) || !asString(input.projectId)) {
    throw new Error('evidenceId and projectId are required');
  }
  if (!Array.isArray(input.sourceRefs) || input.sourceRefs.length === 0 ||
      input.sourceRefs.some(value => !asString(value))) {
    throw new Error('at least one source reference is required');
  }
  if (!Array.isArray(input.observationRefs) || !Array.isArray(input.eventSiteRefs) ||
      !Array.isArray(input.contentHashes)) {
    throw new Error('observationRefs, eventSiteRefs and contentHashes must be arrays');
  }
  if (!asString(input.evidenceClass) || !asString(input.methodologyRef) ||
      !asString(input.qualityState) || !asString(input.createdAt) ||
      !Number.isFinite(Date.parse(input.createdAt)) || !asString(input.geographyRef)) {
    throw new Error('evidence class, methodology, quality, timestamp and geography are required');
  }

  const packageRecord = {
    content_hashes: sorted(input.contentHashes),
    created_at: input.createdAt,
    evidence_class: input.evidenceClass,
    evidence_id: input.evidenceId,
    event_site_refs: sorted(input.eventSiteRefs),
    geography_ref: input.geographyRef,
    methodology_ref: input.methodologyRef,
    observation_refs: sorted(input.observationRefs),
    observation_window: input.observationWindow || {},
    parent_evidence: sorted(input.parentEvidence || []),
    project_id: input.projectId,
    quality_state: input.qualityState,
    schema_version: input.schemaVersion || 'BE-EVIDENCE-1.0',
    source_refs: sorted(input.sourceRefs),
    status: input.status || 'REPORTABLE'
  };
  return sortObject(packageRecord);
}

export function canonicalEvidenceJson(packageRecord) {
  return JSON.stringify(sortObject(packageRecord));
}

export function evidenceRoot(packageRecord) {
  return createHash('sha256').update(canonicalEvidenceJson(packageRecord), 'utf8').digest('hex');
}

export function verifyEvidenceRoot(packageRecord, anchoredRoot) {
  if (!anchoredRoot) return 'NOT_FOUND';
  return evidenceRoot(packageRecord) === String(anchoredRoot).toLowerCase()
    ? 'MATCHED'
    : 'MISMATCHED';
}

export function buildIllovedizaEvidencePackage(input) {
  const packageRecord = canonicalEvidencePackage({
    ...input,
    projectId: 'ILL-FUERZA-ES',
    schemaVersion: 'BE-EVIDENCE-1.0'
  });
  return {
    package: packageRecord,
    evidenceRoot: evidenceRoot(packageRecord),
    anchorStatus: 'NOT_SUBMITTED',
    integration: {
      contractOwner: 'OMI-OJO',
      compatibility: 'OMI_OJO_CANONICAL_EVIDENCE_PACKAGE',
      submissionStatus: 'NOT_CONNECTED'
    }
  };
}
