export type IllovedizaMunicipality = {
  ineCode: string;
  name: string;
  provinceCode: string;
  provinceName: string;
  autonomousCommunityCode: string;
  autonomousCommunityName: string;
  [key: string]: unknown;
};

export type IllovedizaVenue = {
  id: string;
  municipalityCode: string;
  name: string;
  sport: "padel" | "football" | "tennis";
  sports?: Array<"padel" | "football" | "tennis">;
  venueType?: string;
  latitude: number;
  longitude: number;
  qualification?: string;
  qualifications?: string[];
  [key: string]: unknown;
};

export function buildMunicipalSportsRegistry(
  municipalities: IllovedizaMunicipality[],
  venues?: IllovedizaVenue[]
): {
  schemaVersion: "1.0.0";
  projectId: "ILL-FUERZA-ES";
  generatedAt: string;
  municipalities: Array<IllovedizaMunicipality & {
    sportsCoverage: { padel: string; football: string; tennis: string };
    venues: Array<IllovedizaVenue & { qualificationStatus: string; qualificationStatuses: string[] }>;
  }>;
  summary: {
    municipalitiesRepresented: number;
    qualifiedPadelVenues: number;
    qualifiedFootballStadiums: number;
    qualifiedTennisVenues: number;
    municipalitiesWithQualifiedPadel: number;
    municipalitiesWithQualifiedFootball: number;
    municipalitiesWithQualifiedTennis: number;
  };
  errors: Array<Record<string, unknown>>;
};
