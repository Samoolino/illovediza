import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SPAIN_AUTONOMOUS_REGIONS,
  buildRegionalOverpassQuery,
  deduplicateOsmElements
} from '../src/osm-regional-discovery.mjs';

test('covers all 17 autonomous communities and two autonomous cities', () => {
  assert.equal(SPAIN_AUTONOMOUS_REGIONS.length, 19);
  assert.equal(new Set(SPAIN_AUTONOMOUS_REGIONS.map(region => region.code)).size, 19);
  assert.ok(SPAIN_AUTONOMOUS_REGIONS.some(region => region.code === 'ES-CE'));
  assert.ok(SPAIN_AUTONOMOUS_REGIONS.some(region => region.code === 'ES-ML'));
});

test('builds a regional Overpass query using the exact ISO 3166-2 area code', () => {
  const query = buildRegionalOverpassQuery(
    '[out:json][timeout:180]; area["ISO3166-2"="{{REGION_CODE}}"][admin_level=4]->.region; out ids;',
    { code: 'ES-AN', name: 'Andalucía' }
  );
  assert.match(query, /ISO3166-2"="ES-AN"/);
  assert.doesNotMatch(query, /\{\{REGION_CODE\}\}/);
  assert.throws(() => buildRegionalOverpassQuery('no placeholder', { code: 'ES-AN', name: 'Andalucía' }), /must include/);
});

test('deduplicates OSM elements returned in adjacent regional query areas', () => {
  const result = deduplicateOsmElements([
    { region: 'ES-AN', elements: [{ type: 'way', id: 10 }, { type: 'node', id: 11 }] },
    { region: 'ES-AR', elements: [{ type: 'way', id: 10 }, { type: 'relation', id: 12 }] }
  ]);
  assert.deepEqual(result.elements.map(element => `${element.type}/${element.id}`), ['way/10', 'node/11', 'relation/12']);
  assert.equal(result.duplicates, 1);
});
