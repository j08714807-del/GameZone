import { useState, useEffect, useCallback } from 'react';
import { ordersApi } from '../api/api';

/**
 * Fetches orders from MockAPI.
 * If email is passed — fetches only that user's orders.
 * Returns { orders, loading, error, refetch }
 */
export default function useOrders(email = null) {
  const [ordersList, setOrders]  = useState([]);
  const [loading,    setLoading] = useState(true);
  const [error,      setError]   = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = email
        ? await ordersApi.getByEmail(email)
        : await ordersApi.getAll();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return { orders: ordersList, loading, error, refetch: fetchOrders };
}
