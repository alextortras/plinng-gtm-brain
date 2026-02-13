import { FunnelStage, RevenueType } from '@/types/database';

/**
 * Maps funnel stages to revenue types:
 * - New Business: selection + commit (pre-close pipeline)
 * - Expansion: growth (existing account upsells)
 * - Renewals: impact (retention, adjusted by GRR)
 */
const STAGE_TO_REVENUE_TYPE: Partial<Record<FunnelStage, RevenueType>> = {
  selection: 'new_business',
  commit: 'new_business',
  growth: 'expansion',
  impact: 'renewals',
};

/**
 * All stages that contribute to forecasting (excludes top-of-funnel awareness/education
 * and post-revenue advocacy/onboarding).
 */
export const FORECASTABLE_STAGES: FunnelStage[] = ['selection', 'commit', 'growth', 'impact'];

export function getRevenueType(stage: FunnelStage): RevenueType | null {
  return STAGE_TO_REVENUE_TYPE[stage] ?? null;
}

export function getStagesForRevenueType(revenueType: RevenueType): FunnelStage[] {
  return Object.entries(STAGE_TO_REVENUE_TYPE)
    .filter(([, rt]) => rt === revenueType)
    .map(([stage]) => stage as FunnelStage);
}
