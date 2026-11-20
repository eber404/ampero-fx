import { useEffect, useState } from 'react';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Skeleton } from './components/ui/skeleton';
import { categoryBadgeClass, categoryLabel } from './lib/manual/category-ui';
import { filterManualItems, queryTerms } from './lib/manual/search';
import { loadHotoneEffects } from './lib/hotone/load';
import type { HotoneUnifiedEffect } from './lib/hotone/types';

const countFormat = new Intl.NumberFormat('en-US');

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
        <Card key={index} className="bg-zinc-900/40">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-60" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-3 w-5/6" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <Card className="border-dashed bg-transparent shadow-none">
      <CardHeader className="items-center text-center">
        <CardTitle className="text-base text-zinc-100 sm:text-lg">
          {query ? `No effects match "${query.trim()}".` : 'No effects available.'}
        </CardTitle>
        {query ? <CardDescription>Try a shorter search term.</CardDescription> : null}
      </CardHeader>
    </Card>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <Card className="border-red-900/60 bg-red-950/20 shadow-none">
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
    <Card className="bg-zinc-900/40 transition-colors hover:border-zinc-700 hover:bg-zinc-900/60">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <CardTitle className="text-base sm:text-lg">{item.title}</CardTitle>
            {item.subtype ? <p className="mt-1 text-xs text-zinc-500">{formatLabel(item.subtype)}</p> : null}
            <CardDescription className="mt-2">{item.description}</CardDescription>
          </div>
          {item.category ? (
            <Badge variant="outline" className={categoryBadgeClass(item.category)}>
              {categoryLabel(item.category)}
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {item.pedalboards.map((pedalboard) => (
            <Badge key={pedalboard} variant="outline" className="border-zinc-800 text-zinc-400">
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
  const [tags, setTags] = useState<string[]>([]);
  const [pedalboard, setPedalboard] = useState('');
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

  const searchTerms = [...tags, ...queryTerms(query)];
  const pedalboards = [...new Set(items.flatMap((item) => item.pedalboards))].sort((a, b) => a.localeCompare(b));
  const visibleItems = filterManualItems(items, searchTerms).filter(
    (item) => !pedalboard || item.pedalboards.includes(pedalboard),
  );
  const totalItems = items.length;
  const visibleCount = visibleItems.length;
  const isSearching = searchTerms.length > 0 || Boolean(pedalboard);

  const countLabel = isSearching
    ? `${countFormat.format(visibleCount)} of ${countFormat.format(totalItems)} effects`
    : `${countFormat.format(totalItems)} effects`;

  return (
    <main className="min-h-screen text-zinc-100">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Card className="z-20 bg-zinc-900 lg:sticky lg:top-6">
          <CardHeader className="p-5 sm:p-6">
            <CardTitle className="text-2xl sm:text-3xl">Ampero FX catalog</CardTitle>
            <CardDescription className="max-w-xl">
              Hotone effects and the pedalboards that support them.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 px-5 pb-5 sm:px-6 sm:pb-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4 text-xs text-zinc-400">
                <label htmlFor="catalog-search" className="font-medium">Search</label>
                <span id="search-hint">Enter to add tags</span>
              </div>
              {tags.length > 0 ? (
                <ul aria-label="Search tags" className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <li key={tag}>
                      <button
                        type="button"
                        aria-label={`Remove tag ${tag}`}
                        onClick={() => setTags((current) => current.filter((value) => value !== tag))}
                        className="inline-flex min-h-8 items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1 text-sm text-zinc-100 transition-colors duration-150 ease-out hover:border-zinc-500 hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
                      >
                        {tag}
                        <span aria-hidden="true" className="text-zinc-400">×</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_13rem]">
                <div className="relative">
                  <Input
                    id="catalog-search"
                    aria-describedby="search-hint"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.nativeEvent.isComposing) return;
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        setTags((current) => [...new Set([...current, ...queryTerms(query)])]);
                        setQuery('');
                      } else if (event.key === 'Backspace' && query.length === 0) {
                        setTags((current) => current.slice(0, -1));
                      }
                    }}
                    disabled={isLoading}
                    className="pr-20"
                  />
                  {query || tags.length > 0 || pedalboard ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => {
                        setTags([]);
                        setQuery('');
                        setPedalboard('');
                      }}
                    >
                      Clear
                    </Button>
                  ) : null}
                </div>
                <div className="space-y-1">
                  <label htmlFor="catalog-pedalboard" className="block text-xs font-medium text-zinc-400">
                    Pedalboard
                  </label>
                  <select
                    id="catalog-pedalboard"
                    value={pedalboard}
                    onChange={(event) => setPedalboard(event.target.value)}
                    disabled={isLoading}
                    className="flex h-10 w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600/50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">All pedalboards</option>
                    {pedalboards.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <p aria-live="polite" className="border-t border-zinc-800/80 pt-4 text-sm text-zinc-400">
              {isLoading ? 'Loading catalog...' : countLabel}
            </p>
          </CardContent>
        </Card>

        <section className="flex-1 pb-4">
          {isLoading ? (
            <CatalogSkeleton />
          ) : error ? (
            <ErrorState error={error} onRetry={() => setReloadCount((count) => count + 1)} />
          ) : visibleItems.length === 0 ? (
            <EmptyState query={searchTerms.join(' ')} />
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
