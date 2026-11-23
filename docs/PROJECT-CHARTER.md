# Illovediza Fuerza — Project Charter

## 1. Purpose

Build a Spain-wide sports-anchored territorial engagement network that makes padel, tennis and football facilities practical points of community participation, environmental observation, local partnerships and evidence-backed ESG reporting.

The platform combines a public-facing discovery experience with an institutional operating system. The public experience explains the programme and displays qualified geography and participating nodes. The institutional experience manages onboarding, permissions, measurement plans, evidence, review and reporting.

## 2. Territorial scope

Reference hierarchy:

```
Spain
 ├─ 17 autonomous communities + 2 autonomous cities
 │   └─ 50 provinces
 │       └─ 8,132 municipalities
 │           └─ Sports venue / club / facility
 │               └─ Authorized activity or measurement node
 │                   └─ Observation / event / evidence record
```

The hierarchy is jurisdiction-aware and source-versioned. Use the official Spanish administrative terminology and codes from authoritative datasets. The stated 17+2 / 50 / 8,132 values are reference scope values; validate the relevant INE/official releases and effective dates before presenting them as current verified coverage.

Municipality is the primary territorial reporting lens, not a claim that a physical node exists in every municipality. Coverage states must distinguish: undiscovered, candidate identified, contacted, permission pending, onboarded, instrumented, reporting, under review and verified.

## 3. Sports engagement model

### Padel
Treat padel as a strategic growth and activation channel. Discover dedicated clubs, municipal facilities, private centres, emerging local communities, tournaments and league structures. Prioritize evidence of recurring activity and local reach over assumptions based on popularity.

### Tennis
Map clubs, public courts, academies, training centres, competition venues and regional/national competition pathways. Capture multi-site club networks and shared facilities.

### Football
Map clubs, stadiums, municipal grounds, academies, training centres and league/competition structures. Distinguish professional, semi-professional, amateur, youth, school and community activity.

### Multi-sport venues
A single venue can host multiple sports and programmes. Maintain one canonical venue identity, multiple sport affiliations, and separate activities/events/measurement records. Avoid duplicate venue counts.

## 4. Engagement hierarchy

Represent actual structures rather than assuming one universal federation tree:

- National: national governing bodies, recognized competitions, national championships and national programme partners.
- Autonomous-community / regional: federations, leagues, regional championships and regional sport administrations.
- Provincial: provincial associations, delegations, competitions and institutional partners where they exist.
- Municipal / local: clubs, municipal sport services, facility operators, schools, community groups and local events.
- Venue / event: courts, pitches, stadiums, training sessions, tournaments, matches and approved harvest/measurement activities.

Every organization relationship records source, date checked, relationship type, evidence and status. Do not imply endorsement, affiliation or authorization without documentation.

## 5. Harvest-node concept

A sports facility is a candidate host location for an Illovediza node. A node may be a sensor, collection/measurement station, event-based measurement point, or a documented human-operated observation workflow. The node's exact purpose is declared in its approved monitoring plan.

The platform must separate:
- **Territorial node:** municipal/provincial reporting reference.
- **Sports venue:** physical facility.
- **Engagement node:** club, partner or programme relationship.
- **Measurement node:** instrument or controlled observation point.
- **Harvest node:** approved physical collection or resource-harvesting installation, if applicable.
- **Event node:** bounded activity such as a match, tournament or community programme.

A map marker alone is not a deployed node. Installation requires site permission, operator identity, instrument specification, calibration/commissioning evidence, data pathway and monitoring plan.

## 6. Programme outcomes

Potential indicator families, subject to baseline and methodology design:

- Environmental: energy, water, waste, materials, transport and facility resource use.
- Climate/GHG: measured activity data, approved emission factors, scope/boundary, calculations and uncertainty.
- Social: participation, inclusion, access, youth/community engagement, gender-disaggregated participation where lawful and appropriate, accessibility and safeguarding.
- Governance: permissions, procurement, partner accountability, safety, data protection, complaints and review.
- Sports ecosystem: venue/club reach, event cadence, participation continuity and geographic coverage.

Do not use a composite ESG score until indicator weights, missing-data rules, materiality, methodology and independent review are documented.

## 7. Primary audiences

Municipal and regional sport authorities; venue operators; clubs and academies; national/regional sports bodies; event organizers; sponsors; ESG and sustainability teams; independent reviewers; funders and public-interest partners.

## 8. Delivery stages

1. Product and data baseline.
2. Spain geography registry and venue discovery.
3. Sports ecosystem and partner validation.
4. Candidate-node qualification and site authorization.
5. Controlled measurement pilots.
6. dMRV review and cryptographic integrity testing.
7. Municipal and institutional reporting.
8. Independent assurance and staged territorial expansion.

Each stage has named owners, evidence artifacts, acceptance criteria, risks and a release decision.
