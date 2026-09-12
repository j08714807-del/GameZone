import { useState, useMemo } from 'react';
import { Search, Eye, X, RefreshCw, AlertCircle, Loader } from 'lucide-react';
import useOrders from '../../hooks/useOrders';
import { ordersApi } from '../../api/api';

const STATUS_OPTIONS = ['Все', 'Pending', 'Delivered', 'Cancelled'];
const statusClass    = { Delivered:'delivered', Pending:'pending', Cancelled:'cancelled' };
const statusRu       = { Delivered:'Доставлен', Pending:'В обработке', Cancelled:'Отменён' };

const PAGE_SIZE = 10;

export default function AdminOrders() {
  const { orders, loading, error, refetch } = useOrders();

  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('Все');
  const [page,    setPage]    = useState(1);
  const [detail,  setDetail]  = useState(null);
  const [updating, setUpdating] = useState(null); // id заказа который сейчас обновляется

  /* Фильтрация */
  const filtered = useMemo(() => orders.filter(o => {
    const q   = search.toLowerCase();
    const matchS =
      (o.id          || '').toString().includes(q) ||
      (o.customerName|| '').toLowerCase().includes(q) ||
      (o.email       || '').toLowerCase().includes(q) ||
      (o.gameTitle   || '').toLowerCase().includes(q);
    const matchF = filter === 'Все' || o.status === filter;
    return matchS && matchF;
  }), [orders, search, filter]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* Изменить статус через API */
  const changeStatus = async (id, newStatus) => {
    setUpdating(id);
    try {
      await ordersApi.update(id, { status: newStatus });
      await refetch();
      if (detail?.id === id) setDetail(d => ({ ...d, status: newStatus }));
    } catch (err) {
      alert('Ошибка: ' + err.message);
    } finally {
      setUpdating(null);
    }
  };

  /* Helpers */
  const getField = (o, ...keys) => {
    for (const k of keys) if (o[k] !== undefined && o[k] !== null && o[k] !== '') return o[k];
    return '—';
  };
  const formatDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    return isNaN(date) ? d : date.toLocaleDateString('ru-RU');
  };

  return (
    <div>
      {/* Заголовок */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Заказы</h1>
          <p className="admin-page-sub">
            {loading ? 'Загрузка…' : `${orders.length} заказов в базе`}
          </p>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
          {/* Статистика */}
          {!loading && ['Pending','Delivered','Cancelled'].map(s => (
            <span key={s} style={{ fontSize:13, color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:4 }}>
              <span className={`status-badge status-badge--${statusClass[s]}`}>{statusRu[s]}</span>
              {orders.filter(o => o.status === s).length}
            </span>
          ))}
          <button className="btn btn--ghost btn--sm" onClick={refetch} title="Обновить">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Ошибка */}
      {error && (
        <div className="admin-api-error" style={{ marginBottom:16 }}>
          <AlertCircle size={14} /> {error}
          <button onClick={refetch} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'var(--red)' }}>
            Повторить
          </button>
        </div>
      )}

      {/* Пусто */}
      {!loading && !error && orders.length === 0 && (
        <div className="admin-card">
          <div className="admin-card__body" style={{ textAlign:'center', padding:'60px 24px' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>📦</div>
            <h3 style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>Заказов пока нет</h3>
            <p style={{ fontSize:14, color:'var(--text-secondary)' }}>
              Заказы появятся здесь, когда покупатели оформят их через сайт.
            </p>
          </div>
        </div>
      )}

      {/* Скелетон */}
      {loading && (
        <div className="admin-card">
          <div className="admin-card__body" style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ display:'flex', gap:12, alignItems:'center' }}>
                <div className="skeleton" style={{ width:70, height:14, borderRadius:4 }} />
                <div className="skeleton" style={{ flex:1, height:14, borderRadius:4 }} />
                <div className="skeleton" style={{ width:100, height:14, borderRadius:4 }} />
                <div className="skeleton" style={{ width:60, height:24, borderRadius:12 }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Таблица */}
      {!loading && orders.length > 0 && (
        <div className="admin-card">
          <div className="admin-card__header">
            <div className="admin-toolbar">
              <div className="admin-toolbar__search">
                <Search size={14} className="admin-toolbar__search-icon" />
                <input className="admin-toolbar__input"
                  placeholder="Поиск по ID, покупателю, игре, email…"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }} />
              </div>
              <select className="admin-toolbar__select" value={filter}
                onChange={e => { setFilter(e.target.value); setPage(1); }}>
                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <span style={{ fontSize:13, color:'var(--text-muted)' }}>{filtered.length} заказов</span>
          </div>

          <div className="admin-card__body--noPad admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Покупатель</th>
                  <th>Игра</th>
                  <th>Сумма</th>
                  <th>Дата</th>
                  <th>Оплата</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {paged.map(o => (
                  <tr key={o.id}>
                    <td style={{ color:'var(--purple-light)', fontWeight:700, fontSize:11 }}>
                      #{String(o.id).padStart(4,'0')}
                    </td>
                    <td>
                      <div style={{ fontWeight:600, color:'var(--text-primary)', fontSize:13 }}>
                        {getField(o, 'customerName', 'fullName', 'name')}
                      </div>
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>
                        {getField(o, 'email')}
                      </div>
                    </td>
                    <td style={{ color:'var(--text-secondary)', maxWidth:140,
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {getField(o, 'gameTitle', 'game', 'title')}
                      {o.quantity > 1 && <span style={{ color:'var(--text-muted)', fontSize:11 }}> ×{o.quantity}</span>}
                    </td>
                    <td style={{ color:'var(--purple-light)', fontWeight:700 }}>
                      ${parseFloat(o.total || o.price || 0).toFixed(2)}
                    </td>
                    <td style={{ fontSize:12, color:'var(--text-muted)' }}>
                      {formatDate(o.createdAt || o.date)}
                    </td>
                    <td style={{ fontSize:12, color:'var(--text-secondary)' }}>
                      {getField(o, 'payment', 'paymentMethod')}
                    </td>
                    <td>
                      {updating === o.id ? (
                        <Loader size={14} className="spin-icon" style={{ color:'var(--purple-light)' }} />
                      ) : (
                        <select
                          className="admin-toolbar__select"
                          style={{ padding:'4px 8px', fontSize:12 }}
                          value={o.status || 'Pending'}
                          onChange={e => changeStatus(o.id, e.target.value)}
                        >
                          {['Pending','Delivered','Cancelled'].map(s => (
                            <option key={s} value={s}>{statusRu[s]}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        <button className="admin-btn-icon" title="Подробности"
                          onClick={() => setDetail(o)}>
                          <Eye size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Пагинация */}
          <div className="admin-pagination">
            <span>
              {filtered.length > 0
                ? `Показано ${(page-1)*PAGE_SIZE+1}–${Math.min(page*PAGE_SIZE, filtered.length)} из ${filtered.length}`
                : '0 результатов'}
            </span>
            <div className="admin-pagination__btns">
              <button className="admin-pagination__btn"
                onClick={() => setPage(p => p-1)} disabled={page === 1}>‹</button>
              {Array.from({ length: pages }, (_, i) => (
                <button key={i}
                  className={`admin-pagination__btn ${page===i+1 ? 'admin-pagination__btn--active' : ''}`}
                  onClick={() => setPage(i+1)}>
                  {i+1}
                </button>
              ))}
              <button className="admin-pagination__btn"
                onClick={() => setPage(p => p+1)} disabled={page === pages}>›</button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка деталей */}
      {detail && (
        <div className="admin-modal-overlay" onClick={e => e.target===e.currentTarget && setDetail(null)}>
          <div className="admin-modal">
            <div className="admin-modal__header">
              <span className="admin-modal__title">
                Заказ #{String(detail.id).padStart(4,'0')}
              </span>
              <button className="admin-modal__close" onClick={() => setDetail(null)}>
                <X size={15} />
              </button>
            </div>
            <div className="admin-modal__body">

              {/* Игра */}
              {detail.gameImage && (
                <div style={{ display:'flex', gap:14, marginBottom:20,
                  background:'var(--bg-secondary)', borderRadius:'var(--radius)', padding:12 }}>
                  <img src={detail.gameImage} alt={detail.gameTitle}
                    style={{ width:90, height:54, objectFit:'cover', borderRadius:'var(--radius-sm)', flexShrink:0 }} />
                  <div>
                    <div style={{ fontWeight:700, fontSize:15, color:'var(--text-primary)', marginBottom:6 }}>
                      {getField(detail, 'gameTitle', 'game')}
                    </div>
                    <span className={`status-badge status-badge--${statusClass[detail.status] || 'pending'}`}>
                      {statusRu[detail.status] || detail.status}
                    </span>
                  </div>
                </div>
              )}

              {/* Поля */}
              {[
                ['ID заказа',      `#${String(detail.id).padStart(4,'0')}`],
                ['Покупатель',     getField(detail, 'customerName', 'fullName')],
                ['Email',          getField(detail, 'email')],
                ['Телефон',        getField(detail, 'phone')],
                ['Адрес',          getField(detail, 'address')],
                ['Дата',           formatDate(detail.createdAt || detail.date)],
                ['Кол-во',         detail.quantity || 1],
                ['Цена за ед.',    `$${parseFloat(detail.price || 0).toFixed(2)}`],
                ['Итого',          `$${parseFloat(detail.total || 0).toFixed(2)}`],
                ['Способ оплаты',  getField(detail, 'payment', 'paymentMethod')],
              ].filter(([,v]) => v && v !== '—').map(([k, v]) => (
                <div key={k} style={{
                  display:'flex', justifyContent:'space-between',
                  padding:'8px 0', borderBottom:'1px solid var(--border)', fontSize:13 }}>
                  <span style={{ color:'var(--text-muted)' }}>{k}</span>
                  <span style={{ color:'var(--text-primary)', fontWeight:500, textAlign:'right', maxWidth:'60%', wordBreak:'break-word' }}>
                    {v}
                  </span>
                </div>
              ))}

              {/* Изменить статус */}
              <div style={{ marginTop:20 }}>
                <label className="admin-form-label" style={{ display:'block', marginBottom:6 }}>
                  Изменить статус
                </label>
                <select className="admin-form-select"
                  value={detail.status || 'Pending'}
                  onChange={e => changeStatus(detail.id, e.target.value)}>
                  {['Pending','Delivered','Cancelled'].map(s => (
                    <option key={s} value={s}>{statusRu[s]}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="admin-modal__footer">
              <button className="btn btn--primary" onClick={() => setDetail(null)}>Закрыть</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
