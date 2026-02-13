# Rep Leaderboards Specification

## ADDED Requirements

### Requirement: role-based-leaderboard-tabs
The leaderboards page SHALL provide separate views for each sales role.

#### Scenario: Display role tabs
- **WHEN** a user views the leaderboards page
- **THEN** tabs SHALL be displayed for SDR, AE, and CSM roles

#### Scenario: Switch between role views
- **WHEN** a user clicks on a role tab
- **THEN** the leaderboard SHALL display rankings specific to that role

### Requirement: sdr-leaderboard
The SDR leaderboard SHALL rank representatives by SALs generated with relevant metrics.

#### Scenario: Display SDR rankings
- **WHEN** the SDR tab is active
- **THEN** a table SHALL display all SDRs ranked by number of SALs generated

#### Scenario: Show SDR conversion rate
- **WHEN** the SDR leaderboard is displayed
- **THEN** each SDR row SHALL include their SQL to SAL conversion rate

#### Scenario: Show SDR ARR contribution
- **WHEN** the SDR leaderboard is displayed
- **THEN** each SDR row SHALL include the total ARR value associated with their SALs

### Requirement: ae-leaderboard
The AE leaderboard SHALL rank representatives by ARR Closed Won with performance metrics.

#### Scenario: Display AE rankings
- **WHEN** the AE tab is active
- **THEN** a table SHALL display all AEs ranked by ARR Closed Won

#### Scenario: Show AE expansion metrics
- **WHEN** the AE leaderboard is displayed
- **THEN** each AE row SHALL include their expansion revenue value

#### Scenario: Show AE conversion rate
- **WHEN** the AE leaderboard is displayed
- **THEN** each AE row SHALL include their opportunity to closed won conversion rate

#### Scenario: Show AE churn impact
- **WHEN** the AE leaderboard is displayed
- **THEN** each AE row SHALL include churn metrics for their accounts

### Requirement: csm-leaderboard
The CSM leaderboard SHALL rank representatives by Gross Revenue Retention with health metrics.

#### Scenario: Display CSM rankings
- **WHEN** the CSM tab is active
- **THEN** a table SHALL display all CSMs ranked by GRR percentage

#### Scenario: Show CSM churn rate
- **WHEN** the CSM leaderboard is displayed
- **THEN** each CSM row SHALL include their account churn rate

#### Scenario: Show CSM resolution rate
- **WHEN** the CSM leaderboard is displayed
- **THEN** each CSM row SHALL include their customer issue resolution rate

#### Scenario: Show account health score
- **WHEN** the CSM leaderboard is displayed
- **THEN** each CSM row SHALL include the average health score of their accounts

### Requirement: full-transparency
All authenticated users SHALL be able to view complete leaderboard data for all representatives.

#### Scenario: Display all reps to all users
- **WHEN** any authenticated user views a leaderboard
- **THEN** the complete list of representatives and their metrics SHALL be visible

#### Scenario: No role-based filtering
- **WHEN** a user with any role views leaderboards
- **THEN** no data SHALL be hidden or filtered based on the viewer's role or permissions
