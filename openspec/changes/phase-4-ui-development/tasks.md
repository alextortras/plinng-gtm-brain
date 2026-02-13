# Phase 4 UI Development - Task Breakdown

## Task Group 1: Shadcn/UI Setup

### Task 1.1: Initialize Shadcn/UI
- Run `npx shadcn-ui@latest init` to set up configuration
- Configure components.json with preferred style and theme
- Verify Tailwind CSS integration

### Task 1.2: Add Base Components
- Install Card component: `npx shadcn-ui@latest add card`
- Install Button component: `npx shadcn-ui@latest add button`
- Install Badge component: `npx shadcn-ui@latest add badge`
- Install Tabs component: `npx shadcn-ui@latest add tabs`
- Install Select component: `npx shadcn-ui@latest add select`
- Install Table component: `npx shadcn-ui@latest add table`

### Task 1.3: Verify Component Installation
- Create test page to render each component
- Verify styling and theme application
- Test component variants (primary/secondary buttons, card with header/footer, etc.)

## Task Group 2: App Shell

### Task 2.1: Create Root Layout
- Create `app/layout.tsx` with HTML structure
- Add font imports and metadata
- Set up basic styling and global CSS

### Task 2.2: Build Sidebar Navigation
- Create `components/sidebar.tsx` component
- Add navigation links for Dashboard, Leaderboards, Brain Insights, Settings
- Implement active route highlighting using `usePathname`
- Style sidebar with consistent spacing and hover states

### Task 2.3: Build Header Component
- Create `components/header.tsx` with user info display
- Add mock user context (name, role)
- Implement responsive layout adjustments
- Position header in layout grid

### Task 2.4: Set Up Route Structure
- Create `app/dashboard/page.tsx`
- Create `app/leaderboards/page.tsx`
- Create `app/brain-insights/page.tsx`
- Create `app/settings/page.tsx`
- Verify routing and navigation between pages

## Task Group 3: Shared UI Components

### Task 3.1: Create KPI Card Component
- Build `components/kpi-card.tsx` with props for title, value, change
- Add optional trend indicator (up/down arrow)
- Style with Card component from Shadcn/UI
- Support number formatting (currency, percentage, etc.)

### Task 3.2: Create Data Fetching Hooks
- Create `hooks/use-metrics.ts` for fetching dashboard metrics
- Create `hooks/use-leaderboards.ts` for fetching leaderboard data
- Create `hooks/use-insights.ts` for fetching brain insights
- Implement loading and error states in each hook

### Task 3.3: Create Chart Wrapper Components
- Install Recharts: `npm install recharts`
- Create `components/funnel-chart.tsx` wrapper for bar/funnel visualization
- Create `components/trend-chart.tsx` wrapper for line charts
- Add responsive container and default styling

## Task Group 4: Global Dashboard Page

### Task 4.1: Implement KPI Summary Cards
- Fetch metrics data using `use-metrics` hook
- Render four KPI cards: Blended CAC, Total Pipeline, Total Revenue, NRR
- Apply proper number formatting for each metric type
- Arrange cards in responsive grid layout

### Task 4.2: Build Funnel Visualization
- Fetch funnel stage data from metrics API
- Render FunnelChart component with stage data
- Add stage labels and values
- Implement hover tooltips for additional context

### Task 4.3: Add Market Filter
- Create market filter Select component (US/Spain/All)
- Store selected market in component state
- Pass market parameter to metrics API calls
- Update all dashboard data when market changes

### Task 4.4: Add Date Range Picker
- Implement date range Select or date picker component
- Store date range in component state
- Pass date range parameters to metrics API calls
- Update dashboard data when date range changes

### Task 4.5: Implement Drill-Down Navigation
- Make funnel chart stages clickable
- Add cursor pointer and hover styles to stages
- Implement navigation to Level 2 detail pages (placeholder)
- Pass stage parameter in navigation

## Task Group 5: Rep Leaderboards Page

### Task 5.1: Create Leaderboard Layout
- Build Tabs component with SDR, AE, CSM tabs
- Set up tab content areas for each role
- Implement tab switching state management

