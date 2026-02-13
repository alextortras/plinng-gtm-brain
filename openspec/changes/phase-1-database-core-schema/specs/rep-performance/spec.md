## ADDED Requirements

### Requirement: rep-kpis-table
The system SHALL maintain a `rep_kpis` table storing daily performance metrics per sales rep, segmented by role (SDR, AE, CSM).

#### Scenario: SDR KPIs are tracked
- **WHEN** daily metrics are computed for an SDR
- **THEN** a row is upserted with `sals_generated`, `lead_to_sal_conversion_rate`, and `arr_from_sals`

#### Scenario: AE KPIs are tracked
- **WHEN** daily metrics are computed for an AE
- **THEN** a row is upserted with `arr_closed_won`, `arr_expansion`, `sal_to_closed_won_rate`, and `trailing_churn_rate`

#### Scenario: CSM KPIs are tracked
- **WHEN** daily metrics are computed for a CSM
- **THEN** a row is upserted with `grr`, `churn_rate`, `retention_deal_resolution_rate`, and `account_health_score`

### Requirement: leaderboard-queryable
The `rep_kpis` table SHALL support efficient queries for ranked leaderboards by any KPI metric within a date range.

#### Scenario: leaderboard by ARR closed won
- **WHEN** a user views the AE leaderboard for the current month
- **THEN** AEs are returned ranked by `arr_closed_won` descending with their full KPI row

### Requirement: full-transparency
All authenticated users SHALL have read access to all rep KPI data. There are no per-rep visibility restrictions.

#### Scenario: any user views leaderboard
- **WHEN** any authenticated user queries `rep_kpis`
- **THEN** all rep data is visible regardless of the querying user's role
