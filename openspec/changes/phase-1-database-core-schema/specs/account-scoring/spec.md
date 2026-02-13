## ADDED Requirements

### Requirement: account-scores-table
The system SHALL maintain an `account_scores` table storing computed scores per account with score type, value, and metadata.

#### Scenario: SDR propensity score is stored
- **WHEN** the scoring engine evaluates a lead at the Selection stage
- **THEN** an `sdr_propensity` score (0–100) is upserted into `account_scores` with the account ID, score date, and contributing factors as JSON

#### Scenario: AE deal momentum score is stored
- **WHEN** the scoring engine evaluates a deal at the Commit stage
- **THEN** a `deal_momentum` score (0–100) is upserted into `account_scores` with velocity metrics and stall detection flags

#### Scenario: CSM health score is stored
- **WHEN** the scoring engine evaluates an account at the Impact/Growth stage
- **THEN** a `csm_health` score (0–100) is upserted into `account_scores` with product usage and engagement signals

### Requirement: stalled-deal-flagging
The system SHALL include a `is_stalled` boolean and `stalled_since` timestamp on deal-related scores.

#### Scenario: deal without next step
- **WHEN** a deal in the final pipeline stages has no active "next step" recorded
- **THEN** `is_stalled` is set to `true` and the deal momentum score is severely penalized

### Requirement: score-history
The system SHALL retain historical scores to support trend analysis. Scores are append-only with a date dimension.

#### Scenario: score trend query
- **WHEN** a user views an account's score history
- **THEN** all historical score entries for that account and score type are returned in chronological order
