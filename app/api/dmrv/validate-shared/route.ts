import { NextRequest, NextResponse } from "next/server";
import { verifyEvidenceRoot } from "@/src/dmrv/omi-ojo-contract.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function configuredBase(value: string | undefined): URL | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  if (process.env.ILL_FUERZA_DMRV_SUBMIT_ENABLED !== "true") {
    return NextResponse.json(
      { error: "Shared DMRV validation is disabled in this deployment", status: "DISABLED" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const base = configuredBase(process.env.OMI_OJO_DMRV_BASE_URL);
  const secret = process.env.OMI_OJO_DMRV_SHARED_SECRET;
  if (!base || !secret) {
    return NextResponse.json(
      { error: "OMI-OJO DMRV integration requires an HTTPS base URL and server-side shared secret", status: "NOT_CONFIGURED" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const raw = await request.text();
    if (raw.length > 262144) {
      return NextResponse.json({ error: "Evidence package exceeds the 256 KB limit" }, { status: 413, headers: { "Cache-Control": "no-store" } });
    }
    const payload = JSON.parse(raw);
    if (!payload?.package || typeof payload.evidenceRoot !== "string" ||
        verifyEvidenceRoot(payload.package, payload.evidenceRoot) !== "MATCHED") {
      return NextResponse.json({ error: "Evidence package root did not pass local verification" }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }

    const endpoint = new URL("/api/integrations/illovediza/evidence", base);
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${secret}`
      },
      body: JSON.stringify({ package: payload.package, evidenceRoot: payload.evidenceRoot }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000)
    });

    const response = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return NextResponse.json({
        error: "OMI-OJO did not validate the Illovediza evidence package",
        upstreamStatus: upstream.status,
        detail: response.detail || response.error || "upstream_validation_failed"
      }, { status: 502, headers: { "Cache-Control": "no-store" } });
    }
    if (response.projectId !== "ILL-FUERZA-ES" ||
        response.evidenceRoot !== payload.evidenceRoot ||
        response.contractStatus !== "VALIDATED_NOT_PERSISTED") {
      return NextResponse.json({ error: "OMI-OJO response identity or contract status mismatch" }, { status: 502, headers: { "Cache-Control": "no-store" } });
    }

    return NextResponse.json({
      ...response,
      relayStatus: "OMI_OJO_CONTRACT_VALIDATED",
      persistenceStatus: "NOT_CONFIGURED",
      warning: "The shared contract was validated by OMI-OJO. Durable storage, reviewer workflow, blockchain anchoring and product release are not performed by this endpoint."
    }, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({
      error: "Could not complete OMI-OJO DMRV validation",
      detail: error instanceof Error ? error.message : "upstream_request_failed"
    }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
