# Phase 4 UI Development - Design Document

## Context

The API layer for GTM Brain has been implemented in previous phases, providing endpoints for metrics, leaderboards, insights, and strategy configuration. Phase 4 focuses on building the visual layer that enables users to interact with this data through a modern web interface.

The UI must support three levels of data visualization:
- **Level 1**: Executive overview with high-level KPIs and complete funnel view
- **Level 2**: Stage-specific drill-downs with detailed metrics per funnel stage
- **Level 3**: Individual representative performance leaderboards

Additionally, the UI must provide access to AI-generated insights through the Brain Inbox and allow strategy configuration through the Strategy Panel.

## Goals

- Build complete Level 1 Global Dashboard with KPI cards and funnel visualization
- Implement Level 3 Rep Leaderboards with role-specific tabs (SDR, AE, CSM)
- Create Brain Inbox for displaying and generating AI insights
- Develop Strategy Panel for admin configuration of optimization modes and guardrails
- Establish consistent app shell with navigation, header, and routing
- Integrate with existing backend API endpoints

## Non-Goals

- Mobile-first optimization or responsive mobile layouts (desktop-first approach)
- Real-time WebSocket updates or live data streaming (polling or manual refresh)
- Dark mode theme support (light mode only for initial release)
- Level 2 stage-specific drill-down pages (deferred to future phase)
- Advanced data visualization features beyond basic charts
- User authentication implementation (mock user context for development)
- Backend modifications or API changes

## Design Decisions

### Component Library: Shadcn/UI

We will use Shadcn/UI as the foundation for UI components:
- **Card**: Container for KPI metrics, insights, and leaderboard tables
- **Button**: Primary actions (Generate Insights, Save, navigation)
- **Badge**: Visual indicators for urgency levels and status
- **Tabs**: Role selection in leaderboards (SDR/AE/CSM)
- **Select**: Market filter and date range picker dropdowns
- **Table**: Structured display of leaderboard data

**Rationale**: Shadcn/UI provides high-quality, accessible components that are copied into the project rather than installed as dependencies. This gives us full control over styling and behavior while maintaining consistency.

### Chart Library: Recharts

We will use Recharts for all data visualizations:
- **BarChart**: Funnel stage visualization with horizontal or vertical bars
- **LineChart**: Trend lines for metrics over time (if needed)
- **Custom Funnel**: Potential custom funnel shape using composed charts

**Rationale**: Recharts is React-native, composable, and provides good defaults for common business charts. It integrates well with React components and supports responsive sizing.

### Data Fetching Strategy

Client-side fetching using native fetch API with useState/useEffect:
- No additional libraries like SWR or React Query
- Simple loading states with boolean flags
- Error handling with try/catch blocks
- Manual refresh or periodic polling where needed

**Rationale**: Keeps dependencies minimal for initial implementation. Future phases can add more sophisticated data fetching libraries if complexity grows.

### Routing and Layout

Next.js App Router with persistent layout:
- Root layout contains sidebar navigation and header
- Individual pages for Dashboard, Leaderboards, Brain Inbox, Settings
- Active route highlighting using usePathname hook
- Nested layouts where appropriate

**Rationale**: App Router provides modern React patterns with server/client component flexibility. Persistent layout avoids re-rendering navigation on route changes.

### Color Coding System

Urgency and status indicators:
- **High urgency**: Red (#EF4444 or Tailwind red-500)
- **Medium urgency**: Amber (#F59E0B or Tailwind amber-500)
- **Low urgency**: Green (#10B981 or Tailwind green-500)

**Rationale**: Standard traffic light pattern is universally understood and accessible when combined with text labels.

### Development Authentication

Mock user context during development:
- Hardcoded user object with role property
- Role-based UI rendering (admin vs non-admin views)
- No actual authentication flows or token management

**Rationale**: Allows UI development to proceed without blocking on authentication implementation. Real auth can be integrated in a future phase.

## Risks and Mitigations

### Risk: No Real Authentication in Development

**Impact**: Cannot test actual role-based access control or user-specific data filtering.

**Mitigation**:
- Design components to accept user context as props
- Make role checks explicit and centralized
- Document auth integration points for future implementation

### Risk: Recharts Bundle Size

**Impact**: Recharts can add significant bundle size (~100-150KB gzipped), potentially slowing initial page load.

**Mitigation**:
- Use dynamic imports for chart components where possible
- Consider code splitting by route to load charts only on dashboard pages
- Monitor bundle size and evaluate alternatives if it becomes problematic

### Risk: API Response Time

**Impact**: Slow API responses could result in poor user experience with long loading states.

**Mitigation**:
- Implement skeleton loaders for better perceived performance
- Show partial data while remaining data loads
- Consider caching strategies for frequently accessed data

### Risk: Limited Error Handling

**Impact**: Without sophisticated error boundaries, API failures could result in blank screens or unhelpful error messages.

**Mitigation**:
- Implement basic error boundaries at page level
- Display user-friendly error messages with retry options
- Log errors to console for debugging during development
