import { HeatmapGermany } from '@/components/charts/HeatmapGermany';
import { SAMPLE_PFIZER_DATASET } from '@/lib/heatmap/sample-data';

export default function HeatmapDemoPage() {
  return (
    <main className="min-h-screen px-6 py-12 md:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <span className="inline-block rounded-full border border-[color:var(--color-border-brand)] bg-[color:var(--color-brand-light)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[color:var(--color-brand-dark)]">
            Regional Distribution
          </span>
          <h1 className="mt-4 text-3xl font-semibold text-ink-950 md:text-4xl">
            Germany Search Heatmap
          </h1>
          <p className="prose-content mt-3 max-w-3xl text-lg text-ink-800">
            Dichte der Suchanfragen je Standort. Wird für Customer Reports als PNG exportiert und
            per Puppeteer in die PDF eingebettet.
          </p>
        </header>

        <HeatmapGermany dataset={SAMPLE_PFIZER_DATASET} exportName="reesi-heatmap-pfizer-demo" />
      </div>
    </main>
  );
}
