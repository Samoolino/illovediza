import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMunicipalClimateProductReport } from '../src/dmrv/municipal-climate-report.mjs';

const municipality = {
  ineCode: '28079',
  name: 'Madrid',
  provinceName: 'Madrid',
  autonomousCommunityName: 'Comunidad de Madrid'
};

test('municipal climate report keeps forecast opportunity separate from measured harvest', () => {
  const report = buildMunicipalClimateProductReport({
    municipality,
    climateRecords: [{
      indicator: 'rainfall',
      value: 24,
      unit: 'mm',
      evidenceClass: 'MODELLED',
      sourceId: 'open-meteo',
      observedAt: '2026-11-20T00:00:00Z',
      retrievedAt: '2026-11-20T01:00:00Z',
      qualityState: 'PASS'
    }]
  });
  assert.equal(report.factors.rainfall.status, 'MODELLED_CONTEXT_ONLY');
  assert.equal(report.factors.harvestedRainwater.status, 'NOT_CONFIGURED');
  assert.equal(report.claims.carbonCreditStatus, 'NOT_ISSUED');
});

test('rainwater potential is calculated only from rainfall and a documented catchment plan', () => {
  const report = buildMunicipalClimateProductReport({
    municipality,
    climateRecords: [{
      indicator: 'rainfall',
      value: 20,
      unit: 'mm',
      evidenceClass: 'OBSERVED',
      sourceId: 'rain-gauge-1',
      observedAt: '2026-11-20T00:00:00Z',
      retrievedAt: '2026-11-20T00:05:00Z',
      qualityState: 'PASS'
    }],
    catchmentPlan: {
      catchmentAreaM2: 100,
      runoffCoefficient: 0.8,
      methodologyId: 'RW-POTENTIAL-1',
      version: '1.0',
      approvedBy: 'reviewer-1'
    }
  });
  assert.equal(report.factors.rainwaterPotentialLitres.value, 1600);
  assert.equal(report.factors.rainwaterPotentialLitres.status, 'CALCULATED_CONTEXT_ONLY');
  assert.equal(report.factors.harvestedRainwater.value, null);
});

test('measured harvest remains held until first-flush, custody and QMS evidence are present', () => {
  const base = {
    eventId: 'RAIN-1',
    harvestedLitres: 500,
    meterId: 'METER-1',
    measuredAt: '2026-11-20T12:00:00Z',
    sourceId: 'meter-log-1',
    firstFlushEvidenceId: 'FF-1',
    custodyRecordId: 'CUSTODY-1',
    qmsResultId: 'LAB-1',
    batchId: 'BATCH-1'
  };
  const report = buildMunicipalClimateProductReport({ municipality, harvestRecords: [base] });
  assert.equal(report.factors.harvestedRainwater.value, 500);
  assert.equal(report.factors.harvestedRainwater.status, 'REPORTABLE');
  assert.equal(report.factors.premiumRainwater.status, 'REVIEW_PENDING');
  assert.equal(report.claims.carbonCreditStatus, 'NOT_ISSUED');
});

test('rejects unsupported harvest values without a meter source and timestamp', () => {
  const report = buildMunicipalClimateProductReport({
    municipality,
    harvestRecords: [{ eventId: 'RAIN-2', harvestedLitres: 500 }]
  });
  assert.equal(report.factors.harvestedRainwater.value, null);
  assert.equal(report.factors.harvestedRainwater.status, 'HOLD');
});

test('GHG calculation requires activity, factor source and methodology lineage', () => {
  const report = buildMunicipalClimateProductReport({
    municipality,
    impactRecords: [{
      indicator: 'electricity_emissions',
      activityValue: 100,
      activityUnit: 'kWh',
      emissionFactor: 0.2,
      emissionFactorUnit: 'kgCO2e/kWh',
      emissionFactorSourceId: 'national-factor-table-2026',
      methodologyId: 'GHG-ELECTRICITY-1',
      methodologyVersion: '2026.1'
    }]
  });
  assert.equal(report.factors.ghgEmissions.value, 20);
  assert.equal(report.factors.ghgEmissions.status, 'CALCULATED_REVIEW_PENDING');
});
