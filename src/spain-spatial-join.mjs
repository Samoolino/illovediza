const validCode = value => /^\d{5}$/.test(String(value || ''));

function pointOnSegment(point, a, b, epsilon = 1e-10) {
  const [x, y] = point;
  const [x1, y1] = a;
  const [x2, y2] = b;
  const lengthSquared = (x2 - x1) ** 2 + (y2 - y1) ** 2;
  if (lengthSquared <= epsilon) return Math.hypot(x - x1, y - y1) <= epsilon;
  const cross = (x - x1) * (y2 - y1) - (y - y1) * (x2 - x1);
  if (Math.abs(cross) > epsilon) return false;
  const dot = (x - x1) * (x2 - x1) + (y - y1) * (y2 - y1);
  if (dot < -epsilon) return false;
  return dot <= lengthSquared + epsilon;
}

function pointInRing(point, ring) {
  if (!Array.isArray(ring) || ring.length < 4) return 0;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[j];
    const b = ring[i];
    if (!Array.isArray(a) || !Array.isArray(b) || a.length < 2 || b.length < 2) return 0;
    if (pointOnSegment(point, a, b)) return -1;
    const intersects = ((b[1] > point[1]) !== (a[1] > point[1])) &&
      (point[0] < ((a[0] - b[0]) * (point[1] - b[1])) / (a[1] - b[1]) + b[0]);
    if (intersects) inside = !inside;
  }
  return inside ? 1 : 0;
}

function pointInPolygon(point, rings) {
  if (!Array.isArray(rings) || !rings.length) return 0;
  const outer = pointInRing(point, rings[0]);
  if (outer !== 1) return outer;
  for (const hole of rings.slice(1)) {
    const state = pointInRing(point, hole);
    if (state === -1) return -1;
    if (state === 1) return 0;
  }
  return 1;
}

function pointInGeometry(point, geometry) {
  if (geometry?.type === 'Polygon') return pointInPolygon(point, geometry.coordinates);
  if (geometry?.type === 'MultiPolygon') {
    let boundary = false;
    for (const polygon of geometry.coordinates || []) {
      const state = pointInPolygon(point, polygon);
      if (state === 1) return 1;
      if (state === -1) boundary = true;
    }
    return boundary ? -1 : 0;
  }
  return 0;
}

export function assignVenuesToIgnMunicipalities(venues, collection, { codeProperty = 'ineCode' } = {}) {
  if (!Array.isArray(venues) || venues.length === 0) throw new Error('at least one venue candidate is required');
  if (collection?.type !== 'FeatureCollection' || !Array.isArray(collection.features) || collection.features.length === 0) {
    throw new Error('IGN municipality GeoJSON FeatureCollection is required');
  }

  const features = collection.features.filter(feature =>
    validCode(feature?.properties?.[codeProperty]) &&
    ['Polygon', 'MultiPolygon'].includes(feature?.geometry?.type)
  );
  if (!features.length) throw new Error('IGN FeatureCollection contains no valid municipal polygon features');

  const output = venues.map(venue => {
    const provisional = venue.provisionalMunicipalityCode ?? venue.municipalityCode ?? null;
    const longitude = venue.longitude;
    const latitude = venue.latitude;
    const validCoordinates = typeof longitude === 'number' && typeof latitude === 'number' &&
      Number.isFinite(longitude) && Number.isFinite(latitude) &&
      longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90;
    if (!validCoordinates) {
      return {
        ...venue,
        municipalityCode: null,
        provisionalMunicipalityCode: provisional,
        provisionalMatchStatus: provisional ? 'UNVERIFIED_PROVISIONAL_MATCH' : 'NO_PROVISIONAL_MATCH',
        spatialCrosswalkStatus: 'INVALID_COORDINATES'
      };
    }

    const point = [longitude, latitude];
    const matches = [];
    const boundaryMatches = [];
    for (const feature of features) {
      const state = pointInGeometry(point, feature.geometry);
      if (state === 1) matches.push(String(feature.properties[codeProperty]));
      if (state === -1) boundaryMatches.push(String(feature.properties[codeProperty]));
    }

    if (boundaryMatches.length || matches.length > 1) {
      return {
        ...venue,
        municipalityCode: null,
        provisionalMunicipalityCode: provisional,
        provisionalMatchStatus: provisional ? 'UNVERIFIED_PROVISIONAL_MATCH' : 'NO_PROVISIONAL_MATCH',
        spatialCrosswalkStatus: 'AMBIGUOUS_BOUNDARY_OR_OVERLAP',
        spatialMatchCandidates: [...new Set([...matches, ...boundaryMatches])].sort()
      };
    }
    if (matches.length === 0) {
      return {
        ...venue,
        municipalityCode: null,
        provisionalMunicipalityCode: provisional,
        provisionalMatchStatus: provisional ? 'UNVERIFIED_PROVISIONAL_MATCH' : 'NO_PROVISIONAL_MATCH',
        spatialCrosswalkStatus: 'NO_IGN_POLYGON_MATCH'
      };
    }

    const municipalityCode = matches[0];
    return {
      ...venue,
      municipalityCode,
      provisionalMunicipalityCode: provisional,
      provisionalMatchStatus: provisional
        ? provisional === municipalityCode ? 'CONFIRMED_BY_IGN' : 'CONFLICTS_WITH_IGN_SPATIAL_MATCH'
        : 'NOT_APPLICABLE',
      spatialCrosswalkStatus: 'VERIFIED_IGN_POINT_IN_POLYGON',
      spatialMatchCandidates: [municipalityCode]
    };
  });

  return {
    schemaVersion: '1.0.0',
    projectId: 'ILL-FUERZA-ES',
    source: 'IGN-CNIG AdministrativeUnit polygons',
    codeProperty,
    venues: output,
    summary: {
      total: output.length,
      verified: output.filter(item => item.spatialCrosswalkStatus === 'VERIFIED_IGN_POINT_IN_POLYGON').length,
      ambiguous: output.filter(item => item.spatialCrosswalkStatus === 'AMBIGUOUS_BOUNDARY_OR_OVERLAP').length,
      unmatched: output.filter(item => item.spatialCrosswalkStatus === 'NO_IGN_POLYGON_MATCH').length,
      invalidCoordinates: output.filter(item => item.spatialCrosswalkStatus === 'INVALID_COORDINATES').length,
      provisionalConflicts: output.filter(item => item.provisionalMatchStatus === 'CONFLICTS_WITH_IGN_SPATIAL_MATCH').length
    }
  };
}
