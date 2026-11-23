import { createHash } from 'node:crypto';

const nonEmpty = value => typeof value === 'string' && value.trim().length > 0;
const SHA256 = /^[a-f0-9]{64}$/i;

function visitCoordinates(value, stats, errors, featureIndex) {
  if (!Array.isArray(value)) return;
  if (value.length >= 2 && typeof value[0] === 'number' && typeof value[1] === 'number') {
    const [longitude, latitude] = value;
    stats.coordinateCount += 1;
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude) ||
        longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
      errors.push({ code: 'coordinate_out_of_range', featureIndex, message: 'Coordinates must be finite WGS84 longitude/latitude values.' });
    }
    return;
  }
  for (const child of value) visitCoordinates(child, stats, errors, featureIndex);
}

function inspectRing(ring, errors, featureIndex) {
  if (!Array.isArray(ring) || ring.length < 4) {
    errors.push({ code: 'invalid_ring', featureIndex, message: 'Polygon rings require at least four positions.' });
    return;
  }
  const first = ring[0], last = ring[ring.length - 1];
  if (!Array.isArray(first) || !Array.isArray(last) ||
      first[0] !== last[0] || first[1] !== last[1]) {
    errors.push({ code: 'unclosed_ring', featureIndex, message: 'Polygon linear rings must be closed.' });
  }
}

function inspectPolygonCoordinates(coordinates, errors, featureIndex) {
  if (!Array.isArray(coordinates) || !coordinates.length) {
    errors.push({ code: 'empty_polygon', featureIndex, message: 'Polygon coordinates are empty.' });
    return;
  }
  for (const ring of coordinates) inspectRing(ring, errors, featureIndex);
}

function inspectGeometry(geometry, errors, featureIndex) {
  if (!geometry || typeof geometry !== 'object') {
    errors.push({ code: 'missing_geometry', featureIndex, message: 'Feature geometry is missing.' });
    return { type: 'missing' };
  }
  if (geometry.type === 'Polygon') {
    inspectPolygonCoordinates(geometry.coordinates, errors, featureIndex);
  } else if (geometry.type === 'MultiPolygon') {
    if (!Array.isArray(geometry.coordinates) || !geometry.coordinates.length) {
      errors.push({ code: 'empty_multipolygon', featureIndex, message: 'MultiPolygon coordinates are empty.' });
    } else {
      geometry.coordinates.forEach(polygon => inspectPolygonCoordinates(polygon, errors, featureIndex));
    }
  } else {
    errors.push({ code: 'non_polygon_geometry', featureIndex, message: `Expected Polygon or MultiPolygon; received ${geometry.type}.` });
  }
  return { type: geometry.type || 'unknown' };
}

export function inspectSpainMunicipalBoundaries(collection, {
  expectedCodes,
  codeProperty
} = {}) {
  const errors = [];
  const stats = { coordinateCount: 0 };
  if (!collection || collection.type !== 'FeatureCollection' || !Array.isArray(collection.features)) {
    return { ok: false, errors: [{ code: 'invalid_feature_collection', message: 'Input must be a GeoJSON FeatureCollection.' }], featureCount: 0, matchedMunicipalityCount: 0, geometryTypeCounts: {} };
  }
  if (!Array.isArray(expectedCodes) || !expectedCodes.length ||
      expectedCodes.some(code => !/^\d{5}$/.test(String(code)))) {
    throw new Error('expectedCodes must be a non-empty array of five-digit INE municipality codes');
  }
  if (!nonEmpty(codeProperty)) throw new Error('An explicit codeProperty is required; source properties must never be guessed.');
  const expected = new Set(expectedCodes.map(String));
  if (expected.size !== expectedCodes.length) throw new Error('expectedCodes contains duplicate municipality identities');

  const seen = new Set();
  const geometryTypeCounts = {};
  for (const [featureIndex, feature] of collection.features.entries()) {
    if (!feature || feature.type !== 'Feature') {
      errors.push({ code: 'invalid_feature', featureIndex, message: 'Every collection member must be a GeoJSON Feature.' });
      continue;
    }
    const code = feature.properties?.[codeProperty];
    if (!/^\d{5}$/.test(String(code ?? ''))) {
      errors.push({ code: 'invalid_ine_code', featureIndex, message: `Property ${codeProperty} must contain a five-digit INE code.` });
    } else {
      const normalized = String(code);
      if (seen.has(normalized)) errors.push({ code: 'duplicate_ine_code', featureIndex, message: `INE code ${normalized} occurs more than once.` });
      seen.add(normalized);
      if (!expected.has(normalized)) errors.push({ code: 'unexpected_ine_code', featureIndex, message: `INE code ${normalized} is not in the current Illovediza registry.` });
    }
    const geometry = inspectGeometry(feature.geometry, errors, featureIndex);
    geometryTypeCounts[geometry.type] = (geometryTypeCounts[geometry.type] || 0) + 1;
    visitCoordinates(feature.geometry?.coordinates, stats, errors, featureIndex);
  }
  const missing = [...expected].filter(code => !seen.has(code));
  if (missing.length) errors.push({ code: 'missing_ine_codes', message: `${missing.length} expected municipality codes are missing.`, sample: missing.slice(0, 20) });
  if (collection.features.length !== expected.size) errors.push({ code: 'feature_count_mismatch', message: `Expected ${expected.size} municipality polygons, received ${collection.features.length}.` });

  return {
    ok: errors.length === 0,
    errors,
    featureCount: collection.features.length,
    matchedMunicipalityCount: [...seen].filter(code => expected.has(code)).length,
    coordinateCount: stats.coordinateCount,
    geometryTypeCounts,
    missingMunicipalityCount: missing.length
  };
}

