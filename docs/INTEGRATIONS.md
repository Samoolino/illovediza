# Integration contracts

## AquaDMRV — primary water/harvest DMRV engine

Home: https://github.com/Samoolino/AquaDMRV

AquaDMRV is the designated system of record for authenticated water/harvest event ingestion, immutable observations, source and device trust, quality management, batch decisions, canonical evidence, cryptographic anchoring/readback and climate-accounting assurance. Illovediza owns the Spain-specific project profile, INE/venue identity, product branding, indicator mapping and municipal reports. R is a read-only geospatial and reporting consumer of versioned AquaDMRV evidence.

**Access blocker:** the supplied AquaDMRV repository currently returns GitHub 404 through the connected integration. Its actual contracts, broker, API routes, storage model, key management, chain adapters and QMS services have not been inspected. Do not invent endpoints or enable a speculative runtime client. The local event envelope `AQUADMRV-PROJECT-EVENT-1.0` in `src/dmrv/aquadmrv-project-event.mjs` is implemented and tested, but signature verification, persistence, stream delivery and anchoring are not live.

Required operations after contract inspection:
- register `ILL-FUERZA-ES` project profile and versioned methodology/QMS specifications;
- bind municipal, venue, catchment, device and authorization identities;
- authenticate device/service identities and verify signed events;
- ingest immutable telemetry with sequence/idempotency and replay protection;
- evaluate physical-harvest mass balance, calibration, first-flush and tamper state;
- manage sampling, custody, laboratory results, deviations and batch QA holds/releases;
- create deterministic evidence packages and Merkle commitments;
- submit approved anchors and independently read back/verify the committed root;
- expose authorized evidence references and verification receipts to Illovediza and R.

## OMI-OJO — legacy evidence-contract compatibility

Home: https://github.com/Samoolino/OMI-OJO

The existing `BE-EVIDENCE-1.0` package and Python compatibility test vector are retained as a legacy cross-language schema test. OMI-OJO remains a related evidence/governance platform, not the intended live AquaDMRV water/harvest system of record. The existing OMI-OJO relay is disabled by default and must not be enabled as a substitute for AquaDMRV. No cross-project measurements or Lagos values are inherited by Illovediza.

## R — maps and reporting

Home: https://github.com/Samoolino/R

R owns reusable geospatial discovery, maps, climate/context visualization, municipal comparisons, report rendering and exports. It consumes Illovediza's municipal/venue APIs and, once AquaDMRV is connected, the same authorized, versioned evidence/report contracts. It must not create a shadow evidence ledger, silently recalculate authoritative water-quality states or upgrade claims.

## API and event reliability

Every integration must define:
- OpenAPI/JSON Schema version;
- authentication and least-privilege roles;
- idempotency key and stable request ID;
- retry/backoff and timeout;
- rate limits and quotas;
- source timestamp vs ingestion timestamp;
- error and degraded-mode semantics;
- audit log and trace/correlation ID;
- schema compatibility and deprecation policy.

## Repository delivery

Illovediza remains independently buildable and deployable. Integration tests use contract fixtures and mocks; live integration tests run only with authorized non-production credentials. CI must not require private production secrets.
