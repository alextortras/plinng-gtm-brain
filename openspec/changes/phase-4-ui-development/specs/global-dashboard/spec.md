# Global Dashboard Specification

## ADDED Requirements

### Requirement: executive-kpi-summary
The dashboard SHALL display Level 1 executive KPI summary cards for key metrics.

#### Scenario: Display blended CAC
- **WHEN** a user views the global dashboard
- **THEN** a KPI card SHALL display the blended CAC value with appropriate formatting

#### Scenario: Display total pipeline
- **WHEN** a user views the global dashboard
- **THEN** a KPI card SHALL display the total pipeline value in dollars

#### Scenario: Display total revenue
- **WHEN** a user views the global dashboard
- **THEN** a KPI card SHALL display the total revenue value in dollars

#### Scenario: Display NRR
- **WHEN** a user views the global dashboard
- **THEN** a KPI card SHALL display the Net Revenue Retention percentage

### Requirement: funnel-visualization
The dashboard SHALL provide a visual representation of the complete Bowtie Funnel stages.

#### Scenario: Display funnel chart
- **WHEN** a user views the global dashboard
- **THEN** a bar or funnel chart SHALL display all funnel stages with their respective values

#### Scenario: Show stage names and values
- **WHEN** the funnel chart is rendered
- **THEN** each stage SHALL be labeled with its name and display its numeric value

### Requirement: market-filter
The dashboard SHALL allow users to filter data by market segment.

#### Scenario: Display market selector
- **WHEN** a user views the global dashboard
- **THEN** a market filter dropdown SHALL display options for US, Spain, and All

#### Scenario: Apply market filter
- **WHEN** a user selects a market from the filter
- **THEN** all dashboard data SHALL update to reflect only the selected market

### Requirement: date-range-picker
The dashboard SHALL allow users to select a date range for viewing metrics.

#### Scenario: Display date range control
- **WHEN** a user views the global dashboard
- **THEN** a date range picker SHALL be visible and accessible

#### Scenario: Apply date range filter
- **WHEN** a user selects a date range
- **THEN** all dashboard metrics and charts SHALL update to reflect data within the selected range

### Requirement: drill-down-navigation
The dashboard SHALL enable users to drill down from funnel stages to detailed views.

#### Scenario: Make stages clickable
- **WHEN** a user views the funnel chart
- **THEN** each funnel stage SHALL be visually indicated as clickable

#### Scenario: Navigate to Level 2 detail
- **WHEN** a user clicks on a funnel stage
- **THEN** the application SHALL navigate to a Level 2 detailed view for that stage
