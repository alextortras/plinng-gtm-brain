# Strategy Panel Specification

## ADDED Requirements

### Requirement: admin-only-editing
The Strategy Panel SHALL restrict configuration editing to users with admin privileges.

#### Scenario: Admin views editable form
- **WHEN** a user with admin role views the Strategy Panel
- **THEN** all configuration fields SHALL be editable

#### Scenario: Non-admin views read-only
- **WHEN** a user without admin role views the Strategy Panel
- **THEN** all configuration fields SHALL be displayed as read-only

#### Scenario: Hide save button for non-admins
- **WHEN** a user without admin role views the Strategy Panel
- **THEN** the save button SHALL not be visible

### Requirement: optimization-mode-selection
The Strategy Panel SHALL allow admins to select between three optimization modes.

#### Scenario: Display mode options
- **WHEN** an admin views the Strategy Panel
- **THEN** three mode options SHALL be displayed: Maximize Revenue, Maximize Efficiency, Maximize Activation

#### Scenario: Toggle between modes
- **WHEN** an admin selects a different optimization mode
- **THEN** the selected mode SHALL be visually indicated as active

#### Scenario: Indicate current mode
- **WHEN** the Strategy Panel loads
- **THEN** the currently configured optimization mode SHALL be pre-selected

### Requirement: guardrail-configuration
The Strategy Panel SHALL provide editable fields for strategy guardrails.

#### Scenario: Display max CAC payback field
- **WHEN** an admin views the Strategy Panel
- **THEN** an editable field for maximum CAC payback period SHALL be displayed

#### Scenario: Display max churn rate field
- **WHEN** an admin views the Strategy Panel
- **THEN** an editable field for maximum acceptable churn rate SHALL be displayed

#### Scenario: Display ARPA minimum field
- **WHEN** an admin views the Strategy Panel
- **THEN** an editable field for minimum ARPA SHALL be displayed

#### Scenario: Display ARPA maximum field
- **WHEN** an admin views the Strategy Panel
- **THEN** an editable field for maximum ARPA SHALL be displayed

#### Scenario: Validate guardrail values
- **WHEN** an admin enters a guardrail value
- **THEN** the input SHALL be validated for appropriate data type and reasonable ranges

### Requirement: configuration-persistence
The Strategy Panel SHALL save configuration changes to the backend API.

#### Scenario: Display save button
- **WHEN** an admin views the Strategy Panel
- **THEN** a save button SHALL be visible and accessible

#### Scenario: Submit configuration changes
- **WHEN** an admin clicks the save button
- **THEN** a PUT request SHALL be sent to /api/strategy-config with all configuration values

#### Scenario: Confirm successful save
- **WHEN** the configuration save request succeeds
- **THEN** the UI SHALL display a success confirmation message

#### Scenario: Handle save errors
- **WHEN** the configuration save request fails
- **THEN** the UI SHALL display an error message with relevant details

### Requirement: read-only-strategy-display
Non-admin users SHALL be able to view the current strategy configuration.

#### Scenario: Display current optimization mode
- **WHEN** a non-admin user views the Strategy Panel
- **THEN** the current optimization mode SHALL be displayed as read-only text

#### Scenario: Display current guardrails
- **WHEN** a non-admin user views the Strategy Panel
- **THEN** all current guardrail values SHALL be displayed as read-only text
