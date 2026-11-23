import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const profile = JSON.parse(await readFile(new URL('../config/aquadmrv/illovediza-rainwater-qms-profile.json', import.meta.url), 'utf8'));

test('QMS profile is gated on legal classification and does not authorize sale', () => {
  assert.equal(profile.status, 'DRAFT_PENDING_COMPETENT_AUTHORITY_AND_AQUADMRV_REVIEW');
  assert.equal(profile.legalClassification.status, 'LEGAL_CLASSIFICATION_REVIEW_REQUIRED_NOT_AUTHORIZED_FOR_SALE');
  assert.ok(profile.legalClassification.regulatoryInterpretation.some(item => item.includes('RD 3/2023 excludes')));
});

test('conditional prepared-water profile preserves statutory daily, quarterly, five-year and annual testing cycles', () => {
  const cycles = new Map(profile.samplingSchedule.map(item => [item.id, item.frequency]));
  assert.equal(cycles.get('finished_product_daily'), 'EACH_DAY');
  assert.equal(cycles.get('finished_product_quarterly'), 'AT_LEAST_EVERY_THREE_MONTHS');
  assert.equal(cycles.get('finished_product_full_a_b_c'), 'AT_LEAST_EVERY_FIVE_YEARS');
  assert.equal(cycles.get('finished_product_radiological'), 'AT_LEAST_ANNUALLY');
});

test('municipal brand cannot override legal product denomination or QA hold', () => {
  assert.ok(profile.labeling.some(item => item.includes('more prominent')));
  assert.ok(profile.hardStops.some(item => item.includes('failed mandatory quality parameter')));
  assert.ok(profile.releaseRule.includes('human/operator authorization'));
});
