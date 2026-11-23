#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { normalizeOsmSportsVenues } from '../src/osm-sports-import.mjs';

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

async function main() {
  const inputPath = argument('--input');
  const crosswalkPath = argument('--crosswalk');
  const outputPath = argument('--output') || 'data/spain/sports-venues.candidates.json';
  if (!inputPath) {
    throw new Error('Usage: node scripts/import-osm-sports-venues.mjs --input <overpass-export.json> --crosswalk <osm-element-ine-crosswalk.json> [--output <file>]');
  }
  const elements = JSON.parse(await readFile(resolve(inputPath), 'utf8'));
  const crosswalk = crosswalkPath
    ? JSON.parse(await readFile(resolve(crosswalkPath), 'utf8'))
    : {};
  const result = normalizeOsmSportsVenues(
    Array.isArray(elements) ? elements : elements.elements,
    { municipalityCodeByElementId: crosswalk, retrievedAt: new Date().toISOString() }
  );
  await writeFile(resolve(outputPath), JSON.stringify({
    schemaVersion: result.schemaVersion,
    projectId: result.projectId,
    source: result.source,
    retrievedAt: result.retrievedAt,
    venues: result.venues,
    summary: result.summary
  }, null, 2) + '\\n');
  await writeFile(resolve(outputPath + '.rejected.json'), JSON.stringify(result.rejected, null, 2) + '\\n');
  console.log(JSON.stringify({ outputPath, summary: result.summary }, null, 2));
  console.log('All imported records remain candidates. Municipal significance, Ayuntamientos management, shared-complex relationships and site permissions require separate evidence.');
}

main().catch(error => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
