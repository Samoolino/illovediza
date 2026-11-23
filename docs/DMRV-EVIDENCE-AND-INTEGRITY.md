# Illovediza dMRV, evidence and cryptographic integrity

## 1. Shared dMRV, project-specific measurables

Illovediza uses the same evidence principles and lifecycle as OMI-OJO, but its project profile defines its own sports, venue, activity and ESG indicators. Common contracts are shared; project facts, baselines, measurements and claims are isolated.

## 2. Canonical lifecycle

```
Governance / authorization
 → project, venue, node and source registration
 → activity / observation / measurement
 → quality control
 → reconciliation
 → calculation / methodology application
 → deterministic evidence package
 → independent review
 → DMRV status
 → cryptographic integrity anchor
 → institutional / municipal report
 → milestone acceptance and release
```

Controlled states:
`DESIGNED`, `IMPLEMENTED`, `INTEGRATION_READY`, `CONTROLLED_TEST`, `REPORTABLE`, `VALIDATED`, `VERIFIED`, `ANCHORED`, `RELEASED`, `HOLD`, `DEFERRED`.

Evidence classes:
`OBSERVED | FORECAST | MODELLED | SATELLITE | CALCULATED | PROXY`.

Never promote forecast/modelled/proxy data to observed measurements. Missing values remain missing with a reason; they are not silently converted to zero.

## 3. Minimum evidence envelope

Each record/package carries:
- `evidence_id`, `project_id`, schema version and immutable record version;
- venue/site/node/event/municipality identifiers where applicable;
- source/provider and original source-record reference;
- observation time and retrieval/ingestion time;
- geographic reference, spatial support, CRS and boundary release;
- variable, value, unit, evidence class and acquisition method;
- instrument identity/calibration or activity-data owner where relevant;
- methodology/formula/version, baseline and factor references;
- QC flags, reconciliation state, missingness and uncertainty;
- parent/derived evidence references;
- canonicalization version and SHA-256 package/evidence root;
- reviewer identity/role, decision, timestamp and rationale;
- visibility, retention, release and supersession metadata.

## 4. Cryptographic harvest and reporting

The term "cryptographic harvest" means that each approved reporting period produces a deterministic evidence package from the underlying source records and calculations. The package is canonicalized and hashed. Its hash/root can be committed to an approved blockchain or timestamping network, and an independent verifier later retrieves the proof and recomputes the root.

```
Sports venue / approved instrument / event
       ↓
source observations + activity data
       ↓
immutable off-chain evidence store
       ↓
QC + reconciliation + calculations
       ↓
period-specific evidence package
       ↓
canonical serialization + SHA-256 root
       ↓
authorized anchor submission
       ↓
network receipt + independent readback
       ↓
root comparison + verification result
       ↓
released report references the exact package
```

The blockchain stores integrity commitments and minimal proof metadata, not raw telemetry, personal data, confidential venue information or full evidence payloads. A transaction proves that a particular commitment was recorded; it does not prove the environmental/social claim is true.

## 5. Project identity and cross-project reporting

All packages must be bound to `project_id=ILL-FUERZA-ES`. OMI-OJO portfolio reporting may index Illovediza package references and status, but cannot combine Illovediza evidence values with OMI-OJO project evidence as if they were one dataset. Cross-project comparison requires explicit comparable indicator definitions, compatible units, time periods, methodology and permission.

## 6. GHG and social impact boundaries

GHG reports require a defined organizational/operational boundary, activity data, scope classification, emission factor source/version/year, calculation, uncertainty and review. Venue energy, water, waste and travel activity may be inputs; they are not reductions by themselves.

Social impact reporting requires defined populations, denominators, period, participation methodology, consent/legal basis, safeguarding, privacy controls and disaggregation limits. Avoid publishing identifiable participant-level data.

Carbon-credit claims require a separate eligible methodology and full baseline/additionality/monitoring/validation/verification/registry pathway. No token or credit is automatically minted from an event, sensor, report or anchor.

## 7. Release gates

- G0: project and indicator definitions approved.
- G1: source, venue, node and permissions validated.
- G2: data quality, provenance and reconciliation pass.
- G3: calculations/methodology and uncertainty reviewed.
- G4: independent reviewer accepts the evidence package.
- G5: anchor proof independently read back and matched (where anchoring is in scope).
- G6: public/institutional release authorization and claim review.

Any mismatch, stale source, unauthorized collection, missing critical evidence or invalid proof sets the package to HOLD.
