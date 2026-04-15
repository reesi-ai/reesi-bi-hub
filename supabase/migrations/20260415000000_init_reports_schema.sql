-- Create the `reports` schema — cache layer for dashboards and customer reports.
-- See AGENTS.md → Core Principles → Caching Tiers.

create schema if not exists reports;

comment on schema reports is
  'Cache layer for reports.reesi.de. Nightly-refreshed dashboard metrics and on-demand sponsor-report data. Raw data is owned by adapters, not this schema.';

-- Metadata table tracking last refresh per metric (populated by nightly cache job).
create table if not exists reports.refresh_log (
  id bigserial primary key,
  metric_id text not null,
  source text not null,
  refreshed_at timestamptz not null default now(),
  row_count integer not null default 0,
  notes text
);

create index if not exists refresh_log_metric_refreshed_idx
  on reports.refresh_log (metric_id, refreshed_at desc);

comment on table reports.refresh_log is
  'One row per metric refresh. Used to surface freshness in the dashboard and to decide cache invalidation.';
