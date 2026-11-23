#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  extractSpainMunicipalFeaturesFromIgn,
  inspectSpainMunicipalBoundaries,
  buildSpainBoundaryManifest
} from '../src/spain-ign-ingestion.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = name => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : null;
};

async function expectedMunicipalityCodes() {
  const index = JSON.parse(await readFile(resolve(root, 'data/spain/municipalities/index.json'), 'utf8'));
  const codes = [];
  for (const file of index.files) {
    const partition = JSON.parse(await readFile(resolve(root, file.path), 'utf8'));
    codes.push(...partition.municipalities.map(item => String(item.ineCode)));
  }
  if (codes.length !== 8132 || new Set(codes).size !== 8132) {
    throw new Error(`Illovediza INE registry failed identity check: ${codes.length} rows / ${new Set(codes).size} unique codes`);
  }
  return codes;
}

async function main() {
  const boundaryRelease = arg('--boundary-release');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(boundaryRelease || ''))) {
    throw new Error('Supply --boundary-release using the release date verified from IGN/CNIG metadata.');
  }
  const pageSize = Number(arg('--page-size') || 1000);
  if (!Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 10000) throw new Error('--page-size must be between 1 and 10000');
  const outputDir = resolve(arg('--output-dir') || '.cache/spain/ign');
  const collectionUrl = arg('--endpoint') || 'https://api-features.ign.es/collections/administrativeunit/items';
  const expectedCodes = await expectedMunicipalityCodes();
  const retrievedAt = new Date().toISOString();
  const pages = [];
  const seenUrls = new Set();
  let nextUrl = new URL(collectionUrl);
  nextUrl.searchParams.set('f', 'json');
  nextUrl.searchParams.set('limit', String(pageSize));
  const allFeatures = [];

  while (nextUrl) {
    const url = nextUrl.toString();
    if (seenUrls.has(url)) throw new Error('IGN API pagination repeated a page URL');
    seenUrls.add(url);
    const response = await fetch(url, {
      headers: { Accept: 'application/geo+json, application/json' },
      signal: AbortSignal.timeout(120000)
    });
    if (!response.ok) throw new Error(`IGN API returned HTTP ${response.status} for ${url}`);
    const page = await response.json();
    if (page?.type !== 'FeatureCollection' || !Array.isArray(page.features)) {
      throw new Error('IGN API response is not a GeoJSON FeatureCollection');
    }
    pages.push({ url, body: JSON.stringify(page) });
    allFeatures.push(...page.features);

    const link = (page.links || []).find(item => item.rel === 'next' && item.href);
    if (link) {
      nextUrl = new URL(link.href, url);
    } else {
      if (page.features.length >= pageSize) {
        throw new Error('IGN API returned a full page without a next link; refusing to assume the snapshot is complete');
      }
      nextUrl = null;
    }
    console.log(`Fetched ${allFeatures.length} administrative-unit features across ${pages.length} page(s)`);
  }

  await mkdir(outputDir, { recursive: true });
  const rawPath = resolve(outputDir, 'ign-administrativeunit-raw-pages.json');
  const diagnosticPath = resolve(outputDir, 'ign-feature-schema-diagnostic.json');
  await writeFile(rawPath, JSON.stringify({
    sourceService: 'https://api-features.ign.es/collections/administrativeunit/items',
    retrievedAt,
    pages
  }, null, 2) + '\n');
  const diagnostic = {
    featureCount: allFeatures.length,
    samplePropertyKeys: [...new Set(allFeatures.slice(0, 50).flatMap(feature => Object.keys(feature.properties || {})))].sort(),
    sampleFeatures: allFeatures.slice(0, 3).map(feature => ({
      id: feature.id,
      properties: feature.properties,
      geometryType: feature.geometry?.type
    }))
  };
  await writeFile(diagnosticPath, JSON.stringify(diagnostic, null, 2) + '\n');
  console.log('IGN_FEATURE_SCHEMA_DIAGNOSTIC ' + JSON.stringify(diagnostic));

  const rawCollection = { type: 'FeatureCollection', features: allFeatures };
  const extracted = extractSpainMunicipalFeaturesFromIgn(rawCollection, { expectedCodes });
  if (extracted.missingMunicipalityCodes.length) {
    throw new Error(`IGN snapshot is incomplete: ${extracted.missingMunicipalityCodes.length} municipality codes missing; sample: ${extracted.missingMunicipalityCodes.slice(0, 20).join(', ')}`);
  }
  const qa = inspectSpainMunicipalBoundaries(extracted, {
    expectedCodes,
    codeProperty: extracted.codeProperty
  });
  console.log(JSON.stringify({ geometryQA: qa }, null, 2));
  if (!qa.ok) throw new Error('IGN municipal polygons failed structural QA; no snapshot was promoted.');

  const sourceBytes = Buffer.from(pages.map(page => page.url + '\n' + page.body).join('\n---PAGE---\n'), 'utf8');
  const geojsonBytes = Buffer.from(JSON.stringify(extracted), 'utf8');
  const hash = bytes => createHash('sha256').update(bytes).digest('hex');
  const manifest = buildSpainBoundaryManifest({
    boundaryRelease,
    sourcePublisher: 'IGN-CNIG',
    sourceArchive: 'OGC API Features administrativeunit paginated snapshot',
    sourceSha256: hash(sourceBytes),
    geojsonSha256: hash(geojsonBytes),
    featureCount: qa.featureCount,
    matchedMunicipalityCount: qa.matchedMunicipalityCount,
    codeProperty: extracted.codeProperty,
    sourceCrs: 'OGC:CRS84 (IGN API Features storage CRS)',
    targetCrs: 'OGC:CRS84 / EPSG:4326',
    license: 'CC-BY-4.0 ign.es',
    attribution: 'Obra derivada de BDLJE CC-BY 4.0 ign.es',
    generatedAt: retrievedAt
  });

  await mkdir(outputDir, { recursive: true });
  const geometryPath = resolve(outputDir, 'spain-municipalities.geojson');
  const manifestPath = resolve(outputDir, 'manifest.json');
  await writeFile(geometryPath, geojsonBytes);
  await writeFile(manifestPath, JSON.stringify({
    ...manifest,
    sourceService: 'https://api-features.ign.es/collections/administrativeunit/items',
    sourceSnapshotRetrievedAt: retrievedAt,
    pagesRetrieved: pages.length,
    administrativeUnitsFetched: allFeatures.length,
    geometryQA: qa,
    publicationStatus: 'NOT_PUBLISHED',
    topologyQA: 'NOT_RUN_REQUIRES_GDAL_POSTGIS_VALIDATION'
  }, null, 2) + '\n');

  console.log(JSON.stringify({
    status: 'STRUCTURAL_QA_PASSED_LOCAL_SNAPSHOT_NOT_PUBLISHED',
    geometryPath,
    manifestPath,
    municipalities: qa.matchedMunicipalityCount,
    sourceSha256: manifest.sourceSha256,
    geojsonSha256: manifest.geojsonSha256,
    topologyQA: 'NOT_RUN_REQUIRES_GDAL_POSTGIS_VALIDATION',
    attribution: manifest.attribution
  }, null, 2));
}

main().catch(error => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
