const SPORTS = ['padel', 'football', 'tennis'];
const VALID_FORMATS = ['BOTTLE', 'CAN'];
const VALID_DMRV_STATES = ['DESIGNED', 'IMPLEMENTED', 'INTEGRATION_READY', 'CONTROLLED_TEST', 'REPORTABLE', 'VALIDATED', 'VERIFIED', 'ANCHORED', 'RELEASED', 'REVIEW_PENDING', 'HOLD'];

const nonEmpty = value => typeof value === 'string' && value.trim().length > 0;
const finite = value => typeof value === 'number' && Number.isFinite(value);
const sportsOf = venue => Array.isArray(venue?.sports) ? venue.sports : [venue?.sport];
const supportsSport = (venue, sport) => sportsOf(venue).includes(sport);
const hasQualification = (venue, qualification) => Array.isArray(venue?.qualifications)
  ? venue.qualifications.includes(qualification)
  : venue?.qualification === qualification;

export function validateSportsVenue(venue) {
  const errors = [];
  if (!venue || typeof venue !== 'object' || Array.isArray(venue)) {
    return { valid: false, errors: ['invalid_venue'] };
  }
  if (!nonEmpty(venue.id)) errors.push('missing_venue_id');
  if (!/^\d{5}$/.test(String(venue.municipalityCode || ''))) errors.push('invalid_municipality_code');
  if (!nonEmpty(venue.name)) errors.push('missing_venue_name');
  if (!SPORTS.includes(venue.sport) || sportsOf(venue).some(sport => !SPORTS.includes(sport))) errors.push('invalid_sport');
  if (!finite(venue.latitude) || venue.latitude < -90 || venue.latitude > 90 ||
      !finite(venue.longitude) || venue.longitude < -180 || venue.longitude > 180) {
    errors.push('invalid_coordinates');
  }
  if (!venue.source || !nonEmpty(venue.source.name) || !nonEmpty(venue.source.url) ||
      !nonEmpty(venue.source.retrievedAt) || !nonEmpty(venue.source.license)) {
    errors.push('missing_source_provenance');
  } else {
    try {
      const parsed = new URL(venue.source.url);
      if (parsed.protocol !== 'https:' || !Number.isFinite(Date.parse(venue.source.retrievedAt))) {
        errors.push('invalid_source_provenance');
      }
    } catch {
      errors.push('invalid_source_provenance');
    }
  }
  return { valid: errors.length === 0, errors };
}

function isMajorPadel(venue) {
  return supportsSport(venue, 'padel') &&
    venue.qualification === 'MAJOR_PADEL' &&
    nonEmpty(venue.significanceEvidence);
}

function isQualifiedFootball(venue, municipalityVenues) {
  if (!supportsSport(venue, 'football') || !hasQualification(venue, 'FOOTBALL_STADIUM') ||
      venue.venueType !== 'stadium' || !nonEmpty(venue.coLocatedMajorPadelEvidence) ||
      !nonEmpty(venue.sharedSportsComplexId)) return false;
  return municipalityVenues.some(other =>
    supportsSport(other, 'padel') && isMajorPadel(other) &&
    other.sharedSportsComplexId === venue.sharedSportsComplexId
  );
}

function isSignificantMunicipalTennis(venue) {
  return supportsSport(venue, 'tennis') &&
    hasQualification(venue, 'SIGNIFICANT_TENNIS_POLIDEPORTIVO') &&
    venue.venueType === 'polideportivo' &&
    venue.municipalOperator === true &&
    nonEmpty(venue.municipalManagementEvidence) &&
    nonEmpty(venue.sustainabilitySignificanceEvidence);
}

