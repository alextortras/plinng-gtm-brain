## ADDED Requirements

### Requirement: seed-script
The system SHALL provide a SQL seed script that populates all core tables with realistic mock data.

#### Scenario: seed populates 90-day history
- **WHEN** the seed script runs against an empty database
- **THEN** `daily_funnel_metrics` contains rows spanning the past 90 days

#### Scenario: seed covers both markets
- **WHEN** querying seeded `daily_funnel_metrics` by market
- **THEN** rows exist for both `us` and `spain` markets

#### Scenario: seed covers all motions
- **WHEN** querying seeded `daily_funnel_metrics` by motion
- **THEN** rows exist for all five sales motions (outbound, partners, paid_ads, organic, plg)

#### Scenario: seed covers all funnel stages
- **WHEN** querying seeded `daily_funnel_metrics` by funnel_stage
- **THEN** rows exist for all eight Bowtie Funnel stages

### Requirement: arpa-range
Seeded revenue data SHALL reflect the 80€–130€ ARPA range specified in the business rules.

#### Scenario: revenue values are realistic
- **WHEN** inspecting seeded revenue and pipeline values
- **THEN** per-account revenue figures fall within or near the 80€–130€ monthly range

### Requirement: seed-reps
The seed script SHALL create mock sales reps (SDRs, AEs, CSMs) with user profiles and 90 days of KPI history.

#### Scenario: rep KPIs are populated
- **WHEN** querying `rep_kpis` after seeding
- **THEN** each mock rep has daily KPI rows with role-appropriate metrics filled in

### Requirement: seed-scores
The seed script SHALL create mock account scores with historical trend data.

#### Scenario: score history exists
- **WHEN** querying `account_scores` after seeding
- **THEN** multiple accounts have score entries across multiple dates with varied score values

### Requirement: seed-idempotent
The seed script SHALL be safe to run multiple times by using upserts or truncating before insert.

#### Scenario: re-running seed
- **WHEN** the seed script runs against an already-seeded database
- **THEN** no duplicate key errors occur and data is cleanly refreshed
