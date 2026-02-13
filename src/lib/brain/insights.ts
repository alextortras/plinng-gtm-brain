export interface BrainInsight {
  category: 'strategic' | 'tactical';
  urgency: 'high' | 'medium' | 'low';
  headline: string;
  detail: string;
  stage: string;
  market: 'us' | 'spain' | 'all';
}
