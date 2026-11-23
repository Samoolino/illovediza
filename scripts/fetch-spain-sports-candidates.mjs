#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeOsmSportsCandidates } from '../src/osm-sports-import.mjs';
import {
  SPAIN_AUTONOMOUS_REGIONS,
  buildRegionalOverpassQuery,
  deduplicateOsmElements
} from '../src/osm-regional-discovery.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = name => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : null;
};
const endpoints = [
  arg('--endpoint'),
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.nchc.org.tw/api/interpreter',
  'https://overpass.private.coffee/api/interpreter'
].filter(Boolean);
const sleep = milliseconds => new Promise(resolvePromise => setTimeout(resolvePromise, milliseconds));

async function fetchRegion(region, template) {
  const query = buildRegionalOverpassQuery(template, region);
  let lastError = null;
  for (let round = 0; round < 2; round += 1) {
    for (const endpoint of [...new Set(endpoints)]) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Accept': 'application/json',
            'User-Agent': 'IllovedizaFuerza-SpainVenueDiscovery/1.0 (municipal sports and climate research)'
          },
          body: new URLSearchParams({ data: query }),
          signal: AbortSignal.timeout(180000)
        });
        if (!response.ok) {
          const retryAfter = Number(response.headers.get('retry-after') || 0);
          throw Object.assign(new Error(`Overpass returned HTTP ${response.status}`), {
            status: response.status,
            retryAfter
          });
        }
        const json = await response.json();
        if (!Array.isArray(json.elements)) throw new Error('Overpass response did not contain an elements array');
        return { region, endpoint, query, elements: json.elements };
      } catch (error) {
        lastError = error;
        if (error?.status === 429) {
          await sleep(Math.min(Math.max(error.retryAfter * 1000 || 3000, 1500), 15000));
        } else if (error?.status >= 500) {
          await sleep(2500);
        }
      }
    }
    if (round === 0) await sleep(20000);
  }
  throw new Error(`${region.code} ${region.name}: ${lastError?.message || 'all Overpass endpoints failed'}`);
}

async function main() {
  const queryPath = resolve(arg('--query') || 'data/spain/venue-discovery/spain-sports-overpass.ql');
  const outputDir = resolve(arg('--output-dir') || '.cache/spain/venues');
  const template = await readFile(queryPath, 'utf8');
  const retrievedAt = new Date().toISOString();
  const completedRegions = [];
  const failedRegions = [];

  for (const region of SPAIN_AUTONOMOUS_REGIONS) {
    try {
      const result = await fetchRegion(region, template);
      completedRegions.push(result);
      console.log(`OSM ${region.code} ${region.name}: ${result.elements.length} elements from ${result.endpoint}`);
      await sleep(1200);
    } catch (error) {
      failedRegions.push({ code: region.code, name: region.name, error: error instanceof Error ? error.message : String(error) });
      console.error(`OSM region failed: ${region.code} ${region.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const deduplicated = deduplicateOsmElements(completedRegions);
  const normalized = normalizeOsmSportsCandidates(deduplicated.elements, { retrievedAt });
  await mkdir(outputDir, { recursive: true });
  const rawPath = resolve(outputDir, 'overpass-spain-raw.json');
  const candidatePath = resolve(outputDir, 'sports-venue-candidates.json');
  const rejectedPath = resolve(outputDir, 'sports-venue-rejected.json');
  const coverageStatus = failedRegions.length === 0 ? 'COMPLETE_19_OF_19_REGIONS' : 'PARTIAL_REGIONAL_COVERAGE';

  await writeFile(rawPath, JSON.stringify({
    source: 'OpenStreetMap Overpass API',
    retrievedAt,
    queryTemplatePath: queryPath,
    license: 'ODbL 1.0',
    attribution: '© OpenStreetMap contributors',
    regionsRequested: SPAIN_AUTONOMOUS_REGIONS.length,
    regionsCompleted: completedRegions.map(group => ({
      code: group.region.code,
      name: group.region.name,
      endpoint: group.endpoint,
      elementCount: group.elements.length,
      elements: group.elements
    })),
    failedRegions
  }, null, 2) + '\n');

  await writeFile(candidatePath, JSON.stringify({
    schemaVersion: normalized.schemaVersion,
    projectId: normalized.projectId,
    source: normalized.source,
    retrievedAt,
    license: 'ODbL 1.0',
    attribution: '© OpenStreetMap contributors',
    coverageStatus,
    regionsRequested: SPAIN_AUTONOMOUS_REGIONS.length,
    regionsCompleted: completedRegions.map(group => group.region.code),
    failedRegions,
    duplicateElementsAcrossRegions: deduplicated.duplicates,
    summary: normalized.summary,
    venues: normalized.venues
  }, null, 2) + '\n');
  await writeFile(rejectedPath, JSON.stringify(normalized.rejected, null, 2) + '\n');

  const result = {
    status: normalized.venues.length && failedRegions.length === 0
      ? 'COMPLETE_CANDIDATES_EXTRACTED_NOT_QUALIFIED'
      : failedRegions.length ? 'PARTIAL_CANDIDATE_BATCH_NOT_COMPLETE' : 'NO_CANDIDATES_FOUND',
    retrievedAt,
    rawPath,
    candidatePath,
    rejectedPath,
    coverageStatus,
    regionsCompleted: completedRegions.length,
    regionsFailed: failedRegions.length,
    duplicateElementsAcrossRegions: deduplicated.duplicates,
    summary: normalized.summary,
    municipalityAssignment: 'PENDING_OFFICIAL_IGN_POINT_IN_POLYGON',
    qualification: 'PENDING_MUNICIPAL_AND_PRIMARY_SOURCE_REVIEW'
  };
  console.log(JSON.stringify(result, null, 2));
  if (failedRegions.length || normalized.venues.length === 0) process.exitCode = 1;
}

main().catch(error => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
