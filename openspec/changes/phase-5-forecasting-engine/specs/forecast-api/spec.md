## ADDED Requirements

### Requirement: generate-forecast-endpoint
The system SHALL expose a POST `/api/forecasts/generate` endpoint that triggers forecast calculation.

#### Scenario: trigger forecast
- **WHEN** an authenticated user sends a POST request to `/api/forecasts/generate`
- **THEN** the engine calculates all three scenarios and stores the results

#### Scenario: return generated forecast
- **WHEN** forecast generation completes
- **THEN** the response contains the new forecast with all scenarios, segments, and explanations

### Requirement: get-forecasts-endpoint
The system SHALL expose a GET `/api/forecasts` endpoint returning the latest or historical forecasts.

#### Scenario: get latest forecast
- **WHEN** a GET request is made without date parameters
- **THEN** the most recent forecast snapshot is returned

#### Scenario: filter by revenue type
- **WHEN** the request includes `?revenueType=new_business`
- **THEN** only new business forecast segments are returned

#### Scenario: filter by motion
- **WHEN** the request includes `?motion=paid_ads`
- **THEN** only paid ads forecast segments are returned

### Requirement: authenticated-access
All forecast endpoints SHALL require authentication.

#### Scenario: unauthenticated request
- **WHEN** an unauthenticated request hits a forecast endpoint
- **THEN** a 401 response is returned
