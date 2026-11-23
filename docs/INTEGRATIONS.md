# Integration contracts

## OMI-OJO — shared DMRV

Home: https://github.com/Samoolino/OMI-OJO

OMI-OJO is the shared evidence and assurance backbone. Illovediza calls versioned DMRV interfaces through an adapter. Integration must preserve project namespace, schema version, source provenance, evidence classes, review states and release gates. Illovediza now exposes a server-side relay at `POST /api/dmrv/validate-shared`. It forwards a locally re-hashed `BE-EVIDENCE-1.0` package to OMI-OJO's `POST /api/integrations/illovediza/evidence` intake using a server-side bearer secret. The OMI-OJO intake validates project namespace, schema, canonical serialization and SHA-256 root. This is a stateless contract-validation handshake only: it returns `VALIDATED_NOT_PERSISTED`; it does not store observations/packages, create an audit ledger, run reviewer approval or submit blockchain anchors. Enable only after both deployments have the required environment variables and a live handshake test passes.

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
