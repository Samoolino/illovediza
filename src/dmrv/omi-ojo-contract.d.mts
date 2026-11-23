export type IllovedizaEvidencePackageInput = {
  evidenceId: string;
  evidenceClass: string;
  sourceRefs: string[];
  observationRefs: string[];
  eventSiteRefs: string[];
  methodologyRef: string;
  qualityState: string;
  createdAt: string;
  observationWindow?: Record<string, string> | null;
  geographyRef: string;
  contentHashes: string[];
  parentEvidence?: string[];
  status?: string;
};

export function buildIllovedizaEvidencePackage(input: IllovedizaEvidencePackageInput): {
  package: Record<string, unknown>;
  evidenceRoot: string;
  anchorStatus: "NOT_SUBMITTED";
  integration: {
    contractOwner: "OMI-OJO";
    compatibility: "OMI_OJO_CANONICAL_EVIDENCE_PACKAGE";
    submissionStatus: "NOT_CONNECTED";
  };
};
