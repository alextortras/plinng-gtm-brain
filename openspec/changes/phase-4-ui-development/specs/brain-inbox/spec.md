# Brain Inbox Specification

## ADDED Requirements

### Requirement: insight-notification-center
The Brain Inbox SHALL provide a read-only notification center for AI-generated insights.

#### Scenario: Display insights as cards
- **WHEN** a user views the Brain Inbox
- **THEN** each insight SHALL be displayed as a distinct card with clear visual separation

#### Scenario: Read-only insight display
- **WHEN** a user interacts with an insight card
- **THEN** the insight content SHALL be readable but not editable

### Requirement: urgency-categorization
The Brain Inbox SHALL categorize and display insights by urgency level.

#### Scenario: Display high urgency insights
- **WHEN** insights are categorized as high urgency
- **THEN** they SHALL be displayed with red color coding

#### Scenario: Display medium urgency insights
- **WHEN** insights are categorized as medium urgency
- **THEN** they SHALL be displayed with amber color coding

#### Scenario: Display low urgency insights
- **WHEN** insights are categorized as low urgency
- **THEN** they SHALL be displayed with green color coding

#### Scenario: Group by urgency
- **WHEN** multiple insights exist with different urgency levels
- **THEN** insights SHALL be visually grouped or sorted by urgency level

### Requirement: insight-filtering
The Brain Inbox SHALL allow users to filter insights by category and funnel stage.

#### Scenario: Filter by strategic category
- **WHEN** a user selects the strategic category filter
- **THEN** only strategic insights SHALL be displayed

#### Scenario: Filter by tactical category
- **WHEN** a user selects the tactical category filter
- **THEN** only tactical insights SHALL be displayed

#### Scenario: Filter by funnel stage
- **WHEN** a user selects a specific funnel stage filter
- **THEN** only insights related to that stage SHALL be displayed

#### Scenario: Combine multiple filters
- **WHEN** a user applies both category and stage filters
- **THEN** only insights matching both criteria SHALL be displayed

### Requirement: insight-generation
The Brain Inbox SHALL provide a mechanism to request new AI-generated insights.

#### Scenario: Display generate button
- **WHEN** a user views the Brain Inbox
- **THEN** a "Generate Insights" button SHALL be prominently displayed

#### Scenario: Trigger insight generation
- **WHEN** a user clicks the "Generate Insights" button
- **THEN** a POST request SHALL be sent to /api/brain/insights

#### Scenario: Indicate generation in progress
- **WHEN** insight generation is triggered
- **THEN** the UI SHALL display a loading state until generation completes

### Requirement: streaming-display
The Brain Inbox SHALL display AI-generated insights as they are streamed from the server.

#### Scenario: Begin streaming display
- **WHEN** the server begins streaming insight data
- **THEN** the UI SHALL immediately begin displaying content as it arrives

#### Scenario: Update display progressively
- **WHEN** additional insight content is received during streaming
- **THEN** the display SHALL update progressively without waiting for completion

#### Scenario: Complete streaming display
- **WHEN** the server completes streaming all insight data
- **THEN** the UI SHALL indicate that generation is complete and display the final state
