export default function Home() {
  return (
    <main className="min-h-screen px-6 py-16 md:px-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12">
          <span className="inline-block rounded-full border border-[color:var(--color-border-brand)] bg-[color:var(--color-brand-light)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[color:var(--color-brand-dark)]">
            Reesi BI Hub
          </span>
          <h1 className="mt-4 text-4xl font-semibold text-ink-950 md:text-5xl">
            reports.reesi.de
          </h1>
          <p className="prose-content mt-3 max-w-2xl text-lg text-ink-800">
            Internal analytics dashboard and customer-facing PDF reports — one platform, built
            scope-small, extended continuously.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="glass-card p-6">
            <h2 className="text-xl font-semibold text-ink-950">Internal Analytics</h2>
            <p className="prose-content mt-2 text-ink-800">
              Flexible, fast-iteration dashboards for the Reesi team. Nightly-cached metrics from
              Bubble, Supabase, and Plausible.
            </p>
          </article>

          <article className="glass-card p-6">
            <h2 className="text-xl font-semibold text-ink-950">Customer Reports</h2>
            <p className="prose-content mt-2 text-ink-800">
              Reproducible sponsor-specific PDF reports. Puppeteer-rendered, pixel-perfect,
              zero post-processing.
            </p>
          </article>
        </section>

        <section className="mt-8">
          <button className="btn-primary">Get started</button>
        </section>
      </div>
    </main>
  );
}
