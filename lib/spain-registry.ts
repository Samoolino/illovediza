import { readFile } from "node:fs/promises";
import { join } from "node:path";

export type SpainMunicipality = {
  municipalityId: string;
  ineCode: string;
  name: string;
  provinceCode: string;
  provinceName: string;
  autonomousCommunityCode: string;
  autonomousCommunityName: string;
  countryCode: "ES";
  reportingNodeStatus: "ADMINISTRATIVE_REFERENCE";
  venueAssessmentStatus: string;
  sportsCoverage: { padel: string; football: string; tennis: string };
  venues: unknown[];
  geometryStatus: string;
};

type RegistryIndex = {
  schemaVersion: string;
  projectId: string;
  referenceCounts: {
    autonomousCommunities: number;
    autonomousCities: number;
    provinces: number;
    municipalities: number;
  };
  files: Array<{ path: string; autonomousCommunityCode: string; count: number }>;
  source: Record<string, unknown>;
};

export async function loadSpainMunicipalities(): Promise<{
  index: RegistryIndex;
  municipalities: SpainMunicipality[];
}> {
  const root = process.cwd();
  const index = JSON.parse(
    await readFile(join(root, "data/spain/municipalities/index.json"), "utf8")
  ) as RegistryIndex;

  if (index.projectId !== "ILL-FUERZA-ES" || !Array.isArray(index.files)) {
    throw new Error("Invalid Illovediza Spain registry index");
  }

  const groups = await Promise.all(index.files.map(async (file) => {
    const payload = JSON.parse(await readFile(join(root, file.path), "utf8")) as {
      projectId: string;
      autonomousCommunityCode: string;
      municipalities: SpainMunicipality[];
    };
    if (payload.projectId !== index.projectId ||
        payload.autonomousCommunityCode !== file.autonomousCommunityCode ||
        !Array.isArray(payload.municipalities) ||
        payload.municipalities.length !== file.count) {
      throw new Error(`Invalid municipality partition: ${file.path}`);
    }
    return payload.municipalities;
  }));

  const municipalities = groups.flat();
  const codes = municipalities.map((item) => item.ineCode);
  if (municipalities.length !== index.referenceCounts.municipalities ||
      new Set(codes).size !== codes.length ||
      codes.some((code) => !/^\d{5}$/.test(code))) {
    throw new Error("Spain municipal registry failed count, uniqueness or INE-code validation");
  }

  return { index, municipalities };
}

export async function loadSpainSportsVenues(): Promise<{
  schemaVersion: string;
  projectId: string;
  venues: Array<Record<string, unknown>>;
  sourcePolicy: string;
}> {
  return JSON.parse(
    await readFile(join(process.cwd(), "data/spain/sports-venues.json"), "utf8")
  );
}
