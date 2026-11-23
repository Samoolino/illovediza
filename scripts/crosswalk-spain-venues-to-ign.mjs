#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assignVenuesToIgnMunicipalities } from '../src/spain-spatial-join.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = name => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : null;
};

async function main() {
  const ignDir = resolve(arg('--ign-dir') || '.cache/spain/ign');
  const venueDir = resolve(arg('--venue-dir') || '.cache/spain/venues');
  const [geometryText, manifestText, candidateText] = await Promise.all([
    readFile(resolve(ignDir, 'spain-municipalities.geojson'), 'utf8'),
    readFile(resolve(ignDir, 'manifest.json'), 'utf8'),
    readFile(resolve(venueDir, 'sports-venue-candidates.json'), 'utf8')
  ]);
  const geometry = JSON.parse(geometryText);
  const ignManifest = JSON.parse(manifestText);
  const candidateBatch = JSON.parse(candidateText);
  if (candidateBatch.projectId !== 'ILL-FUERZA-ES' || !Array.isArray(candidateBatch.venues)) {
    throw new Error('OSM candidate batch does not match the Illovediza project contract');
  }
  const result = assignVenuesToIgnMunicipalities(candidateBatch.venues, geometry, { codeProperty: 'ineCode' });
  const output = {
    schemaVersion: '1.0.0',
    projectId: 'ILL-FUERZA-ES',
    datasetId: 'SPAIN-OSM-IGN-VENUE-CROSSWALK',
    generatedAt: new Date().toISOString(),
    geometrySource: {
      publisher: 'IGN-CNIG',
      boundaryRelease: ignManifest.boundaryRelease,
      sourceSha256: ignManifest.sourceSha256,
      geojsonSha256: ignManifest.geojsonSha256
    },
    venueSource: {
      publisher: 'OpenStreetMap',
      retrievedAt: candidateBatch.retrievedAt,
      license: 'ODbL 1.0',
      attribution: '© OpenStreetMap contributors'
    },
    summary: result.summary,
    qualificationStatus: 'CANDIDATES_ONLY_NOT_QUALIFIED',
    venues: result.venues
  };
  const outputPath = resolve(venueDir, 'sports-venue-candidates.ign-crosswalked.json');
  await writeFile(outputPath, JSON.stringify(output, null, 2) + '\n');
  console.log(JSON.stringify({
    status: 'SPATIAL_CROSSWALK_COMPLETE_CANDIDATES_NOT_QUALIFIED',
    outputPath,
    summary: result.summary,
    nextGate: 'Venue significance, ownership/management, shared-complex evidence and site authorization remain separate.'
  }, null, 2));
}

main().catch(error => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
