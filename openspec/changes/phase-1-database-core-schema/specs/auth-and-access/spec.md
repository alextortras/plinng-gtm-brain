## ADDED Requirements

### Requirement: google-workspace-sso
The system SHALL authenticate users exclusively via Google Workspace SSO through Supabase Auth.

#### Scenario: user signs in
- **WHEN** a user navigates to the application
- **THEN** they are redirected to Google Workspace OAuth flow and authenticated via Supabase Auth

#### Scenario: unauthorized domain
- **WHEN** a user attempts to sign in with a Google account outside the authorized workspace domain
- **THEN** access is denied

### Requirement: role-based-access
The system SHALL support user roles: `admin`, `manager`, and `member`. Roles are stored in a `user_profiles` table linked to Supabase Auth UIDs.

#### Scenario: role assignment
- **WHEN** an admin assigns a role to a user
- **THEN** the `user_profiles` row is updated with the new role

#### Scenario: default role
- **WHEN** a new user authenticates for the first time
- **THEN** a `user_profiles` row is created with the default `member` role

### Requirement: row-level-security
All tables SHALL have Row-Level Security enabled. Read access is granted to all authenticated users. Write access varies by table.

#### Scenario: authenticated read
- **WHEN** any authenticated user queries any table
- **THEN** read access is granted (full transparency policy)

#### Scenario: unauthenticated access
- **WHEN** an unauthenticated request reaches any table
- **THEN** access is denied
