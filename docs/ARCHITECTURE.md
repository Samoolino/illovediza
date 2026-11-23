# Architecture — independent product, shared evidence spine

## 1. System context

```text
                 Illovediza Fuerza public + institutional frontend
                                      |
                     Illovediza project application/API
                                      |
          +---------------------------+--------------------------+
          |                           |                          |
 Spain geography & sports       Project-specific             Reporting
 venue registry                 activity/indicator            read models
          |                      configuration                  |
          +---------------------------+--------------------------+
                                      |
                       Versioned project evidence contract
                                      |
                   AquaDMRV shared water / harvest / QMS / cryptographic DMRV engine
                                      |
             QC → reconciliation → package → review → release
                                      |
                   Chain-neutral integrity anchor adapters
                                      |
                     EVM / Hedera / other approved networks
                                      |
                       Independent proof/readback service

           R geospatial platform provides reusable spatial services
           maps, climate, geography, visualization and exports
```

## 2. Ownership boundaries

### Illovediza repository owns
- Illovediza product narrative, brand and standalone frontend.
- Spain administrative reference and venue/club/sports registries.
- Padel, tennis and football taxonomy and competition relationships.
- Illovediza-only indicators, baselines, monitoring plans and activity data.
- Spain municipal/project dashboards and reports.
- Illovediza project configuration, access roles and release profile.
- Spain-specific deployment, CI, documentation and acceptance evidence.

### AquaDMRV owns
- Canonical water/harvest event schemas, authenticated ingestion and immutable observations.
- Device identity, signatures, sequence/idempotency, replay and key lifecycle.
- Water-quality QMS, laboratory/custody lineage, batch state and release controls.
- Deterministic evidence packaging, Merkle commitments and cryptographic anchor/readback.
- Climate-accounting controls, methodology references and verification receipts.

AquaDMRV must not become the home of Illovediza-specific sports operations, Spain product branding or the project frontend. It is the shared assurance engine; Illovediza retains its project-specific profile and reporting identity.

### R owns
- Reusable global/geospatial discovery and map/observatory components.
- Climate provider adapters and source provenance.
- Spatial visualization, geography ingestion and mapping utilities.
- Reusable map/municipal reporting APIs and export formats.
- Integration examples for Unity, Unreal and BI.

R does not own Illovediza's project-specific indicators, sports partnerships or verified claims. It is a service/library integration, not a second project master.

## 3. Project isolation and common contracts

Every record must carry immutable project identity and scope:

- `project_id = ILL-FUERZA-ES`
- `tenant_id` / authorized organization scope
- `jurisdiction_id`, `venue_id`, `node_id`, `event_id` where applicable
- `indicator_id` and methodology/version
- `evidence_id`, source, timestamps, spatial support and evidence class
- `package_id`, package root, reviewer decision and release state

The project namespace is mandatory in database queries, event messages, object-storage paths, API authorization, report exports and anchor metadata. Cross-project aggregation is an explicit, permissioned read model; it must never merge source evidence or overwrite project-specific values.

## 4. Integration style

Use versioned, documented APIs/events and shared schemas. Do not use Git submodules as the primary runtime coupling. Do not copy R or OMI-OJO application source into Illovediza merely to share a map or DMRV feature.

Preferred options:
- consume a versioned R API for geography/climate/reporting where the API meets the required contract;
- extract stable R map components into a separately versioned package when ownership and tests are clear;
- consume AquaDMRV DMRV APIs/contracts for water/harvest, QMS and cryptographic evidence operations;
- retain a local Illovediza adapter and project configuration so the product remains independently deployable.

Each integration has timeout, retry, idempotency, schema-version, provenance and degraded-mode behavior.

## 5. Data boundaries

Raw source responses and original observations are retained immutably under the applicable retention and privacy policy. Normalized records reference their source and transformation version. Derived indicators preserve input IDs, formulas, factors, units, uncertainty and methodology version. Corrections create superseding versions; released packages are not silently edited.

Public map layers must not expose sensitive venue security details, personal data, private site coordinates or unapproved partner records.

## 6. Independent extraction requirement

This repository must be independently buildable and deployable. It must contain its own:
- package manifest and lockfile;
- app entrypoint and routes;
- environment-variable template with names only;
- CI/build/test workflow;
- deployment instructions;
- project schemas/adapters;
- migration scripts and seed/reference data provenance;
- observability, security and rollback documentation.

External dependencies are accessed through documented contracts. A clean checkout must not require the OMI-OJO or R working tree to be present.
