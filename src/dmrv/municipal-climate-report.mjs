const isFiniteNumber = value => typeof value === 'number' && Number.isFinite(value);
const nonEmpty = value => typeof value === 'string' && value.trim().length > 0;
const isoTimestamp = value => nonEmpty(value) && Number.isFinite(Date.parse(value));

const emptyFactor = (status = 'NOT_CONFIGURED') => ({
  value: null, unit: null, evidenceClass: null, status, sourceIds: [], limitations: []
});

export function buildMunicipalClimateProductReport({
  municipality,
  climateRecords = [],
  catchmentPlan = null,
  harvestRecords = [],
  impactRecords = [],
  socialRecords = [],
  governanceRecords = [],
  generatedAt = new Date().toISOString()
}) {
  if (!municipality || !/^\d{5}$/.test(String(municipality.ineCode || '')) ||
      !nonEmpty(municipality.name)) {
    throw new Error('A valid official municipality identity is required');
  }

  const rainfall = climateRecords.find(record =>
    record?.indicator === 'rainfall' &&
    isFiniteNumber(record.value) && record.value >= 0 &&
    record.unit === 'mm' && nonEmpty(record.sourceId) &&
    isoTimestamp(record.observedAt) && isoTimestamp(record.retrievedAt) &&
    record.qualityState === 'PASS'
  );

  const rainfallFactor = rainfall ? {
    value: rainfall.value,
    unit: 'mm',
    evidenceClass: rainfall.evidenceClass || 'UNSPECIFIED',
    status: rainfall.evidenceClass === 'OBSERVED' ? 'REPORTABLE' : 'MODELLED_CONTEXT_ONLY',
    sourceIds: [rainfall.sourceId],
    observedAt: rainfall.observedAt,
    retrievedAt: rainfall.retrievedAt,
    limitations: rainfall.evidenceClass === 'OBSERVED'
      ? []
      : ['Forecast, modelled or other non-observed rainfall is context only and cannot establish physical collection.']
  } : emptyFactor();

  let rainwaterPotential = emptyFactor();
  if (rainfall && rainfall.evidenceClass === 'OBSERVED' &&
      isFiniteNumber(catchmentPlan?.catchmentAreaM2) && catchmentPlan.catchmentAreaM2 > 0 &&
      isFiniteNumber(catchmentPlan?.runoffCoefficient) &&
      catchmentPlan.runoffCoefficient > 0 && catchmentPlan.runoffCoefficient <= 1 &&
      nonEmpty(catchmentPlan.methodologyId) && nonEmpty(catchmentPlan.version) &&
      nonEmpty(catchmentPlan.approvedBy)) {
    rainwaterPotential = {
      value: Math.round(rainfall.value * catchmentPlan.catchmentAreaM2 * catchmentPlan.runoffCoefficient * 1000) / 1000,
      unit: 'litres',
      evidenceClass: 'CALCULATED',
      status: 'CALCULATED_CONTEXT_ONLY',
      sourceIds: [rainfall.sourceId],
      methodology: { id: catchmentPlan.methodologyId, version: catchmentPlan.version },
      limitations: ['Modelled catchment opportunity is not measured harvested volume and is not a carbon-credit quantity.']
    };
  }

  let harvestedRainwater = emptyFactor();
  let premiumRainwater = emptyFactor();
  if (harvestRecords.length) {
    const validHarvest = harvestRecords.filter(record =>
      nonEmpty(record.eventId) && isFiniteNumber(record.harvestedLitres) &&
      record.harvestedLitres >= 0 && nonEmpty(record.meterId) &&
      isoTimestamp(record.measuredAt) && nonEmpty(record.sourceId)
    );
    if (validHarvest.length !== harvestRecords.length) {
      harvestedRainwater = { ...emptyFactor('HOLD'), limitations: ['At least one harvest record lacks meter, source, timestamp or valid measured volume.'] };
    } else {
      harvestedRainwater = {
        value: validHarvest.reduce((sum, record) => sum + record.harvestedLitres, 0),
        unit: 'litres',
        evidenceClass: 'OBSERVED',
        status: 'REPORTABLE',
        sourceIds: validHarvest.map(record => record.sourceId),
        eventIds: validHarvest.map(record => record.eventId),
        limitations: []
      };
      const completePhysicalChain = validHarvest.every(record =>
        nonEmpty(record.firstFlushEvidenceId) &&
        nonEmpty(record.custodyRecordId) &&
        nonEmpty(record.qmsResultId) &&
        nonEmpty(record.batchId)
      );
      premiumRainwater = completePhysicalChain
        ? {
            value: null, unit: null, evidenceClass: 'OBSERVED',
            status: 'REVIEW_PENDING',
            sourceIds: validHarvest.map(record => record.sourceId),
            batchIds: validHarvest.map(record => record.batchId),
            limitations: ['Premium status requires authorized QMS acceptance, batch/seal review and applicable regulatory/product-release approval.']
          }
        : { ...emptyFactor('HOLD'), limitations: ['First-flush, sample custody, laboratory/QMS and batch evidence are incomplete.'] };
    }
  }

  const validGhg = impactRecords.filter(record =>
    record?.indicator === 'electricity_emissions' &&
    isFiniteNumber(record.activityValue) && record.activityValue >= 0 &&
    nonEmpty(record.activityUnit) && isFiniteNumber(record.emissionFactor) &&
    record.emissionFactor >= 0 && nonEmpty(record.emissionFactorUnit) &&
    nonEmpty(record.emissionFactorSourceId) && nonEmpty(record.methodologyId) &&
    nonEmpty(record.methodologyVersion)
  );
  const invalidGhg = impactRecords.some(record => record?.indicator === 'electricity_emissions') &&
    validGhg.length !== impactRecords.filter(record => record?.indicator === 'electricity_emissions').length;
  const ghg = invalidGhg
    ? { ...emptyFactor('HOLD'), limitations: ['GHG activity, factor source or methodology lineage is incomplete.'] }
    : validGhg.length
      ? {
          value: Math.round(validGhg.reduce((sum, record) => sum + record.activityValue * record.emissionFactor, 0) * 1000) / 1000,
          unit: 'kgCO2e',
          evidenceClass: 'CALCULATED',
          status: 'CALCULATED_REVIEW_PENDING',
          sourceIds: validGhg.map(record => record.emissionFactorSourceId),
          methodologies: validGhg.map(record => ({ id: record.methodologyId, version: record.methodologyVersion })),
          limitations: ['Calculated emissions require independent methodology and boundary review before a verified claim.']
        }
      : emptyFactor();

  const social = socialRecords.length
    ? { value: socialRecords.length, unit: 'records', evidenceClass: 'OBSERVED', status: 'REVIEW_PENDING', sourceIds: socialRecords.map(r => r.sourceId).filter(nonEmpty), limitations: ['Participation counts require defined population, denominator, period, lawful collection and safeguarding controls.'] }
    : emptyFactor();
  const governance = governanceRecords.length
    ? { value: governanceRecords.length, unit: 'controls', evidenceClass: 'DOCUMENTARY', status: 'REVIEW_PENDING', sourceIds: governanceRecords.map(r => r.sourceId).filter(nonEmpty), limitations: ['Governance evidence requires accountable owner and review decision.'] }
    : emptyFactor();

  return {
    schemaVersion: '1.0.0',
    projectId: 'ILL-FUERZA-ES',
    reportType: 'municipal_climate_product_evidence',
    generatedAt,
    geography: {
      municipalityCode: municipality.ineCode,
      municipalityName: municipality.name,
      province: municipality.provinceName || null,
      autonomousCommunity: municipality.autonomousCommunityName || null
    },
    factors: {
      rainfall: rainfallFactor,
      rainwaterPotentialLitres: rainwaterPotential,
      harvestedRainwater,
      premiumRainwater,
      ghgEmissions: ghg,
      socialImpact: social,
      governance
    },
    claims: {
      verifiedClimateClaim: false,
      carbonCreditStatus: 'NOT_ISSUED',
      carbonCreditIssued: false,
      productReleaseStatus: 'NOT_RELEASED'
    },
    limitations: [
      'Municipal reporting identity does not prove a sports venue, harvest installation or municipal partnership.',
      'Rainwater opportunity, measured harvest, premium product status, GHG impact and carbon-credit issuance are separate determinations.',
      'Blockchain anchoring preserves evidence integrity but does not establish the truth or eligibility of a climate claim.'
    ]
  };
}
