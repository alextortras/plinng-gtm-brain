## ADDED Requirements

### Requirement: forecast-page
The system SHALL provide a `/forecasts` page accessible from the sidebar navigation.

#### Scenario: navigate to forecasts
- **WHEN** a user clicks "Forecasts" in the sidebar
- **THEN** the forecasting dashboard is displayed

### Requirement: scenario-comparison
The forecast page SHALL display all three scenarios side by side.

#### Scenario: scenario cards
- **WHEN** the forecast page loads
- **THEN** three KPI cards show the total projected revenue for Best Case, Commit, and Most Likely

#### Scenario: scenario chart
- **WHEN** viewing the forecast chart
- **THEN** a bar or grouped chart compares the three scenarios across revenue types

### Requirement: revenue-type-breakdown
The forecast page SHALL show a breakdown by revenue type.

#### Scenario: segmented view
- **WHEN** viewing the forecast breakdown
- **THEN** New Business, Expansion, and Renewals are shown with their individual projections per scenario

### Requirement: motion-filter
The forecast page SHALL support filtering by sales motion.

#### Scenario: filter by motion
- **WHEN** the user selects a sales motion filter
- **THEN** the forecast data updates to show only that motion's projections

### Requirement: generate-button
The forecast page SHALL include a button to trigger fresh forecast generation.

#### Scenario: generate forecast
- **WHEN** the user clicks "Generate Forecast"
- **THEN** a POST request is sent to `/api/forecasts/generate` and the page updates with fresh results

### Requirement: explainability-display
The forecast page SHALL display deal-level explanations for key contributors.

#### Scenario: view explanations
- **WHEN** the user views the forecast details
- **THEN** top contributing deals are listed with their natural-language likelihood explanations
