# Sports nodes, engagement hierarchy and measurement

## 1. Venue-first model

A physical venue has one canonical `venue_id`, verified address/coordinates, operator, access status, source and evidence. Sports are many-to-many affiliations. A facility with padel courts, tennis courts and a football pitch remains one venue with three sport affiliations and distinct activity records.

Venue fields include canonical ID, official/local name, operator and venue type; WGS84 coordinates and positional accuracy; official INE municipality code, province and autonomous-community IDs; sports offered; municipal management status; source URL, licence and retrieval timestamp; significance evidence; and permission/commissioning status.

## 2. Spain sports prioritization

The programme prioritizes **football and padel** as its principal sports anchors. Tennis is a selective third category.

### Padel — primary anchor
Qualify major padel courts, dedicated clubs and municipal sports complexes. An OSM `sport=padel` tag alone does not establish major status. Require source-backed identity, geotag, official municipality crosswalk and significance evidence such as municipal facility report, competition role, operator confirmation or documented scale.

### Football — primary anchor
Focus on football stadiums and municipal grounds that are part of, or demonstrably co-located within, the same municipal sports complex as a major padel anchor. Record the shared complex relationship and evidence. Other stadiums may remain candidates but are not promoted to the combined primary municipal node class.

### Tennis — selective anchor
Include only significant or sustainability-relevant tennis facilities in Polideportivos where Ayuntamientos management is documented. Qualification requires municipal management evidence and significance/sustainability evidence from an official facility report, municipal sports plan or comparable source. Do not attempt to list every tennis court in Spain.

## 3. Municipal engagement hierarchy

Represent actual structures rather than assuming one universal federation tree: national; autonomous-community/regional; provincial; municipal/local; venue/event. Every relationship records source, date checked, type, evidence and status. Do not imply endorsement, affiliation or authorization without documentation.

## 4. Node classes

- `TERRITORIAL_REFERENCE`: administrative reporting unit only.
- `VENUE_CANDIDATE`: discovered physical sports facility, not yet qualified.
- `ENGAGEMENT_NODE`: validated club, operator or institutional relationship.
- `EVENT_NODE`: bounded event, session or competition.
- `MEASUREMENT_NODE`: approved instrument or observation workflow.
- `HARVEST_NODE`: approved physical collection installation.
- `REPORTING_NODE`: derived aggregation, never a physical deployment claim.

States: `DISCOVERED`, `SOURCE_CHECKED`, `SIGNIFICANCE_REVIEW`, `CONTACTED`, `PERMISSION_PENDING`, `AUTHORIZED`, `COMMISSIONED`, `OBSERVING`, `QC_HOLD`, `UNDER_REVIEW`, `VERIFIED`, `SUSPENDED`, `RETIRED`.

## 5. Sports venue as a RainWater product host

A qualified sports venue can become a candidate RainWater host only after site assessment and permission. Its identity can support a municipal product brand: municipality and INE code; Polideportivo/sports-complex/venue name; actual venue coordinates and catchment reference; authorized collection system and event; first-flush, meter and collection records; sample/custody, laboratory/QMS, batch and seal; timestamped evidence package and cryptographic root.

The label may use municipal venue identity, but a Premium RainWater claim cannot be released until quality, batch, seal, regulatory and product-release gates pass. A map pin or sports partnership does not establish harvest or product quality.

## 6. Indicator registry

Environmental and climate indicators include measured energy, water, waste, transport, rainfall, air quality and other material activity. GHG calculations require activity data, organizational/operational boundary, emission-factor source/version, method, assumptions and uncertainty. Social indicators include event participation, inclusion and access with privacy, consent/legal basis and safeguarding.

Sports participation is not a carbon reduction. Rainfall opportunity is not harvested water. Calculated emissions or potential avoided emissions are not credits until the eligible methodology and independent verification/registry requirements pass.

## 7. Event-to-evidence process

```
Municipal / venue identity
  → sports venue qualification
  → site assessment and permission
  → approved catchment and monitoring plan
  → rain event and instrument/source collection
  → first-flush and measured volume
  → sampling / custody / laboratory QMS
  → batch / seal / product identity
  → QC + reconciliation + calculation
  → deterministic evidence package
  → independent review
  → cryptographic integrity anchor
  → municipal and institutional report
  → product / finance release decision
```

## 8. Municipal views

Each municipal page shows official identity; padel/football/tennis venue assessment; qualified/candidate venues; sports-complex relationships; permissions; climate and rainwater factors; product batch status; GHG/social/governance evidence; package/anchor references; missingness and next actions.

A municipality with no discovered venue is `NOT_ASSESSED`, not zero sports activity. A municipality with venues but no approved measurement node is not an environmental measurement site.
