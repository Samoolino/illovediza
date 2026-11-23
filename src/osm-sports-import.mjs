const SPORT_TAGS = new Map([
  ['padel', 'padel'],
  ['tennis', 'tennis'],
  ['soccer', 'football'],
  ['football', 'football']
]);

const nonEmpty = value => typeof value === 'string' && value.trim().length > 0;

function readCoordinates(element) {
  const point = Number.isFinite(element?.lat) && Number.isFinite(element?.lon)
    ? { latitude: element.lat, longitude: element.lon, method: 'OSM_ELEMENT_POINT' }
    : Number.isFinite(element?.center?.lat) && Number.isFinite(element?.center?.lon)
      ? { latitude: element.center.lat, longitude: element.center.lon, method: 'OSM_GEOMETRY_CENTER' }
      : null;
  if (!point || point.latitude < -90 || point.latitude > 90 ||
      point.longitude < -180 || point.longitude > 180) return null;
  return point;
}

function sportsFor(tags) {
  const values = [tags?.sport, tags?.['sport:padel'] === 'yes' ? 'padel' : null,
    tags?.['sport:tennis'] === 'yes' ? 'tennis' : null]
    .filter(nonEmpty)
    .flatMap(value => value.toLowerCase().split(/[;,]/).map(item => item.trim()));
  return [...new Set(values.map(value => SPORT_TAGS.get(value)).filter(Boolean))];
}

function isFootballStadium(tags, sports) {
  return sports.includes('football') && tags?.leisure === 'stadium';
}

function venueTypeFor(tags, sports) {
  if (tags?.leisure === 'stadium' && sports.includes('football')) return 'stadium';
  if (tags?.leisure === 'sports_centre') return 'polideportivo';
  if (sports.includes('padel')) return 'padel_centre';
  if (tags?.leisure === 'pitch') return 'sports_pitch';
  return 'sports_venue';
}

export function normalizeOsmSportsVenues(elements, {
  municipalityCodeByElementId = {},
  retrievedAt = new Date().toISOString()
} = {}) {
  if (!Array.isArray(elements)) throw new Error('OSM elements must be an array');
  if (!Number.isFinite(Date.parse(retrievedAt))) throw new Error('retrievedAt must be a valid timestamp');

  const venues = [];
  const rejected = [];
  const seen = new Set();
  for (const element of elements) {
    const key = `${element?.type}/${element?.id}`;
    if (!['node', 'way', 'relation'].includes(element?.type) ||
        !Number.isInteger(element?.id) || element.id <= 0) {
      rejected.push({ elementId: key, reason: 'invalid_osm_element_identity' });
      continue;
    }
    if (seen.has(key)) {
      rejected.push({ elementId: key, reason: 'duplicate_osm_element' });
      continue;
    }
    seen.add(key);

    const tags = element.tags || {};
    const sports = sportsFor(tags);
    const selectedSports = sports.filter(sport =>
      sport === 'padel' || sport === 'tennis' || (sport === 'football' && isFootballStadium(tags, sports))
    );
    if (!selectedSports.length) continue;

    const name = tags.name || tags['name:es'];
    if (!nonEmpty(name)) {
      rejected.push({ elementId: key, reason: 'venue_name_missing' });
      continue;
    }
    const coordinates = readCoordinates(element);
    if (!coordinates) {
      rejected.push({ elementId: key, reason: 'invalid_coordinates' });
      continue;
    }
    const municipalityCode = municipalityCodeByElementId[key] ||
      tags['ine:municipality'] || tags['ref:INE'] || tags['ref:ine'];
    if (!/^\d{5}$/.test(String(municipalityCode || ''))) {
      rejected.push({ elementId: key, reason: 'municipality_code_unresolved' });
      continue;
    }

    const primarySport = selectedSports.includes('padel') ? 'padel'
      : selectedSports.includes('football') ? 'football' : 'tennis';
    const sourceUrl = `https://www.openstreetmap.org/${element.type}/${element.id}`;
    venues.push({
      id: `OSM-${element.type.toUpperCase()}-${element.id}`,
      sourceRecordId: key,
      municipalityCode: String(municipalityCode),
      name,
      sport: primarySport,
      sports: selectedSports,
      venueType: venueTypeFor(tags, selectedSports),
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      coordinateMethod: coordinates.method,
      operator: tags.operator || null,
      access: tags.access || null,
      qualification: 'CANDIDATE',
      qualificationStatus: 'CANDIDATE_REQUIRES_MUNICIPAL_REVIEW',
      significanceEvidence: null,
      municipalManagementEvidence: null,
      sustainabilitySignificanceEvidence: null,
      source: {
        name: 'OpenStreetMap',
        url: sourceUrl,
        retrievedAt,
        license: 'ODbL 1.0',
        attribution: '© OpenStreetMap contributors'
      }
    });
  }
  return {
    schemaVersion: '1.0.0',
    projectId: 'ILL-FUERZA-ES',
    source: 'OpenStreetMap',
    retrievedAt,
    venues,
    rejected,
    summary: {
      candidateVenues: venues.length,
      padel: venues.filter(v => v.sports.includes('padel')).length,
      footballStadiums: venues.filter(v => v.sports.includes('football')).length,
      tennis: venues.filter(v => v.sports.includes('tennis')).length,
      rejected: rejected.length
    }
  };
}
