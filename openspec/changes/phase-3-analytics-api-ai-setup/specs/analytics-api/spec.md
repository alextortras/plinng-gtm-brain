## ADDED Requirements

### Requirement: funnel-metrics-endpoint
The system SHALL expose a GET `/api/funnel-metrics` endpoint returning daily funnel metrics with optional query filters.

#### Scenario: unfiltered query
- **WHEN** a GET request is made to `/api/funnel-metrics` without filters
- **THEN** all daily_funnel_metrics rows are returned ordered by date descending

#### Scenario: filter by market
- **WHEN** the request includes `?market=us`
- **THEN** only rows where `market = 'us'` are returned

#### Scenario: filter by motion
- **WHEN** the request includes `?motion=paid_ads`
- **THEN** only rows where `motion = 'paid_ads'` are returned

#### Scenario: filter by stage
- **WHEN** the request includes `?stage=commit`
- **THEN** only rows where `funnel_stage = 'commit'` are returned

#### Scenario: filter by date range
- **WHEN** the request includes `?from=2026-01-01&to=2026-01-31`
- **THEN** only rows within that date range are returned

### Requirement: rep-kpis-endpoint
The system SHALL expose a GET `/api/rep-kpis` endpoint returning rep performance data.

#### Scenario: filter by role
- **WHEN** the request includes `?role=ae`
- **THEN** only AE rep KPI rows are returned

#### Scenario: leaderboard ordering
- **WHEN** the request includes `?sort=arr_closed_won&order=desc`
- **THEN** results are sorted by that metric descending

### Requirement: account-scores-endpoint
The system SHALL expose a GET `/api/account-scores` endpoint returning account scoring data.

#### Scenario: filter by score type
- **WHEN** the request includes `?type=deal_momentum`
- **THEN** only deal_momentum scores are returned

#### Scenario: filter by stalled
- **WHEN** the request includes `?stalled=true`
- **THEN** only stalled accounts are returned

### Requirement: strategy-config-endpoint
The system SHALL expose GET and PUT `/api/strategy-config` endpoints.

#### Scenario: read current config
- **WHEN** a GET request is made to `/api/strategy-config`
- **THEN** the active strategy configuration is returned

#### Scenario: admin updates config
- **WHEN** an admin sends a PUT request with a new strategy mode
- **THEN** the active config is updated and the new config is returned

### Requirement: authenticated-only
All API endpoints SHALL require authentication. Unauthenticated requests receive a 401 response.

#### Scenario: unauthenticated request
- **WHEN** a request without a valid session hits any API endpoint
- **THEN** a 401 JSON error is returned
