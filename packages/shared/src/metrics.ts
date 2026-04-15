export const METRIC_PRIORITIES = ['mvp', 'v1', 'v2'] as const;
export type MetricPriority = (typeof METRIC_PRIORITIES)[number];

export const METRIC_IDS = [
  'user_signups',
  'user_type_distribution',
  'searches_total',
  'trial_clicks_total',
  'clicks_per_trial',
  'logins',
  'searches_by_indication',
  'trial_split_by_indication',
  'regional_distribution',
  'hcp_split',
  'claimed_distribution',
  'search_edits',
  'patient_registrations',
  'letter_questionnaire_split',
  'searches_by_super_indication',
] as const;

export type MetricId = (typeof METRIC_IDS)[number];
