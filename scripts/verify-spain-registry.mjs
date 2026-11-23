import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const index = JSON.parse(await readFile(join(root, 'data/spain/municipalities/index.json'), 'utf8'));
assert.equal(index.projectId, 'ILL-FUERZA-ES');
assert.equal(index.referenceCounts.autonomousCommunities, 17);
assert.equal(index.referenceCounts.autonomousCities, 2);
assert.equal(index.referenceCounts.provinces, 50);
assert.equal(index.referenceCounts.municipalities, 8132);
assert.equal(index.files.length, 19);

const records = [];
for (const partition of index.files) {
  const data = JSON.parse(await readFile(join(root, partition.path), 'utf8'));
  assert.equal(data.projectId, index.projectId, `wrong project ID in ${partition.path}`);
  assert.equal(data.autonomousCommunityCode, partition.autonomousCommunityCode);
  assert.equal(data.municipalities.length, partition.count, `partition count mismatch: ${partition.path}`);
  records.push(...data.municipalities);
}
const codes = records.map(item => item.ineCode);
assert.equal(records.length, 8132);
assert.equal(new Set(codes).size, 8132, 'INE municipality codes must be unique');
assert.ok(codes.every(code => /^\\d{5}$/.test(code)), 'INE municipality codes must be five digits');
assert.ok(records.every(item => item.countryCode === 'ES' && item.reportingNodeStatus === 'ADMINISTRATIVE_REFERENCE'));
assert.ok(records.every(item => item.sportsCoverage?.padel === 'NOT_ASSESSED' &&
  item.sportsCoverage?.football === 'NOT_ASSESSED' && item.sportsCoverage?.tennis === 'NOT_ASSESSED'));
assert.ok(records.every(item => item.geometryStatus === 'NOT_LOADED' && item.venues.length === 0));
assert.ok(records.every(item => item.name && item.provinceName && item.autonomousCommunityName));
console.log(JSON.stringify({
  status: 'PASS',
  municipalities: records.length,
  uniqueIneCodes: new Set(codes).size,
  autonomousCommunitiesAndCities: index.files.length,
  provinces: new Set(records.map(item => item.provinceCode)).size,
  venueCoverage: 'NOT_ASSESSED',
  geometry: 'NOT_LOADED'
}, null, 2));
