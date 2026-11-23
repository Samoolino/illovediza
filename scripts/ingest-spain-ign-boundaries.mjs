#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectSpainMunicipalBoundaries, buildSpainBoundaryManifest, sha256Hex } from '../src/spain-ign-ingestion.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = name => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
};
const required = name => {
  const value = arg(name);
  if (!value) throw new Error(`Missing required argument ${name}`);
  return value;
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
  const geojsonPath = resolve(required('--geojson'));
  const archivePath = resolve(required('--source-archive'));
  const codeProperty = required('--code-property');
  const boundaryRelease = arg('--boundary-release') || '2026-08-18';
  const archiveDate = arg('--archive-date') || '2026-08-10';
  const sourceCrs = arg('--source-crs') || 'ETRS89 / REGCAN95 geographic';
  const targetCrs = arg('--target-crs') || 'EPSG:4326';
  const outputDir = resolve(arg('--output-dir') || resolve(root, '.cache/spain/ign'));
  const geojsonBytes = await readFile(geojsonPath);
  const archiveBytes = await readFile(archivePath);
  const collection = JSON.parse(geojsonBytes.toString('utf8'));
  const expectedCodes = await expectedMunicipalityCodes();
  const qa = inspectSpainMunicipalBoundaries(collection, { expectedCodes, codeProperty });
  console.log(JSON.stringify({ geometryQA: qa }, null, 2));
  if (!qa.ok) throw new Error('IGN municipal geometry did not pass structural QA; no output was promoted.');

  const manifest = buildSpainBoundaryManifest({
    boundaryRelease,
    sourcePublisher: 'IGN-CNIG',
    sourceArchive: basename(archivePath),
    sourceArchiveDate: archiveDate,
    sourceSha256: sha256Hex(archiveBytes),
    geojsonSha256: sha256Hex(geojsonBytes),
    featureCount: qa.featureCount,
    matchedMunicipalityCount: qa.matchedMunicipalityCount,
    codeProperty,
    sourceCrs,
    targetCrs,
    license: 'CC-BY-4.0-compatible; confirm source archive notice',
    attribution: 'Obra derivada de BDLJE CC-BY 4.0 ign.es'
  });
  await mkdir(outputDir, { recursive: true });
  const geometryOutput = resolve(outputDir, 'spain-municipalities.geojson');
  const manifestOutput = resolve(outputDir, 'manifest.json');
  await writeFile(geometryOutput, geojsonBytes);
  await writeFile(manifestOutput, JSON.stringify({
    ...manifest,
    sourceArchiveDate: archiveDate,
    geometryFile: 'spain-municipalities.geojson',
    geometryBytes: geojsonBytes.length,
    geometryQA: qa,
    sourceReference: 'https://centrodedescargas.cnig.es/CentroDescargas/limites-municipales-provinciales-autonomicos'
  }, null, 2) + '\n');
  console.log(JSON.stringify({
    status: manifest.status,
    geometryOutput,
    manifestOutput,
    sourceSha256: manifest.sourceSha256,
    geojsonSha256: manifest.geojsonSha256,
    municipalities: qa.matchedMunicipalityCount,
    topologyQA: manifest.topologyQA
  }, null, 2));
  console.log('Local cache only. Run GDAL/OGR topology validation and PostGIS one-to-one point-in-polygon crosswalk before publishing or updating venue municipality codes.');
}

main().catch(error => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
