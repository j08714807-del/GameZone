import { useState, useMemo } from 'react';
import { Search, Eye, Ban, X } from 'lucide-react';
import useOrders from '../../hooks/useOrders';

const PAGE_SIZE = 10;

export default function AdminUsers() {
  const { orders, loading } = useOrders();

  /* Собираем уникальных пользователей из реальных заказов */
  const users = useMemo(() => {
    const map = new Map();
    orders.forEach(o => {
      const key = o.email || o.userId || String(o.id);
      if (!map.has(key)) {
        map.set(key, {
          id:       key,
          name:     o.customerName || o.email?.split('@')[0] || 'Покупатель',
          email:    o.email || '—',
          phone:    o.phone || '—',
          joined:   o.createdAt ? o.createdAt.split('T')[0] : '—',
          orders:   0,
          spent:    0,
          status:   'Активен',
          lastOrder: o.createdAt || '',
        });
      }
      const u = map.get(key);
      u.orders += 1;
      u.spent  += parseFloat(o.total || 0);
      if (o.createdAt > u.lastOrder) u.lastOrder = o.createdAt;
    });
    return Array.from(map.values()).map(u => ({
      ...u,
      spent: parseFloat(u.spent.toFixed(2)),
    }));
  }, [orders]);

  const [search,    setSearch]    = useState('');
  const [filter,    setFilter]    = useState('Все');
  const [page,      setPage]      = useState(1);
  const [detail,    setDetail]    = useState(null);
  const [bannedIds, setBannedIds] = useState(new Set());

  const getStatus = (u) => bannedIds.has(u.id) ? 'Заблокирован' : 'Активен';

  const filtered = useMemo(() => users.filter(u => {
    const q      = search.toLowerCase();
    const matchS = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const st     = getStatus(u);
    const matchF = filter === 'Все' || st === filter;
    return matchS && matchF;
  }), [users, search, filter, bannedIds]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  const toggleBan = (id) => {
    setBannedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setDetail(d => d?.id === id ? { ...d } : d);
  };

  const formatDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    return isNaN(date) ? d : date.toLocaleDateString('ru-RU');
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Пользователи</h1>
          <p className="admin-page-sub">
            {loading ? 'Загрузка…' : `${users.length} покупателей · ${users.filter(u => !bannedIds.has(u.id)).length} активных`}
          </p>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card__header">
          <div className="admin-toolbar">
            <div className="admin-toolbar__search">
              <Search size={14} className="admin-toolbar__search-icon" />
              <input className="admin-toolbar__input"
                placeholder="Поиск по имени или email…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className="admin-toolbar__select" value={filter}
              onChange={e => { setFilter(e.target.value); setPage(1); }}>
              {['Все', 'Активен', 'Заблокирован'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <span style={{ fontSize:13, color:'var(--text-muted)' }}>{filtered.length} пользователей</span>
        </div>

        {/* Skeleton */}
        {loading && (
          <div className="admin-card__body" style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ display:'flex', gap:12, alignItems:'center' }}>
                <div className="skeleton" style={{ width:30, height:30, borderRadius:'50%' }} />
                <div className="skeleton" style={{ flex:1, height:14, borderRadius:4 }} />
                <div className="skeleton" style={{ width:80, height:14, borderRadius:4 }} />
              </div>
            ))}
          </div>
        )}

        {!loading && users.length === 0 && (
          <div style={{ padding:'48px 24px', textAlign:'center', color:'var(--text-muted)', fontSize:14 }}>
            Пользователей пока нет. Они появятся здесь после первых заказов.
          </div>
        )}

        {!loading && users.length > 0 && (
          <div className="admin-card__body--noPad admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Покупатель</th>
                  <th>Email</th>
                  <th>Телефон</th>
                  <th>Регистрация</th>
                  <th>Заказов</th>
                  <th>Потрачено</th>
                  <th>Последний заказ</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {paged.map(u => {
                  const st = getStatus(u);
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{
                            width:30, height:30, borderRadius:'50%', flexShrink:0,
                            background: st==='Заблокирован' ? 'rgba(255,61,85,.2)' : 'var(--purple)',
                            color:      st==='Заблокирован' ? 'var(--red)' : '#fff',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontSize:12, fontWeight:700,
                          }}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight:600, color:'var(--text-primary)', fontSize:13 }}>
                            {u.name}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontSize:12, color:'var(--text-secondary)' }}>{u.email}</td>
                      <td style={{ fontSize:12, color:'var(--text-muted)' }}>{u.phone}</td>
                      <td style={{ fontSize:12, color:'var(--text-muted)' }}>{formatDate(u.joined)}</td>
                      <td style={{ fontWeight:600, color:'var(--text-primary)' }}>{u.orders}</td>
                      <td style={{ color:'var(--green)', fontWeight:700 }}>${u.spent.toFixed(2)}</td>
                      <td style={{ fontSize:12, color:'var(--text-muted)' }}>{formatDate(u.lastOrder)}</td>
                      <td>
                        <span className={`status-badge status-badge--${st==='Активен' ? 'active' : 'cancelled'}`}>
                          {st}
                        </span>
                      </td>
                      <td>
                        <div className="admin-table__actions">
                          <button className="admin-btn-icon" title="Подробности"
                            onClick={() => setDetail(u)}>
                            <Eye size={13} />
                          </button>
                          <button
                            className={`admin-btn-icon ${st==='Заблокирован' ? 'admin-btn-icon--success' : 'admin-btn-icon--danger'}`}
                            title={st==='Заблокирован' ? 'Разблокировать' : 'Заблокировать'}
                            onClick={() => toggleBan(u.id)}>
                            <Ban size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && users.length > 0 && (
          <div className="admin-pagination">
            <span>
              Показано {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filtered.length)} из {filtered.length}
            </span>
            <div className="admin-pagination__btns">
              <button className="admin-pagination__btn"
                onClick={() => setPage(p => p-1)} disabled={page===1}>‹</button>
              {Array.from({ length:pages }, (_,i) => (
                <button key={i}
                  className={`admin-pagination__btn ${page===i+1 ? 'admin-pagination__btn--active' : ''}`}
                  onClick={() => setPage(i+1)}>
                  {i+1}
                </button>
              ))}
              <button className="admin-pagination__btn"
                onClick={() => setPage(p => p+1)} disabled={page===pages}>›</button>
            </div>
          </div>
        )}
      </div>

      {/* Модалка пользователя */}
      {detail && (
        <div className="admin-modal-overlay" onClick={e => e.target===e.currentTarget && setDetail(null)}>
          <div className="admin-modal">
            <div className="admin-modal__header">
              <span className="admin-modal__title">Профиль покупателя</span>
              <button className="admin-modal__close" onClick={() => setDetail(null)}>
                <X size={15} />
              </button>
            </div>
            <div className="admin-modal__body">
              <div style={{ textAlign:'center', marginBottom:24 }}>
                <div style={{
                  width:60, height:60, borderRadius:'50%',
                  background:'var(--purple)', color:'#fff',
                  fontSize:22, fontWeight:700,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  margin:'0 auto 12px',
                }}>
                  {detail.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ fontSize:17, fontWeight:700, color:'var(--text-primary)' }}>
                  {detail.name}
                </div>
                <div style={{ fontSize:13, color:'var(--text-muted)' }}>{detail.email}</div>
                <div style={{ marginTop:8 }}>
                  <span className={`status-badge status-badge--${getStatus(detail)==='Активен' ? 'active' : 'cancelled'}`}>
                    {getStatus(detail)}
                  </span>
                </div>
              </div>

              {[
                ['Телефон',           detail.phone],
                ['Дата регистрации',  formatDate(detail.joined)],
                ['Кол-во заказов',    detail.orders],
                ['Сумма покупок',     `$${detail.spent.toFixed(2)}`],
                ['Последний заказ',   formatDate(detail.lastOrder)],
              ].map(([k, v]) => (
                <div key={k} style={{
                  display:'flex', justifyContent:'space-between',
                  padding:'9px 0', borderBottom:'1px solid var(--border)', fontSize:13,
                }}>
                  <span style={{ color:'var(--text-muted)' }}>{k}</span>
                  <span style={{ color:'var(--text-primary)', fontWeight:600 }}>{v}</span>
                </div>
              ))}
            </div>
            <div className="admin-modal__footer">
              <button
                className={`btn ${getStatus(detail)==='Заблокирован' ? 'btn--secondary' : 'btn--danger'}`}
                onClick={() => toggleBan(detail.id)}>
                <Ban size={14} />
                {getStatus(detail)==='Заблокирован' ? 'Разблокировать' : 'Заблокировать'}
              </button>
              <button className="btn btn--primary" onClick={() => setDetail(null)}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
