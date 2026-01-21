import { useState, useEffect, useCallback } from 'react';

interface UseDataLoaderOptions<T> {
  loadFn: () => Promise<T>;
  dependencies?: any[];
  enabled?: boolean;
}

export function useDataLoader<T>({
  loadFn,
  dependencies = [],
  enabled = true,
}: UseDataLoaderOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await loadFn();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [loadFn, enabled]);

  useEffect(() => {
    load();
  }, [load, ...dependencies]);

  return { data, loading, error, refetch: load };
}

