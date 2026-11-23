# Sports nodes, engagement hierarchy and measurement

## 1. Venue-first model

A physical venue has one canonical `venue_id`, verified address/coordinates, operator, access status, source and evidence. Sports are many-to-many affiliations. A facility with padel courts, tennis courts and a football pitch remains one venue with three sport affiliations and distinct activity records.

Venue fields include:
- canonical ID, official/local name, operator and venue type;
- address, coordinates, CRS, geocoding source and positional accuracy;
- municipality/province/autonomous-community IDs and boundary release;
- sports offered, facilities/capacity and accessible public/private status;
- source URL, licence, last-checked time and confidence;
- partner/permission state and publication visibility.

## 2. Sports taxonomy

| Sport | Venue types | Engagement records |
|---|---|---|
| Padel | dedicated club, municipal courts, multi-sport centre, tournament venue | court use, training, league, tournament, participation |
| Tennis | club, public courts, academy, multi-sport centre, championship venue | court use, coaching, league, tournament, participation |
| Football | stadium, municipal pitch, club ground, academy, training centre | match, training, league, tournament, participation |

Use controlled sport identifiers and source-backed competition/organization identities. Do not assume that a facility hosts a sport based on an unverified web mention.

## 3. Competition and institutional hierarchy

Model organization and competition relationships as a graph with typed, dated edges:
- governed_by;
- affiliated_to;
- organizes;
- participates_in;
- hosted_at;
- operates;
- funds;
- authorizes;
- reports_to.

Competition levels may include national, autonomous-community, provincial, municipal and venue/community. Not every sport or competition has every level. Preserve the actual source hierarchy and its exceptions. A club can participate in multiple competitions and a multi-sport organization can operate multiple facilities.

## 4. Node classes

- `TERRITORIAL_REFERENCE`: administrative reporting unit only.
- `VENUE_CANDIDATE`: discovered physical sports facility, not yet qualified.
- `ENGAGEMENT_NODE`: validated club, organizer or institutional relationship.
- `EVENT_NODE`: bounded event, session or competition.
- `MEASUREMENT_NODE`: approved instrument or observation workflow.
- `HARVEST_NODE`: approved physical collection/harvesting installation.
- `REPORTING_NODE`: derived reporting aggregation, never a physical deployment claim.

Node states: `DISCOVERED`, `SOURCE_CHECKED`, `CONTACTED`, `PERMISSION_PENDING`, `AUTHORIZED`, `COMMISSIONED`, `OBSERVING`, `QC_HOLD`, `UNDER_REVIEW`, `VERIFIED`, `SUSPENDED`, `RETIRED`.

## 5. Measurement plan and indicator registry

Every indicator definition includes:
- stable indicator ID and title;
- ESG pillar and materiality rationale;
- unit, direction and reporting period;
- population/asset boundary and spatial support;
- activity-data source and evidence class;
- measurement or calculation method/version;
- baseline and counterfactual where required;
- emission factor/source/year for GHG calculations;
- missing-data and uncertainty treatment;
- quality rules and acceptance threshold;
- reviewer and publication policy.

Potential sports-site measures include metered electricity and fuel, water use, waste mass by stream, travel activity by mode/distance, refrigerant leakage where relevant, facility operating hours, event attendance and participation. Participation is social activity data, not a carbon reduction. Avoided emissions require a defensible baseline and applicable method.

## 6. Event-to-evidence process

```
Approved event/site scope
  → operator and permission check
  → instrument/activity source registration
  → timestamped collection
  → source validation and QC
  → reconciliation / calculation
  → evidence package
  → reviewer decision
  → integrity anchor
  → report publication
```

For physical harvesting nodes, add installation inspection, calibration, maintenance, custody and commissioning records. Event attendance, venue schedules or social-media posts are not substitutes for measured environmental data.

## 7. Municipal views

Each municipal page should show:
- official administrative identity and boundary version;
- venue discovery coverage by padel, tennis and football;
- qualified clubs/operators and competition links;
- candidate vs authorized vs commissioned nodes;
- reporting-period activity and indicator coverage;
- evidence quality, review and release status;
- local engagement, inclusion and governance indicators;
- missingness, limitations and next actions.

A municipality with no discovered venue is `UNKNOWN/NOT ASSESSED`, not zero sports activity. A municipality with venues but no instrumented node is not an environmental measurement site.
