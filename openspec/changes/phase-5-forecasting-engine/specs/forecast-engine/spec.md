## ADDED Requirements

### Requirement: three-scenario-forecast
The system SHALL produce three forecast scenarios for a rolling 90-day horizon: Best Case, Commit, and Most Likely.

#### Scenario: best case calculation
- **WHEN** the forecasting engine runs
- **THEN** a "Best Case" projection is calculated using optimistic conversion rates (historical high watermarks) and full pipeline inclusion

#### Scenario: commit calculation
- **WHEN** the forecasting engine runs
- **THEN** a "Commit" projection is calculated using only deals with high momentum scores (>70) and historically consistent conversion rates

#### Scenario: most likely calculation
- **WHEN** the forecasting engine runs
- **THEN** a "Most Likely" projection is calculated using weighted average conversion rates from the past 90 days and current pipeline state

### Requirement: revenue-type-segmentation
Forecasts SHALL be segmented by revenue type: New Business, Expansion, and Renewals.

#### Scenario: new business forecast
- **WHEN** querying the forecast for "New Business"
- **THEN** only revenue from first-time closed-won deals in the commit/selection stages is included

#### Scenario: expansion forecast
- **WHEN** querying the forecast for "Expansion"
- **THEN** only revenue from existing account upsells (growth stage) is included

#### Scenario: renewals forecast
- **WHEN** querying the forecast for "Renewals"
- **THEN** only revenue from retention-stage accounts adjusted by GRR is included

### Requirement: motion-segmentation
Forecasts SHALL be further segmented by sales motion (Outbound, Partners, Paid Ads, Organic, PLG).

#### Scenario: motion-level forecast
- **WHEN** querying a forecast filtered by motion
- **THEN** projections reflect only pipeline and conversion rates from that specific motion

### Requirement: historical-calibration
The forecasting model SHALL calibrate using the available historical data (up to 90 days), updating with each 3x daily data sync.

#### Scenario: initial calibration
- **WHEN** the forecast engine runs for the first time
- **THEN** it uses all available historical daily_funnel_metrics to compute baseline conversion rates per stage/motion/market

#### Scenario: recalibration on sync
- **WHEN** new data arrives from a scheduled sync
- **THEN** the forecast model recalculates using the updated historical window

### Requirement: deal-explainability
When the system scores a deal's likelihood to close, it SHALL provide a natural-language explanation.

#### Scenario: explain high-likelihood deal
- **WHEN** a deal has a momentum score above 70 and matches ICP
- **THEN** the explanation states factors like "Matches US Home Services ICP, high momentum score, no stalled stages"

#### Scenario: explain low-likelihood deal
- **WHEN** a deal has a low momentum score or is stalled
- **THEN** the explanation states the negative factors like "Stalled for 12 days, no next step recorded, below-average velocity"

### Requirement: forecast-persistence
Forecast results SHALL be stored in a `revenue_forecasts` table for historical comparison.

#### Scenario: forecast snapshot saved
- **WHEN** a forecast calculation completes
- **THEN** the results are inserted into `revenue_forecasts` with the generation timestamp
