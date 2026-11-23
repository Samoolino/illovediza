# OMI-OJO DMRV contract compatibility

## Contract owner and project owner

- **Illovediza** owns Spain-specific municipal identity, sports venues, event/site records, RainWater operations, project indicators, source data, product batches and Spain reporting.
- **OMI-OJO** owns the shared canonical evidence semantics, quality/reconciliation and assurance lifecycle, deterministic evidence contract and chain-neutral anchor-verification model.
- Illovediza does not copy OMI-OJO project measurements or inherit Lagos values. Only the schema and assurance semantics are shared.

## Canonical evidence package

The Illovediza adapter emits the same field names and deterministic root semantics as OMI-OJO's `src/production/evidence_anchor.py` and `src/production/provenance.py`:

```json
{
  "content_hashes": [],
  "created_at": "ISO-8601",
  "evidence_class": "OBSERVED",
  "evidence_id": "ILL-ES-...",
  "event_site_refs": [],
  "geography_ref": "ES-MUNI-28079",
  "methodology_ref": "ILL-METHOD-1.0",
  "observation_refs": [],
  "observation_window": {},
  "parent_evidence": [],
  "project_id": "ILL-FUERZA-ES",
  "quality_state": "REPORTABLE",
  "schema_version": "BE-EVIDENCE-1.0",
  "source_refs": [],
  "status": "REPORTABLE"
}
```

The canonical serialization is UTF-8 JSON with recursively sorted object keys, compact separators and no ASCII escaping. SHA-256 is calculated over those exact bytes. Reference arrays are sorted before hashing. This matches OMI-OJO's Python `canonical_json` and `evidence_root` implementation.

## Compatibility test vector

The Illovediza test suite includes the OMI-OJO Python `EVID-001` test vector and expects:

`cf705408f5e5f0695aec0c5d65ceb03237e16fcea7cf523f4b024811b64ea0d2`

The OMI-OJO repository also contains `src/production/illovediza_adapter.py`, which accepts only `project_id=ILL-FUERZA-ES`, reconstructs the canonical package through the shared OMI-OJO builder and rejects a mismatched root. This is a local contract adapter, not a deployed HTTP service.

## Illovediza-specific evidence references

Use official municipal codes and stable venue/site/event identities:
- `geography_ref`: `ES-MUNI-{INE_CODE}`, plus venue/site reference where applicable;
- `event_site_refs`: qualified sports venue, authorized catchment and rain-event identifiers;
- `source_refs`: climate provider record, meter record, official municipal report, custody/QMS source;
- `observation_refs`: observed rainfall, meter reading, laboratory/QMS result, activity observation;
- `methodology_ref`: versioned rainfall-yield, GHG, social or governance method;
- `content_hashes`: hashes of retained source artifacts, reports and evidence files.

## Status and claim boundaries

The local package generator returns `anchorStatus=NOT_SUBMITTED` and `submissionStatus=NOT_CONNECTED`. The OMI-OJO adapter returns `ACCEPTED_FOR_SHARED_DMRV` only after local canonical-schema and root checks. Neither state means the evidence has been independently verified or anchored.

A blockchain anchor is a separate operation after reconciliation and review. It proves that a particular root was committed; it does not prove environmental truth, water quality, product release, GHG reductions, additionality or carbon-credit eligibility.

## Runtime integration status

- [x] Illovediza TypeScript canonical package generator.
- [x] Cross-language SHA-256 compatibility test against OMI-OJO's Python vector.
- [x] OMI-OJO local acceptance adapter for Illovediza packages.
- [ ] Durable evidence-object storage and immutable observation persistence.
- [ ] Authenticated runtime transport from Illovediza to an OMI-OJO deployed service.
- [ ] OMI-OJO acceptance receipt and audit event returned to Illovediza.
- [ ] Independent anchor submission/readback and product/report release gates.

Do not claim a live OMI-OJO API connection until an authenticated service endpoint, persistence store, request/response schema and end-to-end acceptance test are deployed.
