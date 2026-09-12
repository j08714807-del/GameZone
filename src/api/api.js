/* ─────────────────────────────────────────────
   MockAPI base configuration
   ───────────────────────────────────────────── */

const BASE_MAIN   = 'https://6aa122d82703577aa1e353be.mockapi.io';
const BASE_ORDERS = 'https://6aa50c351397053d42bb6705.mockapi.io';

async function request(base, path, options = {}) {
  const res = await fetch(`${base}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${options.method ?? 'GET'} ${path} → ${res.status}: ${text}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/* ── Shorthand helpers ── */
const main   = (path, opts)       => request(BASE_MAIN,   path, opts);
const orders = (path, opts)       => request(BASE_ORDERS, path, opts);

/* ── Games ── */
export const gamesApi = {
  getAll:          ()          => main('/games'),
  getOne:          (id)        => main(`/games/${id}`),
  create:          (data)      => main('/games', { method: 'POST',   body: JSON.stringify(data) }),
  update:          (id, data)  => main(`/games/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove:          (id)        => main(`/games/${id}`, { method: 'DELETE' }),
};

/* ── News ── */
export const newsApi = {
  getAll:          ()          => main('/news'),
  getOne:          (id)        => main(`/news/${id}`),
  create:          (data)      => main('/news', { method: 'POST',   body: JSON.stringify(data) }),
  update:          (id, data)  => main(`/news/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove:          (id)        => main(`/news/${id}`, { method: 'DELETE' }),
};

/* ── Orders (separate MockAPI project) ── */
export const ordersApi = {
  getAll:          ()          => orders('/orders'),
  getOne:          (id)        => orders(`/orders/${id}`),
  create:          (data)      => orders('/orders', { method: 'POST',   body: JSON.stringify(data) }),
  update:          (id, data)  => orders(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove:          (id)        => orders(`/orders/${id}`, { method: 'DELETE' }),
  /* Фильтрация по email пользователя */
  getByEmail:      (email)     => orders(`/orders?email=${encodeURIComponent(email)}`),
};
