import { useState, useEffect, useCallback } from 'react';
import { gamesApi } from '../api/api';

/**
 * Fetches games from MockAPI.
 * Returns { games, loading, error, refetch }
 */
export default function useGames() {
  const [games,   setGames]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchGames = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await gamesApi.getAll();
      setGames(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGames(); }, [fetchGames]);

  return { games, loading, error, refetch: fetchGames };
}
