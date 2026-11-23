export type MunicipalReportMunicipality = {
  ineCode: string;
  name: string;
  municipalityId?: string;
  provinceName?: string;
  autonomousCommunityName?: string;
};
export type MunicipalReportFactor = {
  value: number | null;
  unit: string | null;
  status: string;
  evidenceClass: string | null;
  limitations: string[];
};
export type MunicipalReportEnvelope = {
  schemaVersion: string;
  projectId: 'ILL-FUERZA-ES';
  reportId: string;
  reportType: string;
  reportStatus: string;
  generatedAt: string;
  geography: { ineCode: string; municipalityId: string; name: string; province: string | null; autonomousCommunity: string | null };
  sourceStatus: Record<string, string | number>;
  report: {
    factors: Record<string, MunicipalReportFactor>;
    claims: { verifiedClimateClaim: boolean; carbonCreditStatus: string; carbonCreditIssued: boolean; productReleaseStatus: string };
    limitations: string[];
  };
  warnings: string[];
};
export function buildMunicipalReportEnvelope(input: {
  municipality: MunicipalReportMunicipality;
  generatedAt?: string;
  aquaDmrVStatus?: 'NOT_CONNECTED' | 'CONNECTED' | 'DEGRADED' | 'ERROR';
  geometryStatus?: string;
  activeVenueCount?: number;
  osmDiscoveryCandidateCount?: number;
  officialVenueLeadCount?: number;
  spatialCrosswalkStatus?: 'NOT_LOADED' | 'NOT_VERIFIED_IGN_GEOMETRY_NOT_INGESTED' | 'VERIFIED_IGN_POINT_IN_POLYGON';
}): MunicipalReportEnvelope;