### Task 5.2: Build SDR Leaderboard
- Fetch SDR leaderboard data using `use-leaderboards` hook
- Render Table component with columns: Rank, Name, SALs, Conversion Rate, ARR
- Sort by SALs generated (descending)
- Format conversion rate as percentage, ARR as currency

### Task 5.3: Build AE Leaderboard
- Fetch AE leaderboard data
- Render Table with columns: Rank, Name, ARR Closed Won, Expansion, Conversion Rate, Churn
- Sort by ARR Closed Won (descending)
- Format all currency and percentage values

### Task 5.4: Build CSM Leaderboard
- Fetch CSM leaderboard data
- Render Table with columns: Rank, Name, GRR, Churn Rate, Resolution Rate, Health Score
- Sort by GRR percentage (descending)
- Format percentages and add visual indicators for health score

### Task 5.5: Ensure Full Transparency
- Verify all reps are visible to all authenticated users
- Remove any role-based filtering logic
- Test with different mock user roles to confirm visibility

## Task Group 6: Brain Inbox Page

### Task 6.1: Create Insight Card Component
- Build `components/insight-card.tsx` with props for urgency, category, stage, content
- Apply color coding based on urgency (red/amber/green)
- Add Badge components for category and stage labels
- Style as read-only Card with clear visual hierarchy

### Task 6.2: Implement Insight List Display
- Fetch insights data using `use-insights` hook
- Render array of InsightCard components
- Group or sort by urgency level
- Handle empty state when no insights exist

### Task 6.3: Add Filter Controls
- Create category filter Select (strategic/tactical/all)
- Create stage filter Select (list of funnel stages)
- Implement client-side filtering of insight cards
- Update display when filters change

### Task 6.4: Build Generate Insights Button
- Add Button component with "Generate Insights" label
- Implement onClick handler to POST to /api/brain/insights
- Show loading state during generation
- Handle success and error responses

### Task 6.5: Implement Streaming Display
- Set up fetch with streaming response handling
- Parse streamed JSON or text data incrementally
- Update insight card display as chunks arrive
- Show completion indicator when stream ends

## Task Group 7: Strategy Panel Page

### Task 7.1: Create Strategy Form Layout
- Build form structure with sections for mode and guardrails
- Add descriptive labels for each configuration field
- Implement responsive form layout

### Task 7.2: Implement Mode Toggle
- Create radio group or segmented control for three modes
- Options: Maximize Revenue, Maximize Efficiency, Maximize Activation
- Fetch current config from /api/strategy-config
- Display selected mode with visual indication

### Task 7.3: Build Guardrail Input Fields
- Create number inputs for max CAC payback, max churn rate
- Create number inputs for ARPA min and ARPA max
- Add input validation for numeric values and ranges
- Pre-populate fields with current config values

### Task 7.4: Implement Save Functionality
- Add Save button (visible only to admins)
- Collect form values on submit
- Send PUT request to /api/strategy-config
- Display success or error toast notification

### Task 7.5: Add Role-Based Rendering
- Check mock user role (admin vs non-admin)
- Render editable form for admin users
- Render read-only display for non-admin users
- Hide save button for non-admin users

## Task Group 8: Validation and Testing

### Task 8.1: TypeScript Type Checking
- Run `npm run type-check` or `tsc --noEmit`
- Fix any type errors in components and hooks
- Ensure all API response types are properly defined

### Task 8.2: Development Server Testing
- Start dev server with `npm run dev`
- Navigate through all pages and verify rendering
- Test navigation links and route transitions
- Verify active route highlighting

### Task 8.3: Component Integration Testing
- Test KPI cards with various data formats
- Test leaderboard tables with different row counts
- Test filter interactions and data updates
- Test insight generation and streaming display

### Task 8.4: Visual Quality Review
- Verify consistent spacing and alignment across pages
- Check color usage matches urgency coding system
- Ensure responsive behavior at different viewport widths
- Validate accessibility of interactive elements

### Task 8.5: Error Handling Verification
- Test behavior with failed API requests
- Verify error messages are displayed appropriately
- Test loading states for all async operations
- Ensure graceful degradation when data is unavailable
