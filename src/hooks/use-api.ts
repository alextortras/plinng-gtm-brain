'use client';

import { useState, useEffect, useCallback } from 'react';
import { isDemoMode, resolveMockData } from '@/lib/mock-data';

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(url: string, params?: Record<string, string>): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryString = params
    ? '?' + new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== '' && v !== undefined)
      ).toString()
    : '';

  const fullUrl = url + queryString;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Demo mode: return mock data without hitting the API
    if (isDemoMode()) {
      await new Promise((r) => setTimeout(r, 300));
      const mock = resolveMockData(fullUrl);
      if (mock !== null) {
        setData(mock as T);
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch(fullUrl);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [fullUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