export function buildSpainBoundaryManifest(input) {
  if (!input || typeof input !== 'object') throw new Error('boundary manifest input is required');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(input.boundaryRelease || ''))) throw new Error('boundaryRelease must be an ISO date');
  for (const field of ['sourcePublisher', 'sourceArchive', 'codeProperty', 'sourceCrs', 'targetCrs', 'license', 'attribution']) {
    if (!nonEmpty(input[field])) throw new Error(`${field} is required`);
  }
  for (const field of ['sourceSha256', 'geojsonSha256']) {
    if (!SHA256.test(String(input[field] || ''))) throw new Error(`${field} must be a SHA-256 hex digest`);
  }
  if (input.featureCount !== 8132 || input.matchedMunicipalityCount !== 8132) {
    throw new Error('Spain boundary acceptance requires exactly 8,132 features matching the 8,132 municipal INE identities');
  }
  return {
    schemaVersion: '1.0.0',
    projectId: 'ILL-FUERZA-ES',
    sourcePublisher: input.sourcePublisher,
    sourceProduct: 'Límites municipales, provinciales y autonómicos',
    boundaryRelease: input.boundaryRelease,
    sourceArchive: input.sourceArchive,
    sourceSha256: input.sourceSha256.toLowerCase(),
    geojsonSha256: input.geojsonSha256.toLowerCase(),
    featureCount: input.featureCount,
    matchedMunicipalityCount: input.matchedMunicipalityCount,
    codeProperty: input.codeProperty,
    sourceCrs: input.sourceCrs,
    targetCrs: input.targetCrs,
    license: input.license,
    attribution: input.attribution,
    geometryQA: 'STRUCTURAL_GEOJSON_QA_PASSED',
    topologyQA: 'NOT_RUN_REQUIRES_GDAL_POSTGIS_VALIDATION',
    boundaryLegalStatus: 'MAY_INCLUDE_PROVISIONAL_BOUNDARY_SEGMENTS',
    provisionalBoundaryUncertaintyNote: 'CNIG describes some provisional boundary segments with uncertainty of approximately 40 m; consult source metadata and legal records for affected municipalities.',
    provisionalBoundaryReviewBufferM: 50,
    status: 'QA_PASSED_LOCAL_NOT_PUBLISHED',
    publicationStatus: 'NOT_PUBLISHED',
    generatedAt: input.generatedAt || new Date().toISOString()
  };
}

export function sha256Hex(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}


export function extractSpainMunicipalFeaturesFromIgn(collection, { expectedCodes } = {}) {
  if (!collection || collection.type !== 'FeatureCollection' || !Array.isArray(collection.features)) {
    throw new Error('IGN AdministrativeUnit response must be a GeoJSON FeatureCollection');
  }
  if (!Array.isArray(expectedCodes) || !expectedCodes.length ||
      expectedCodes.some(code => !/^\d{5}$/.test(String(code)))) {
    throw new Error('expectedCodes must be a non-empty array of five-digit INE municipality codes');
  }
  const expected = new Set(expectedCodes.map(String));
  if (expected.size !== expectedCodes.length) throw new Error('expectedCodes contains duplicate municipality identities');

  const selected = new Map();
  for (const feature of collection.features) {
    const nationalCode = feature?.properties?.nationalCode ?? feature?.properties?.nationalcode;
    if (typeof nationalCode !== 'string') continue;
    const exact = nationalCode.match(/^(\d{5})$/);
    const namespaced = nationalCode.match(/(?:^|[^0-9])(\d{5})$/);
    const code = exact?.[1] || namespaced?.[1];
    if (!code || !expected.has(code)) continue;
    if (selected.has(code)) throw new Error(`duplicate IGN nationalCode match for municipality ${code}`);
    selected.set(code, {
      ...feature,
      properties: { ...(feature.properties || {}), ineCode: code }
    });
  }
  return {
    type: 'FeatureCollection',
    features: [...selected.values()],
    codeProperty: 'ineCode',
    matchedMunicipalityCount: selected.size,
    missingMunicipalityCodes: [...expected].filter(code => !selected.has(code))
  };
}
