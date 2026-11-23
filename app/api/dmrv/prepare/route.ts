import { NextRequest, NextResponse } from "next/server";
import { buildIllovedizaEvidencePackage } from "@/src/dmrv/omi-ojo-contract.mjs";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (process.env.ILL_FUERZA_DMRV_PREPARE_ENABLED !== "true") {
    return NextResponse.json({
      error: "DMRV package preparation is not enabled in this deployment",
      status: "DISABLED"
    }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const input = await request.json();
    const result = buildIllovedizaEvidencePackage(input);
    return NextResponse.json({
      schemaVersion: "BE-EVIDENCE-1.0",
      projectId: "ILL-FUERZA-ES",
      package: result.package,
      evidenceRoot: result.evidenceRoot,
      status: "PACKAGE_PREPARED_NOT_PERSISTED",
      anchorStatus: result.anchorStatus,
      integration: result.integration,
      warning: "This endpoint prepares a deterministic package only. It does not persist observations, submit to OMI-OJO, anchor a blockchain transaction, verify an environmental claim or authorize product release."
    }, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({
      error: "Invalid DMRV package input",
      detail: error instanceof Error ? error.message : "unknown_package_error"
    }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
}
