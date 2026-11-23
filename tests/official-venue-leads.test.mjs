import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const registry = JSON.parse(await readFile(
  new URL('../data/spain/venue-discovery/official-municipal-leads-2026-11-23.json', import.meta.url),
  'utf8'
));

test('official venue leads preserve authority, sports evidence and unresolved spatial status', () => {
  assert.equal(registry.projectId, 'ILL-FUERZA-ES');
  assert.ok(registry.leads.length >= 5);
  for (const lead of registry.leads) {
    assert.ok(lead.officialSourceUrl.startsWith('https://'));
    assert.equal(lead.candidateStatus, 'CANDIDATE_SOURCE_BACKED_NOT_GEOTAGGED');
    assert.equal(lead.spatialStatus, 'ADDRESS_ONLY_PENDING_IGN_POINT_IN_POLYGON');
    assert.equal(lead.qualificationStatus, 'NOT_QUALIFIED');
    assert.equal(lead.municipalityCode, null);
    assert.equal(lead.harvestAuthorization, 'NOT_GRANTED');
  }
});

test('private major padel complex is not misrepresented as an Ayuntamiento venue', () => {
  const venue = registry.leads.find(item => item.id === 'CIUDAD-DE-LA-RAQUETA-MADRID');
  assert.equal(venue.ownership, 'PRIVATE');
  assert.equal(venue.sports.padelCourtCount, 22);
});
