## ADDED Requirements

### Requirement: strategy-modes-table
The system SHALL maintain a `strategy_config` table storing the active AI strategy mode and associated business rule guardrails.

#### Scenario: admin sets strategy mode
- **WHEN** an admin selects a strategy mode (Maximize Revenue, Maximize Efficiency, or Maximize Activation)
- **THEN** the `strategy_config` table is updated with the selected mode and a timestamp

#### Scenario: only one active mode
- **WHEN** querying the current strategy configuration
- **THEN** exactly one active strategy mode is returned

### Requirement: business-rule-guardrails
The system SHALL store configurable guardrail thresholds alongside the strategy mode.

#### Scenario: default guardrails
- **WHEN** a new strategy configuration is created
- **THEN** it includes default values for `max_cac_payback_months` (6), `max_churn_rate` (0.05), `arpa_min` (80), and `arpa_max` (130)

#### Scenario: guardrails are editable
- **WHEN** an admin updates a guardrail threshold
- **THEN** the new value is persisted and used in subsequent AI evaluations

### Requirement: admin-only-write
Only users with the `admin` role SHALL be able to modify strategy configuration. All authenticated users MAY read the current configuration.

#### Scenario: non-admin attempts write
- **WHEN** a non-admin user attempts to update `strategy_config`
- **THEN** the operation is denied by Row-Level Security policy

#### Scenario: admin writes config
- **WHEN** an admin user updates `strategy_config`
- **THEN** the update succeeds
