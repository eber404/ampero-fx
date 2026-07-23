import { useEffect, useState } from 'react';
import { loadManualItems } from './lib/manual/load';
import { filterManualItems } from './lib/manual/search';
import type { ManualItem } from './lib/manual/types';

function CatalogSkeleton() {
  return (
    <ul className="space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <li
          key={index}
          className="rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-5 shadow-lg shadow-black/10"
        >
          <div className="h-4 w-32 animate-pulse rounded-full bg-zinc-800/90" />
          <div className="mt-4 h-3 w-full animate-pulse rounded-full bg-zinc-800/70" />
          <div className="mt-2 h-3 w-5/6 animate-pulse rounded-full bg-zinc-800/70" />
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/50 px-6 py-16 text-center text-zinc-300">
      <p className="text-base font-medium text-zinc-100">
        {query ? `No models match "${query.trim()}".` : 'No models available.'}
      </p>
      <p className="mt-2 text-sm leading-6 text-zinc-400">
        Try a different title or description keyword.
      </p>
    </div>
  );
}

export default function App() {
  const [items, setItems] = useState<ManualItem[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      setIsLoading(true);
      setError(null);

      try {
        const nextItems = await loadManualItems();

        if (!cancelled) {
          setItems(nextItems);
        }
      } catch (cause) {
        if (!cancelled) {
          setItems([]);
          setError(cause instanceof Error ? cause.message : 'Failed to load manual catalog');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadCatalog();

    return () => {
      cancelled = true;
    };
  }, [reloadCount]);

  const visibleItems = filterManualItems(items, query);
  const totalItems = items.length;
  const visibleCount = visibleItems.length;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(63,63,70,0.35),_transparent_28%),linear-gradient(180deg,_#09090b_0%,_#050506_100%)] text-zinc-100">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <header className="rounded-[2rem] border border-zinc-800/80 bg-zinc-950/75 p-5 shadow-2xl shadow-black/20 backdrop-blur xl:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] uppercase tracking-[0.32em] text-zinc-500">Ampero Mini</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
                Models catalog
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400 sm:text-base">
                Browse the extracted manual catalog and search across model names and descriptions.
              </p>
            </div>

            <div className="w-full max-w-md">
              <label className="block text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
                Search
                <div className="mt-2 flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/90 px-4 py-3 shadow-inner shadow-black/20 transition focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-600">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="h-5 w-5 shrink-0 text-zinc-500"
                  >
                    <path
                      d="M8.5 14a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11Zm3.85-1.65L17 17"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <input
                    className="w-full bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600 disabled:cursor-not-allowed"
                    aria-label="Search models by title or description"
                    placeholder="Search title or description"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    disabled={isLoading}
                  />
                  {query ? (
                    <button
                      type="button"
                      className="rounded-full px-2 py-1 text-xs font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
                      onClick={() => setQuery('')}
                    >
                      Clear
                    </button>
                  ) : null}
                </div>
              </label>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-4 text-sm text-zinc-400">
            <p aria-live="polite">
              {isLoading ? 'Loading catalog...' : `${visibleCount} of ${totalItems} models visible`}
            </p>
            {!isLoading && !error && totalItems > 0 ? (
              <p className="text-zinc-500">Search matches title and description.</p>
            ) : null}
          </div>
        </header>

        <section className="flex-1 pb-4">
          {isLoading ? (
            <CatalogSkeleton />
          ) : error ? (
            <div
              role="alert"
              className="rounded-3xl border border-red-900/50 bg-red-950/30 px-6 py-10 text-center shadow-lg shadow-black/10"
            >
              <p className="text-lg font-medium text-red-100">Failed to load the catalog.</p>
              <p className="mt-2 text-sm leading-6 text-red-200/80">{error}</p>
              <button
                type="button"
                className="mt-6 rounded-full border border-red-800 bg-red-900/40 px-4 py-2 text-sm font-medium text-red-50 transition hover:bg-red-900/60"
                onClick={() => setReloadCount((count) => count + 1)}
              >
                Retry
              </button>
            </div>
          ) : visibleItems.length === 0 ? (
            <EmptyState query={query} />
          ) : (
            <ul className="space-y-3">
              {visibleItems.map((item) => (
                <li
                  key={`${item.title}-${item.description}`}
                  className="rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-5 shadow-lg shadow-black/10 transition hover:border-zinc-700 hover:bg-zinc-900"
                >
                  <h2 className="text-base font-medium text-zinc-50 sm:text-lg">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-300 sm:text-[15px]">{item.description}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
