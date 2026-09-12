import { useEffect, useState } from 'react';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Skeleton } from './components/ui/skeleton';
import { categoryBadgeClass, categoryLabel } from './lib/manual/category-ui';
import { filterManualItems } from './lib/manual/search';
import { loadHotoneEffects } from './lib/hotone/load';
import type { HotoneUnifiedEffect } from './lib/hotone/types';

function formatLabel(value: string): string {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function CatalogSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="bg-zinc-900/70">
          <CardHeader className="gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded-full" />
                <Skeleton className="h-3 w-60 rounded-full" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-3 w-5/6 rounded-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <Card className="border-dashed bg-zinc-900/50 shadow-none">
      <CardHeader className="items-center text-center">
        <CardTitle className="text-base text-zinc-100 sm:text-lg">
          {query ? `No effects match "${query.trim()}".` : 'No effects available.'}
        </CardTitle>
        <CardDescription>Try a different title or description keyword.</CardDescription>
      </CardHeader>
    </Card>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <Card className="border-red-900/50 bg-red-950/30 shadow-none">
      <CardHeader>
        <CardTitle className="text-red-100">Failed to load the catalog.</CardTitle>
        <CardDescription className="text-red-200/80">{error}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button type="button" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}

function CatalogItem({ item }: { item: HotoneUnifiedEffect }) {
  return (
    <Card className="bg-zinc-900/70 transition hover:border-zinc-700 hover:bg-zinc-900">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base sm:text-lg">{item.title}</CardTitle>
            <CardDescription className="mt-2 text-sm leading-6 text-zinc-300 sm:text-[15px]">
              {item.description}
            </CardDescription>
          </div>
          {item.category ? (
            <Badge variant="outline" className={categoryBadgeClass(item.category)}>
              {categoryLabel(item.category)}
            </Badge>
          ) : null}
        </div>
        {item.subtype ? (
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
            {formatLabel(item.subtype)}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2 pt-1">
          {item.pedalboards.map((pedalboard) => (
            <Badge key={pedalboard} variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-200">
              {pedalboard}
            </Badge>
          ))}
        </div>
      </CardHeader>
    </Card>
  );
}

export default function App() {
  const [items, setItems] = useState<HotoneUnifiedEffect[]>([]);
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
        const nextItems = await loadHotoneEffects();

        if (!cancelled) {
          setItems(nextItems);
        }
      } catch (cause) {
        if (!cancelled) {
          setItems([]);
          setError(cause instanceof Error ? cause.message : 'Failed to load Hotone catalog');
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
        <Card>
          <CardHeader>
            <p className="text-[11px] uppercase tracking-[0.32em] text-zinc-500">Hotone</p>
            <CardTitle className="text-3xl sm:text-4xl">AMPERO FX catalog</CardTitle>
            <CardDescription className="max-w-xl text-sm leading-6 sm:text-base">
              Browse Hotone effects and search across titles, descriptions, and supported pedalboards.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="catalog-search"
                className="block text-xs font-medium uppercase tracking-[0.2em] text-zinc-500"
              >
                Search
              </label>
              <div className="relative">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500"
                >
                  <path
                    d="M8.5 14a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11Zm3.85-1.65L17 17"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <Input
                  id="catalog-search"
                  aria-label="Search effects by title, description, or pedalboard"
                  placeholder="Search title, description, or pedalboard"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  disabled={isLoading}
                  className="pr-20 pl-11"
                />
                {query ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-3"
                    onClick={() => setQuery('')}
                  >
                    Clear
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-4 text-sm text-zinc-400">
              <p aria-live="polite">
                {isLoading ? 'Loading catalog...' : `${visibleCount} of ${totalItems} effects visible`}
              </p>
              {!isLoading && !error && totalItems > 0 ? (
                <p className="text-zinc-500">Search matches title, description, and pedalboards.</p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <section className="flex-1 pb-4">
          {isLoading ? (
            <CatalogSkeleton />
          ) : error ? (
            <ErrorState error={error} onRetry={() => setReloadCount((count) => count + 1)} />
          ) : visibleItems.length === 0 ? (
            <EmptyState query={query} />
          ) : (
            <ul className="space-y-3">
              {visibleItems.map((item) => (
                <li key={`${item.title}-${item.description}`}>
                  <CatalogItem item={item} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