export function buildMunicipalSportsRegistry(municipalities, venues = []) {
  const errors = [];
  if (!Array.isArray(municipalities)) throw new Error('municipalities must be an array');
  if (!Array.isArray(venues)) throw new Error('venues must be an array');
  const byCode = new Map();
  for (const [index, municipality] of municipalities.entries()) {
    const code = String(municipality?.ineCode || '');
    if (!/^\d{5}$/.test(code)) errors.push({ code: 'invalid_municipality_code', index, municipalityCode: code });
    else if (byCode.has(code)) errors.push({ code: 'duplicate_municipality_code', index, municipalityCode: code });
    else byCode.set(code, municipality);
  }

  const venueIds = new Set();
  const validVenues = [];
  for (const [index, venue] of venues.entries()) {
    const validation = validateSportsVenue(venue);
    if (!validation.valid) {
      errors.push({ code: 'invalid_venue', index, venueId: venue?.id || null, reasons: validation.errors });
      continue;
    }
    if (venueIds.has(venue.id)) {
      errors.push({ code: 'duplicate_venue_id', index, venueId: venue.id });
      continue;
    }
    venueIds.add(venue.id);
    if (!byCode.has(venue.municipalityCode)) {
      errors.push({ code: 'unknown_municipality', index, venueId: venue.id, municipalityCode: venue.municipalityCode });
      continue;
    }
    validVenues.push(venue);
  }

  const venuesByMunicipality = new Map();
  for (const venue of validVenues) {
    const current = venuesByMunicipality.get(venue.municipalityCode) || [];
    current.push(venue);
    venuesByMunicipality.set(venue.municipalityCode, current);
  }

  const resultMunicipalities = [...byCode.values()].map(municipality => {
    const localVenues = venuesByMunicipality.get(municipality.ineCode) || [];
    const padel = localVenues.filter(isMajorPadel);
    const football = localVenues.filter(venue => isQualifiedFootball(venue, localVenues));
    const tennis = localVenues.filter(isSignificantMunicipalTennis);
    const candidateFootball = localVenues.some(venue =>
      supportsSport(venue, 'football') && hasQualification(venue, 'FOOTBALL_STADIUM') && football.length === 0
    );
    const tennisCandidate = localVenues.some(venue =>
      supportsSport(venue, 'tennis') && venue.venueType === 'polideportivo' && tennis.length === 0
    );
    const status = (qualified, candidate) => qualified
      ? 'QUALIFIED_VENUE_IDENTIFIED'
      : candidate ? 'CANDIDATE_NOT_QUALIFIED' : 'NOT_ASSESSED';
    return {
      ...municipality,
      sportsCoverage: {
        padel: status(padel.length, localVenues.some(v => supportsSport(v, 'padel'))),
        football: status(football.length, candidateFootball),
        tennis: status(tennis.length, tennisCandidate)
      },
      venues: localVenues.map(venue => {
        const qualificationStatuses = [];
        if (isMajorPadel(venue)) qualificationStatuses.push('QUALIFIED_MAJOR_PADEL');
        if (isQualifiedFootball(venue, localVenues)) qualificationStatuses.push('QUALIFIED_FOOTBALL_STADIUM');
        if (isSignificantMunicipalTennis(venue)) qualificationStatuses.push('QUALIFIED_MUNICIPAL_TENNIS');
        return {
          ...venue,
          qualificationStatuses: qualificationStatuses.length ? qualificationStatuses : ['CANDIDATE_REQUIRES_REVIEW'],
          qualificationStatus: qualificationStatuses.length ? qualificationStatuses.join('+') : 'CANDIDATE_REQUIRES_REVIEW'
        };
      })
    };
  });

  return {
    schemaVersion: '1.0.0',
    projectId: 'ILL-FUERZA-ES',
    generatedAt: new Date().toISOString(),
    municipalities: resultMunicipalities,
    summary: {
      municipalitiesRepresented: resultMunicipalities.length,
      qualifiedPadelVenues: resultMunicipalities.reduce((n, m) => n + m.venues.filter(v => v.qualificationStatuses?.includes('QUALIFIED_MAJOR_PADEL')).length, 0),
      qualifiedFootballStadiums: resultMunicipalities.reduce((n, m) => n + m.venues.filter(v => v.qualificationStatuses?.includes('QUALIFIED_FOOTBALL_STADIUM')).length, 0),
      qualifiedTennisVenues: resultMunicipalities.reduce((n, m) => n + m.venues.filter(v => v.qualificationStatuses?.includes('QUALIFIED_MUNICIPAL_TENNIS')).length, 0),
      municipalitiesWithQualifiedPadel: resultMunicipalities.filter(m => m.sportsCoverage.padel === 'QUALIFIED_VENUE_IDENTIFIED').length,
      municipalitiesWithQualifiedFootball: resultMunicipalities.filter(m => m.sportsCoverage.football === 'QUALIFIED_VENUE_IDENTIFIED').length,
      municipalitiesWithQualifiedTennis: resultMunicipalities.filter(m => m.sportsCoverage.tennis === 'QUALIFIED_VENUE_IDENTIFIED').length
    },
    errors
  };
}

export function buildRainwaterBrandRecord(input) {
  if (!input || typeof input !== 'object') throw new Error('RainWater brand input is required');
  if (!nonEmpty(input.projectId) || !nonEmpty(input.municipalityCode) ||
      !nonEmpty(input.venueId) || !nonEmpty(input.venueName)) {
    throw new Error('project, municipality and venue identity are required');
  }
  if (!nonEmpty(input.batchId) || !nonEmpty(input.harvestedAt)) {
    throw new Error('batchId and harvestedAt are required');
  }
  if (!Number.isFinite(Date.parse(input.harvestedAt)) ||
      !finite(input.coordinates?.latitude) || input.coordinates.latitude < -90 || input.coordinates.latitude > 90 ||
      !finite(input.coordinates?.longitude) || input.coordinates.longitude < -180 || input.coordinates.longitude > 180) {
    throw new Error('valid harvest timestamp and venue coordinates are required');
  }
  if (!VALID_FORMATS.includes(input.productFormat)) throw new Error('productFormat must be BOTTLE or CAN');
  if (!nonEmpty(input.brandName)) throw new Error('brandName is required');
  if (!VALID_DMRV_STATES.includes(input.dmrvStatus)) throw new Error('invalid dmrvStatus');
  return {
    schemaVersion: '1.0.0',
    projectId: input.projectId,
    branding: {
      municipalityCode: input.municipalityCode,
      venueId: input.venueId,
      venueName: input.venueName,
      brandName: input.brandName,
      productFormat: input.productFormat
    },
    provenance: {
      batchId: input.batchId,
      harvestEventId: input.harvestEventId || null,
      harvestedAt: input.harvestedAt,
      coordinates: { latitude: input.coordinates.latitude, longitude: input.coordinates.longitude },
      dmrvStatus: input.dmrvStatus
    },
    claims: {
      waterQualityStatus: 'PENDING_QMS_REVIEW',
      verifiedClimateClaim: false,
      carbonCreditIssued: false,
      productReleaseStatus: 'NOT_RELEASED'
    }
  };
}
