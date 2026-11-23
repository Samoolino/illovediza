# Illovediza dMRV, evidence and cryptographic integrity

## 1. Shared dMRV, project-specific measurables

Illovediza uses the same evidence principles and lifecycle as OMI-OJO, but its project profile defines its own sports, venue, RainWater, climate, GHG, social and governance indicators. Common contracts are shared; project facts, baselines, measurements and claims are isolated.

## 2. Canonical lifecycle

```
Governance / authorization
 → project, municipality, venue and source registration
 → sports engagement / activity / observation / measurement
 → quality control
 → reconciliation
 → calculation / methodology application
 → deterministic evidence package
 → independent review
 → DMRV status
 → cryptographic integrity anchor
 → municipal / institutional / product report
 → product or finance release decision
```

Controlled states: `DESIGNED`, `IMPLEMENTED`, `INTEGRATION_READY`, `CONTROLLED_TEST`, `REPORTABLE`, `VALIDATED`, `VERIFIED`, `ANCHORED`, `RELEASED`, `HOLD`, `DEFERRED`.

Evidence classes: `OBSERVED | FORECAST | MODELLED | SATELLITE | CALCULATED | PROXY | DOCUMENTARY`. Never promote forecast/modelled/proxy data to observed measurements. Missing values remain missing with a reason; they are not silently converted to zero.

## 3. Municipal RainWater product provenance

Each released product batch links:
- project ID, municipality code/name and official administrative version;
- venue ID/name, operator, WGS84 venue coordinates and site permission;
- catchment/roof ID, area, material/condition and runoff methodology;
- rainfall event, observed source, instrument identity and timestamp;
- first-flush event and diversion evidence;
- measured collection volume and calibrated meter;
- sample ID, chain of custody, laboratory, methods and QMS result;
- batch ID, seal ID, packaging/product format and release decision;
- evidence package ID, schema/canonicalization version and SHA-256 root;
- reviewer, approval, timestamps and applicable regulatory/product release.

A bottle or can label may carry the municipality and Polideportivo/sports-complex brand, actual venue coordinates or a QR link to the batch evidence record. Do not publish personal data, sensitive site details or non-public security coordinates.

## 4. Cryptographic harvest and reporting

Each approved reporting period produces a deterministic evidence package from source records and calculations. The package is canonicalized and hashed. Its hash/root can be committed to an approved blockchain or timestamping network; an independent verifier later retrieves the proof and recomputes the root.

```
venue / authorized catchment / measured instrument / rain event
       ↓
source observations + activity data + custody / QMS records
       ↓
immutable off-chain evidence store
       ↓
QC + reconciliation + calculations + release gates
       ↓
period / batch evidence package
       ↓
canonical serialization + SHA-256 root
       ↓
authorized anchor submission
       ↓
network receipt + independent readback
       ↓
root comparison + verification result
       ↓
municipal report / product batch dossier
```

The blockchain stores integrity commitments and minimal proof metadata, not raw telemetry, personal data, confidential venue information or full evidence payloads. A transaction proves that a commitment was recorded; it does not prove water quality, environmental benefit, additionality, legal compliance or credit eligibility.

## 5. Municipal climate-finance boundary

Potential municipal climate-finance opportunities may arise from eligible, measured and independently verified activity associated with venue operations, energy, water, waste, transport or other applicable methodologies. Each proposed instrument requires a defined boundary; baseline and counterfactual where applicable; activity data and measurement method; additionality where required; emission factors and source/version; uncertainty/leakage/permanence treatment where relevant; independent validation/verification; and registry, legal, accounting and governance acceptance.

A sports venue, RainWater bottle, rainfall estimate, ESG dashboard or cryptographic hash does not create a carbon credit. Tokenization and financial instruments remain a separate legally reviewed workstream.

## 6. Release gates

- G0: project, venue, indicator and methodology definitions approved.
- G1: municipality/venue/source and permissions validated.
- G2: data quality, provenance and reconciliation pass.
- G3: calculations, catchment assumptions and uncertainty reviewed.
- G4: physical water chain, custody, QMS, batch and seal accepted where product applies.
- G5: independent reviewer accepts evidence package.
- G6: anchor proof independently read back and matched where anchoring is in scope.
- G7: product, public report or finance claim receives its own release authorization.

Any mismatch, stale source, unauthorized collection, missing critical evidence or invalid proof sets the package to HOLD.
