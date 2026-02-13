## ADDED Requirements

### Requirement: daily-snapshot-table
The system SHALL maintain a `daily_funnel_metrics` table that stores one aggregated row per day, per funnel stage, per sales motion, per market.

#### Scenario: daily metrics are recorded
- **WHEN** a scheduled data sync completes (3x daily: Morning, Noon, EOD)
- **THEN** a new row is upserted into `daily_funnel_metrics` with the current date, funnel stage, motion, market, and aggregated metric values

#### Scenario: metrics are queryable by market
- **WHEN** a user filters the dashboard by market (US or Spain)
- **THEN** only rows matching that `market` value are returned

#### Scenario: metrics are queryable by motion
- **WHEN** a user filters by sales motion (Outbound, Partners, Paid Ads, Organic, PLG)
- **THEN** only rows matching that `motion` value are returned

### Requirement: bowtie-funnel-stages
The system SHALL support the full Bowtie Funnel stages: Awareness, Education, Selection, Commit, Onboarding, Impact, Growth, and Advocacy.

#### Scenario: all funnel stages are represented
- **WHEN** querying `daily_funnel_metrics` across a full date range
- **THEN** rows exist for each active Bowtie Funnel stage

### Requirement: identity-matching
The system SHALL match records across data sources using `email`, `phone`, or `cif_nif` (Spanish tax ID) as composite identity keys.

#### Scenario: cross-source matching
- **WHEN** a HubSpot contact and a product usage event share the same email
- **THEN** they are linked to the same account in the aggregated metrics

### Requirement: no-raw-clickstreams
The system SHALL NOT store raw clickstream or event-level data. Only daily aggregated snapshots are persisted.

#### Scenario: data granularity
- **WHEN** data is ingested from any source
- **THEN** it is aggregated to the daily level before storage
