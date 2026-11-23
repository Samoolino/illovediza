import { buildMunicipalClimateProductReport } from '../dmrv/municipal-climate-report.mjs';

const nonEmpty = value => typeof value === 'string' && value.trim().length > 0;

export function buildMunicipalReportEnvelope({
  municipality,
  generatedAt = new Date().toISOString(),
  aquaDmrVStatus = 'NOT_CONNECTED',
  geometryStatus = 'NOT_LOADED',
  activeVenueCount = 0,
  osmDiscoveryCandidateCount = 0,
  officialVenueLeadCount = 0,
  spatialCrosswalkStatus = 'NOT_VERIFIED_IGN_GEOMETRY_NOT_INGESTED'
} = {}) {
  if (!municipality || !/^\d{5}$/.test(String(municipality.ineCode || '')) || !nonEmpty(municipality.name)) {
    throw new Error('A valid five-digit INE municipality identity is required');
  }
  if (!nonEmpty(generatedAt) || !Number.isFinite(Date.parse(generatedAt))) {
    throw new Error('generatedAt must be a valid timestamp');
  }
  if (!['NOT_CONNECTED', 'CONNECTED', 'DEGRADED', 'ERROR'].includes(aquaDmrVStatus)) {
    throw new Error('invalid AquaDMRV connection state');
  }
  for (const [field, value] of Object.entries({ activeVenueCount, osmDiscoveryCandidateCount, officialVenueLeadCount })) {
    if (!Number.isSafeInteger(value) || value < 0) throw new Error(`${field} must be a non-negative integer`);
  }
  if (!['NOT_LOADED', 'NOT_VERIFIED_IGN_GEOMETRY_NOT_INGESTED', 'VERIFIED_IGN_POINT_IN_POLYGON'].includes(spatialCrosswalkStatus)) {
    throw new Error('invalid spatialCrosswalkStatus');
  }

  const report = buildMunicipalClimateProductReport({
    municipality,
    generatedAt,
    climateRecords: [],
    harvestRecords: [],
    impactRecords: [],
    socialRecords: [],
    governanceRecords: []
  });

  return {
    schemaVersion: '1.0.0',
    projectId: 'ILL-FUERZA-ES',
    reportId: `ILL-ES-MUNI-${municipality.ineCode}-${generatedAt.replace(/[^0-9]/g, '').slice(0, 14)}`,
    reportType: 'municipal_climate_product_evidence',
    reportStatus: 'REFERENCE_ONLY_PENDING_EVIDENCE',
    generatedAt,
    geography: {
      ineCode: municipality.ineCode,
      municipalityId: municipality.municipalityId || `ES-MUNI-${municipality.ineCode}`,
      name: municipality.name,
      province: municipality.provinceName || null,
      autonomousCommunity: municipality.autonomousCommunityName || null
    },
    sourceStatus: {
      aquaDmrV: aquaDmrVStatus,
      geometry: geometryStatus,
      activeVenueCount,
      osmDiscoveryCandidatesProvisional: osmDiscoveryCandidateCount,
      officialSourceLeadsAddressOnly: officialVenueLeadCount,
      spatialCrosswalk: spatialCrosswalkStatus,
      physicalHarvestEvidence: 'NOT_CONNECTED',
      laboratoryAndQms: 'NOT_CONNECTED',
      cryptographicAnchor: 'NOT_CONNECTED',
      climateVerification: 'NOT_CONNECTED'
    },
    report,
    warnings: [
      'This is an administrative-reference report, not a measured municipal climate or harvest report.',
      'No rainfall observation, physical harvest, laboratory result, product batch, blockchain anchor or verified climate claim has been supplied.',
      'A configured URL or environment variable alone does not establish an authenticated AquaDMRV connection.'
    ]
  };
}
