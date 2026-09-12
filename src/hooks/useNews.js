import { useState, useEffect, useCallback } from 'react';
import { newsApi } from '../api/api';

/**
 * Fetches news from MockAPI.
 * Returns { articles, loading, error, refetch }
 */
export default function useNews() {
  const [articles, setArticles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await newsApi.getAll();
      setArticles(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  return { articles, loading, error, refetch: fetchNews };
}
