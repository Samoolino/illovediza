# AquaDMRV integration profile — Illovediza Fuerza

**Project ID:** `ILL-FUERZA-ES`  
**Deployment:** Spain municipal sports-venue RainWater network  
**Shared engine intended:** [AquaDMRV](https://github.com/Samoolino/AquaDMRV)  
**Project profile:** `config/aquadmrv/illovediza-project-profile.json`

## 1. Repository access and implementation boundary

The supplied AquaDMRV URL currently returns GitHub `404 Not Found` for repository metadata, README and contents. Its code, schemas, branches, tests and runtime contracts therefore could not be inspected. This document is the Illovediza-side project profile and an integration requirement, **not evidence that an AquaDMRV runtime connection exists**.

Before implementation against AquaDMRV, make the repository readable to the connected GitHub integration or provide the correct accessible repository URL. Then inspect its actual package structure, evidence schemas, API routes, event transport, persistence model, signer/key handling, chain adapters, QMS logic and tests. Adapt the project profile to those real contracts; do not create competing endpoints or duplicate ledgers.

## 2. Ownership boundaries

| Repository | Owns | Must not become |
|---|---|---|
| AquaDMRV | Shared physical-water evidence, telemetry validation, QMS/batch assurance, canonical evidence, cryptographic anchoring/readback, climate-accounting controls | Spain sports directory or Illovediza product website |
| Illovediza | Spain product identity, INE municipal references, qualified sports venues, harvest-site authorization, project methodology profile, municipal product and batch views | A second shared DMRV engine or shadow evidence ledger |
| R | Geospatial discovery and display, municipal comparisons, climate context, report rendering, exports and spatial analysis | The source of truth for venue identity, lab results, harvest observations or carbon-credit issuance |

Illovediza and R must consume versioned, access-controlled AquaDMRV evidence services. R remains a reporting consumer. It must not silently recompute or rewrite canonical water evidence.

## 3. Physical-to-digital proof chain

The canonical physical evidence chain is:

1. **Municipal identity:** official five-digit INE code, municipality, province, autonomous community and versioned IGN boundary release.
2. **Venue identity:** canonical venue ID, source-backed geotag, sport affiliations, operator/owner and municipal relationship evidence.
3. **Authorization:** venue-owner/Ayuntamiento permission, catchment approval, installation and access rights.
4. **Catchment identity:** roof/catchment geometry, material, drainage path, area, first-flush arrangement, tank and transfer equipment.
5. **Rain event:** source, station/device ID, temporal type, observed period, retrieval time, quality flags and event correlation.
6. **Physical harvest:** calibrated meter ID, calibration validity, meter start/end, measured litres, first-flush diversion, tank level, overflow, losses and tamper/sequence state.
7. **Sampling and custody:** sample ID, collection point/time, collector, preservation, seal, transfer, receipt, laboratory and custody exceptions.
8. **Treatment and QMS:** validated process, operating records, approved specification version, laboratory results, deviations, corrective actions and batch decision.
9. **Product batch:** fill line, batch/lot, quantity, container format, packaging material, seal, label, QR/public record and mass balance.
10. **Evidence package:** immutable observation references, source hashes, method versions, canonical serialization, signatures, SHA-256 digest and review receipt.
11. **Blockchain commitment:** transaction/network, block number/time, Merkle root or evidence commitment and independent readback.
12. **Climate report:** activity data, baseline, methodology, emission factors, project emissions, uncertainty, leakage, double-counting controls and independent verification state.

A rainfall forecast or modelled rainfall value is context. It cannot prove collection. A meter reading proves only what the instrument reported; calibration, site identity, tamper controls, mass balance and independent review remain necessary.

## 4. Real-time event stream and blockchain model

### Event transport

AquaDMRV's existing broker/protocol must be inspected before implementation. The project requires authenticated TLS transport, schema validation, stable event IDs, device sequence numbers, duplicate suppression, replay support, device identity and key lifecycle management.

A canonical event must be able to represent:

- project, municipality, venue, catchment, tank and device identifiers;
- event type and immutable event ID;
- device-observed time, server-received time and later blockchain block time as separate values;
- sensor/meter value, unit, calibration reference and quality state;
- sequence number, payload hash, device signature and ingestion receipt;
- source provenance, uncertainty and any tamper/replay flags.

### Cryptographic design requirements

- Canonicalize event payloads before hashing.
- Authenticate devices and ingestion services separately.
- Preserve original signed observations; corrections are new, linked events, not edits.
- Build deterministic evidence packages and Merkle commitments.
- Anchor evidence commitments to the selected chain under a documented cadence and finality policy.
- Read the commitment independently from the chain and compare it with the original evidence root.
- Keep raw telemetry, commercial secrets and personal data off-chain; anchor only the minimum non-sensitive commitment and references needed for verification.

**Real-time streaming is not the same as every raw sensor message becoming an individual blockchain transaction.** The required design is immediate authenticated ingestion and immutable off-chain retention, with configurable frequent cryptographic commitments/anchors. This reduces cost and avoids exposing raw telemetry while retaining independent tamper evidence. Any delay between event time and block time must remain visible.

Blockchain inclusion does not prove a sensor was calibrated, a site actually harvested rainwater, a laboratory result is valid or a product is safe.

## 5. Product quality management and batch release

Rainwater is not automatically a lawful bottled drinking-water product because it was collected, filtered or cryptographically recorded.

The legal product classification and competent-authority route must be established before a pilot sells or labels water for human consumption. Spain's Real Decreto 1799/2010 defines prepared packaged drinking waters as waters other than natural mineral and spring waters, with potentially any origin, subjected to the authorized physicochemical treatments needed to meet potability requirements. Its applicability and the exact treatment/authorization pathway for the proposed rainwater source require written regulatory confirmation.

The QMS profile must select a legally applicable, versioned specification; it must not hard-code a generic list of "minimum bottle parameters" divorced from the product classification and current law.

### Batch state machine

`DRAFT → FILLING → QUARANTINED → LAB_PENDING → QA_HOLD / READY_FOR_AUTHORIZED_RELEASE_REVIEW → RELEASED / REJECTED`

A released batch must have all applicable gates passed:

- legal classification, food-business-operator and facility authorization;
- approved source/catchment and water-safety risk assessment;
- validated treatment and hygienic filling process;
- current sampling plan and documented chain of custody;
- laboratory identity and accreditation scope appropriate to the tests;
- every mandatory parameter present, within the applicable versioned limits and linked to the correct sample/batch;
- no unresolved critical deviation, adverse result, stale result or missing required test;
- container/closure and food-contact-material compliance;
- packaging and labelling review, lot identification and recall traceability;
- batch volume/mass-balance reconciliation;
- named, authorized human QA release decision and audit record.

A batch with any missing mandatory result, failed limit, broken custody link, invalid lab scope or unresolved critical deviation must be placed on `QA_HOLD`. A blockchain anchor must never override this state.

### Regulatory references to configure in the QMS

- Spain [Real Decreto 1799/2010](https://www.boe.es/eli/es/rd/2010/12/30/1799/con) — prepared packaged drinking waters; any-origin waters subject to authorized treatment.
- Spain [Real Decreto 3/2023](https://www.boe.es/eli/es/rd/2023/01/10/3/con) — drinking-water quality, control and supply; check its scope and exclusions against the selected bottled-water category.
- EU [Directive (EU) 2020/2184](https://eur-lex.europa.eu/eli/dir/2020/2184/oj) — drinking-water risk-based approach and parametric requirements.
- EU [Regulation (EU) 2025/40](https://eur-lex.europa.eu/eli/reg/2025/40/oj) — packaging and packaging waste; applies from 12 August 2026, with phased obligations.
- Food hygiene/HACCP and food-contact-material requirements must be mapped into the selected operator and product route.

This is an engineering requirements profile, not a legal opinion or authorization to bottle/sell rainwater.

## 6. Climate-accounting and carbon-finance state

"Carbonized state" is implemented as a **carbon-accounted evidence state**, not as an assumption that rainwater harvesting automatically removes or avoids CO2.

The engine must separately measure and retain:

- project boundary, baseline and methodology/version;
- rainfall and measured harvested/treatment volumes;
- electricity and fuel for pumping, filtration, treatment, chilling and bottling;
- container materials, mass, recycled content, closures, labels and end-of-life assumptions;
- packaging, transport and distribution activity;
- waste, rejected batches, wastewater and treatment residuals;
- applicable emission-factor source, version, geography, year and uncertainty;
- project emissions, baseline emissions, leakage, net impact and uncertainty;
- additionality where required, permanence where relevant, double-counting controls and registry status.

Potential water-resource benefits, avoided runoff and municipal resilience are separate indicators unless a recognized methodology supports their conversion into quantified climate claims. A bottle, product sale, municipal venue or anchored hash is not a carbon credit.

Climate claim states are separate from product quality and chain anchoring: `NOT_ASSESSED → ELIGIBILITY_SCREENING → METHODOLOGY_SELECTED → BASELINE_APPROVED → MONITORING_ACTIVE → INDEPENDENT_VERIFICATION_PENDING → VERIFIED → CREDIT_ISSUED → CREDIT_RETIRED`.

## 7. Reporting ownership and automation

Illovediza project reports must read AquaDMRV's canonical evidence references and expose:
- evidence class: observed, calculated, modelled or documentary;
- source and retrieval freshness;
- measurement period and unit;
- quality state, completeness and uncertainty;
- method/specification version;
- batch and product release state;
- cryptographic commitment and independent readback state;
- reviewer, decision and audit trail;
- climate-finance eligibility state without implying issuance.

R can produce municipal, provincial, autonomous-community and Spain-wide map/report views from the same versioned data. Its scheduled reports must state the last successful ingestion, missing feeds, freshness window, unverified claims and any rejected/held batches. It must not turn stale or missing data into zero.

Report automation is only "live" when the scheduler, data source, persistence and last-run audit are configured and observable. UI refresh alone is not a reporting pipeline.

## 8. Integration acceptance gates

- [ ] AquaDMRV repository access restored and architecture/code inspected.
- [ ] Project profile mapped to real AquaDMRV schemas and versioned APIs.
- [ ] Authenticated event-stream integration tested with duplicate, replay, invalid-signature and stale-calibration cases.
- [ ] Physical harvest event validated against site authorization, calibrated meter, catchment, first-flush and tank records.
- [ ] Water-quality/QMS batch state machine and mandatory parameter specification reviewed by Spanish regulatory/food-safety specialists.
- [ ] Failed/missing laboratory results keep the batch on HOLD.
- [ ] Evidence package is deterministic, signed, hashed and independently reproducible.
- [ ] Blockchain commitment is independently read back and matches the package root.
- [ ] GHG baseline, methodology, activity data, uncertainty and verification workflow pass review.
- [ ] Illovediza and R consume the same evidence IDs, methodology versions and status definitions.
- [ ] Scheduled reports persist run receipts and report data freshness/missingness.
- [ ] Production secrets, signing keys, retention, access control, incident response and recovery are reviewed.

No live AquaDMRV connection, real-time chain anchoring, physical harvest, approved water batch or carbon credit is claimed until the corresponding acceptance evidence exists.
