/**
 * Normalized data schema — the contract between data adapters and chart logic.
 *
 * Every adapter (bubble_adapter, supabase_adapter, ...) returns data in these
 * shapes. When these types change, apps/api/app/schema/ must be kept in sync.
 */

export type IsoMonth = `${number}-${number}`;

export interface MonthlyMetric {
  month: IsoMonth;
  value: number;
}

export interface CumulativeMetric {
  month: IsoMonth;
  monthly: number;
  cumulative: number;
}

export interface SponsorRef {
  sponsor_id: string;
  sponsor_name: string;
}

export interface StudyRef {
  study_id: string;
  study_name: string;
  sponsor_id: string;
}

export interface TrialClicks {
  study_id: string;
  study_name: string;
  sponsor_id: string;
  month: IsoMonth;
  clicks: number;
}

export interface UserTypeDistribution {
  user_type: string;
  count: number;
}

export interface IndicationMetric {
  indication: string;
  month: IsoMonth;
  value: number;
}
