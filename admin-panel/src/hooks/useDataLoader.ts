import { useState, useEffect, useCallback, useRef } from 'react';

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
  const loadFnRef = useRef(loadFn);

  // Update ref when loadFn changes
  useEffect(() => {
    loadFnRef.current = loadFn;
  }, [loadFn]);

  const load = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const result = await loadFnRef.current();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, load, ...dependencies]);

  return { data, loading, error, refetch: load };
}

