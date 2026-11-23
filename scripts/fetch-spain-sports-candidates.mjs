#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeOsmSportsCandidates } from '../src/osm-sports-import.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = name => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : null;
};
const endpoints = [
  arg('--endpoint'),
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
].filter(Boolean);

async function main() {
  const queryPath = resolve(arg('--query') || 'data/spain/venue-discovery/spain-sports-overpass.ql');
  const outputDir = resolve(arg('--output-dir') || '.cache/spain/venues');
  const query = await readFile(queryPath, 'utf8');
  const retrievedAt = new Date().toISOString();
  let payload = null;
  let lastError = null;

  for (const endpoint of [...new Set(endpoints)]) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({ data: query }),
        signal: AbortSignal.timeout(240000)
      });
      if (!response.ok) throw new Error(`Overpass returned HTTP ${response.status}`);
      const json = await response.json();
      if (!Array.isArray(json.elements)) throw new Error('Overpass response did not contain an elements array');
      payload = { endpoint, json };
      break;
    } catch (error) {
      lastError = error;
    }
  }
  if (!payload) throw new Error(`All Overpass endpoints failed: ${lastError?.message || 'unknown error'}`);

  const normalized = normalizeOsmSportsCandidates(payload.json.elements, { retrievedAt });
  await mkdir(outputDir, { recursive: true });
  const rawPath = resolve(outputDir, 'overpass-spain-raw.json');
  const candidatePath = resolve(outputDir, 'sports-venue-candidates.json');
  const rejectedPath = resolve(outputDir, 'sports-venue-rejected.json');
  await writeFile(rawPath, JSON.stringify({
    source: 'OpenStreetMap Overpass API',
    endpoint: payload.endpoint,
    queryPath,
    retrievedAt,
    license: 'ODbL 1.0',
    attribution: '© OpenStreetMap contributors',
    elements: payload.json.elements
  }, null, 2) + '\n');
  await writeFile(candidatePath, JSON.stringify({
    schemaVersion: normalized.schemaVersion,
    projectId: normalized.projectId,
    source: normalized.source,
    endpoint: payload.endpoint,
    queryPath,
    retrievedAt,
    license: 'ODbL 1.0',
    attribution: '© OpenStreetMap contributors',
    summary: normalized.summary,
    venues: normalized.venues
  }, null, 2) + '\n');
  await writeFile(rejectedPath, JSON.stringify(normalized.rejected, null, 2) + '\n');
  console.log(JSON.stringify({
    status: 'CANDIDATES_EXTRACTED_NOT_QUALIFIED',
    endpoint: payload.endpoint,
    retrievedAt,
    rawPath,
    candidatePath,
    rejectedPath,
    summary: normalized.summary,
    municipalityAssignment: 'PENDING_OFFICIAL_IGN_POINT_IN_POLYGON',
    qualification: 'PENDING_MUNICIPAL_AND_PRIMARY_SOURCE_REVIEW'
  }, null, 2));
}

main().catch(error => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
