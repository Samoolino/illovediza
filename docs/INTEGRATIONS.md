# Integration contracts

## OMI-OJO — shared DMRV

Home: https://github.com/Samoolino/OMI-OJO

OMI-OJO is the shared evidence and assurance backbone. Illovediza calls versioned DMRV interfaces through an adapter. Integration must preserve project namespace, schema version, source provenance, evidence classes, review states and release gates. Until a stable deployed API is confirmed, treat this as a contract-first integration; do not invent production endpoints.

Required operations (logical contract):
- register project profile and indicator/methodology versions;
- register source, venue/site and measurement node references;
- submit immutable observation/activity records;
- request QC/reconciliation and deterministic package generation;
- retrieve review and release status;
- submit/verify integrity anchor proof references;
- retrieve authorized report/evidence index.

## R — maps and reporting

Home: https://github.com/Samoolino/R

Reuse R's geography discovery, climate adapters, map patterns and export contracts after reviewing the current API and provenance behavior. R's own documentation states that its global catalogue is a navigation foundation, not a verified complete worldwide municipal database; point climate proxies are not area-weighted municipal climate.

Potential service boundaries:
- geography and boundary discovery;
- geocoding and venue search;
- climate/context data with provider provenance;
- map tiles/layers and spatial exports;
- Unity/Unreal/BI integration bundles.

All data imported from R retains provider, retrieval time, observation/model class, spatial support, licence and quality state. Mapbox is optional and requires a restricted token. MapLibre and OpenStreetMap are alternatives subject to data/style/attribution requirements.

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
