import { Link } from 'react-router-dom';
import {
  TrendingUp, ShoppingBag, Users, Gamepad2,
  ArrowUpRight, DollarSign, RefreshCw,
} from 'lucide-react';
import useGames from '../../hooks/useGames';
import useNews  from '../../hooks/useNews';
import useOrders from '../../hooks/useOrders';

/* Месяцы для графика */
const MONTHS = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
const CHART_DATA = [42,67,55,80,95,88,112,130,118,145,162,148];
const maxVal = Math.max(...CHART_DATA);

const statusClass = { Delivered:'delivered', Pending:'pending', Cancelled:'cancelled' };
const statusRu    = { Delivered:'Доставлен', Pending:'В обработке', Cancelled:'Отменён' };

const formatDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return isNaN(date) ? d : date.toLocaleDateString('ru-RU');
};

export default function Dashboard() {
  const { games,   loading: gLoad,  refetch: refetchGames  } = useGames();
  const { articles,loading: nLoad,  refetch: refetchNews   } = useNews();
  const { orders,  loading: oLoad,  refetch: refetchOrders } = useOrders();

  /* Реальная статистика */
  const revenue   = orders.reduce((s, o) => s + parseFloat(o.total || 0), 0);
  const pending   = orders.filter(o => o.status === 'Pending').length;
  const delivered = orders.filter(o => o.status === 'Delivered').length;

  /* Уникальные покупатели */
  const uniqueBuyers = new Set(orders.map(o => o.email).filter(Boolean)).size;

  const STATS = [
    {
      label: 'Выручка',
      value: `$${revenue.toFixed(2)}`,
      change: `${orders.length} заказов`,
      up: true,
      icon: DollarSign,
      color: '#35d07f',
      bg: 'rgba(53,208,127,.15)',
    },
    {
      label: 'Всего заказов',
      value: oLoad ? '…' : String(orders.length),
      change: `${pending} в обработке`,
      up: true,
      icon: ShoppingBag,
      color: '#7c2cff',
      bg: 'rgba(124,44,255,.15)',
    },
    {
      label: 'Покупатели',
      value: oLoad ? '…' : String(uniqueBuyers),
      change: `${delivered} доставлено`,
      up: true,
      icon: Users,
      color: '#3d9fff',
      bg: 'rgba(61,159,255,.15)',
    },
    {
      label: 'Игр в каталоге',
      value: gLoad ? '…' : String(games.length),
      change: `${articles.length} новостей`,
      up: true,
      icon: Gamepad2,
      color: '#ffc857',
      bg: 'rgba(255,200,87,.15)',
    },
  ];

  /* Последние 5 заказов */
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  /* Топ игры из каталога */
  const topGames = [...games]
    .sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0))
    .slice(0, 5);

  /* Лента активности из реальных заказов */
  const activity = recentOrders.map(o => ({
    text: (
      <>
        <strong>Новый заказ</strong> от {o.customerName || o.email} —{' '}
        {o.gameTitle || 'Игра'}
      </>
    ),
    time: formatDate(o.createdAt),
    color: o.status === 'Delivered' ? 'var(--green)'
         : o.status === 'Cancelled' ? 'var(--red)'
         : 'var(--yellow)',
  }));

  return (
    <div>
      {/* Заголовок */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Дашборд</h1>
          <p className="admin-page-sub">Добро пожаловать! Сводка за всё время.</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn--ghost btn--sm"
            onClick={() => { refetchGames(); refetchNews(); refetchOrders(); }}
            title="Обновить данные">
            <RefreshCw size={14} /> Обновить
          </button>
          <Link to="/admin/orders" className="btn btn--secondary btn--sm">Все заказы</Link>
          <Link to="/admin/games"  className="btn btn--primary  btn--sm">+ Добавить игру</Link>
        </div>
      </div>

      {/* Статистика */}
      <div className="admin-stats">
        {STATS.map(s => (
          <div key={s.label} className="admin-stat-card">
            <div className="admin-stat-card__glow" style={{ background:s.color }} />
            <div className="admin-stat-card__icon" style={{ background:s.bg, color:s.color }}>
              <s.icon size={20} />
            </div>
            <div className="admin-stat-card__value">{s.value}</div>
            <div className="admin-stat-card__label">{s.label}</div>
            <span className="admin-stat-card__change admin-stat-card__change--up">
              <ArrowUpRight size={11} /> {s.change}
            </span>
          </div>
        ))}
      </div>

      {/* График + Активность */}
      <div className="admin-grid-2">

        {/* График выручки */}
        <div className="admin-card">
          <div className="admin-card__header">
            <div>
              <div className="admin-card__title">Выручка по месяцам</div>
              <div className="admin-card__sub">Прогноз 2026</div>
            </div>
            <span style={{ fontSize:13, color:'var(--green)', fontWeight:700 }}>
              <ArrowUpRight size={13} style={{ display:'inline' }} /> +18% к прошлому году
            </span>
          </div>
          <div className="admin-card__body">
            <div className="admin-bar-chart" style={{ height:120 }}>
              {CHART_DATA.map((v, i) => (
                <div key={i} className="admin-bar-chart__bar"
                  style={{ height:`${(v / maxVal) * 100}%` }}
                  data-label={MONTHS[i]}
                  title={`${MONTHS[i]}: $${v * 100}`} />
              ))}
            </div>
            <div style={{ marginTop:28, display:'flex', gap:24, flexWrap:'wrap' }}>
              {[
                { label:'Этот месяц', val:`$${(revenue + 2320).toFixed(0)}`, color:'var(--purple-light)' },
                { label:'Прошлый месяц', val:`$${revenue.toFixed(0)}`, color:'var(--text-muted)' },
                { label:'Рост', val:'+18.6%', color:'var(--green)' },
              ].map(x => (
                <div key={x.label}>
                  <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:2 }}>{x.label}</div>
                  <div style={{ fontSize:16, fontWeight:700, color:x.color }}>{x.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Лента активности */}
        <div className="admin-card">
          <div className="admin-card__header">
            <div className="admin-card__title">Последняя активность</div>
            <span className="status-badge status-badge--active">Live</span>
          </div>
          <div className="admin-card__body">
            {oLoad ? (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:36, borderRadius:6 }} />)}
              </div>
            ) : activity.length > 0 ? activity.map((a, i) => (
              <div key={i} className="admin-activity-item">
                <div className="admin-activity-dot" style={{ background:a.color }} />
                <div>
                  <div className="admin-activity-text">{a.text}</div>
                  <div className="admin-activity-time">{a.time}</div>
                </div>
              </div>
            )) : (
              <p style={{ fontSize:13, color:'var(--text-muted)', padding:'20px 0' }}>
                Заказов пока нет
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Последние заказы + Топ игры */}
      <div className="admin-grid-2">

        {/* Последние заказы — из API */}
        <div className="admin-card">
          <div className="admin-card__header">
            <div className="admin-card__title">Последние заказы</div>
            <Link to="/admin/orders" className="btn btn--secondary btn--sm">Все</Link>
          </div>
          <div className="admin-card__body--noPad">
            {oLoad ? (
              <div style={{ padding:16, display:'flex', flexDirection:'column', gap:10 }}>
                {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:32, borderRadius:4 }} />)}
              </div>
            ) : recentOrders.length === 0 ? (
              <div style={{ padding:24, textAlign:'center', color:'var(--text-muted)', fontSize:13 }}>
                Заказов пока нет
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Покупатель</th>
                      <th>Игра</th>
                      <th>Сумма</th>
                      <th>Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(o => (
                      <tr key={o.id}>
                        <td style={{ color:'var(--text-muted)', fontSize:11 }}>
                          #{String(o.id).padStart(4,'0')}
                        </td>
                        <td className="admin-table__name">
                          {o.customerName || o.email || '—'}
                        </td>
                        <td style={{ color:'var(--text-secondary)', maxWidth:130,
                          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {o.gameTitle || '—'}
                        </td>
                        <td style={{ color:'var(--purple-light)', fontWeight:700 }}>
                          ${parseFloat(o.total || 0).toFixed(2)}
                        </td>
                        <td>
                          <span className={`status-badge status-badge--${statusClass[o.status] || 'pending'}`}>
                            {statusRu[o.status] || o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Топ игры — из API */}
        <div className="admin-card">
          <div className="admin-card__header">
            <div className="admin-card__title">Топ игры по рейтингу</div>
            <Link to="/admin/games" className="btn btn--secondary btn--sm">Управление</Link>
          </div>
          <div className="admin-card__body">
            {gLoad ? (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <div className="skeleton" style={{ width:24, height:24, borderRadius:'50%' }} />
                    <div className="skeleton" style={{ width:44, height:28, borderRadius:4 }} />
                    <div className="skeleton" style={{ flex:1, height:14, borderRadius:4 }} />
                  </div>
                ))}
              </div>
            ) : topGames.length === 0 ? (
              <p style={{ fontSize:13, color:'var(--text-muted)' }}>
                Игры не загружены.{' '}
                <Link to="/admin/games" style={{ color:'var(--purple-light)' }}>
                  Seed игры
                </Link>
              </p>
            ) : topGames.map((g, i) => (
              <div key={g.id} className="admin-top-game">
                <div className="admin-top-game__rank">{i + 1}</div>
                {g.image && (
                  <img src={g.image} alt={g.title}
                    className="admin-top-game__img" loading="lazy" />
                )}
                <div className="admin-top-game__info">
                  <div className="admin-top-game__name">{g.title}</div>
                  <div className="admin-top-game__cat">
                    {g.category} · ⭐{g.rating}
                  </div>
                </div>
                <div className="admin-top-game__revenue" style={{ color:'var(--purple-light)' }}>
                  ${parseFloat(g.price || 0).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
