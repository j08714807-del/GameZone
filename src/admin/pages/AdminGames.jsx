import { useState, useMemo } from 'react';
import {
  Search, Plus, Pencil, Trash2, X, Star,
  CheckCircle, RefreshCw, Upload, AlertCircle, Loader
} from 'lucide-react';
import useGames from '../../hooks/useGames';
import { gamesApi } from '../../api/api';
import { games as seedData } from '../../data/games';

const EMPTY_FORM = {
  title: '', price: '', oldPrice: '', discount: '', category: 'RPG',
  platform: 'PC', rating: '', image: '', description: '',
  isNew: false, isOnSale: false, developer: '', publisher: '',
  releaseDate: '', genre: '', slug: '',
  screenshots: [],
};

function toForm(g) {
  return {
    ...g,
    platform: Array.isArray(g.platform) ? g.platform.join(', ') : (g.platform ?? ''),
    price:    String(g.price ?? ''),
    oldPrice: String(g.oldPrice ?? ''),
    discount: String(g.discount ?? ''),
    rating:   String(g.rating ?? ''),
    screenshots: Array.isArray(g.screenshots) ? g.screenshots : [],
  };
}

function fromForm(form, existing) {
  return {
    ...(existing ?? {}),
    title:       form.title.trim(),
    slug:        form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    price:       parseFloat(form.price) || 0,
    oldPrice:    parseFloat(form.oldPrice) || 0,
    discount:    parseInt(form.discount) || 0,
    rating:      parseFloat(form.rating) || 0,
    category:    form.category,
    genre:       form.genre || form.category,
    developer:   form.developer,
    publisher:   form.publisher,
    releaseDate: form.releaseDate,
    image:       form.image,
    description: form.description,
    isNew:       Boolean(form.isNew),
    isOnSale:    Boolean(form.isOnSale),
    platform: typeof form.platform === 'string'
      ? form.platform.split(',').map(p => p.trim()).filter(Boolean)
      : form.platform,
    screenshots: Array.isArray(form.screenshots) ? form.screenshots.filter(Boolean) : [],
    reviews:     existing?.reviews ?? 0,
    isFeatured:  existing?.isFeatured ?? false,
  };
}

export default function AdminGames() {
  const { games, loading, error, refetch } = useGames();

  const [search,    setSearch]    = useState('');
  const [catFilter, setCatFilter] = useState('Все');
  const [modal,     setModal]     = useState(null);
  const [selected,  setSelected]  = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);
  const [saveOk,    setSaveOk]    = useState(false);
  const [apiError,  setApiError]  = useState('');
  const [seeding,   setSeeding]   = useState(false);
  const [seedDone,  setSeedDone]  = useState(false);
  const [screenshotInput, setScreenshotInput] = useState('');

  const addScreenshot = () => {
    const url = screenshotInput.trim();
    if (!url) return;
    setForm(f => ({ ...f, screenshots: [...(f.screenshots || []), url] }));
    setScreenshotInput('');
  };
  const removeScreenshot = (idx) =>
    setForm(f => ({ ...f, screenshots: f.screenshots.filter((_, i) => i !== idx) }));

  const cats = ['Все', ...Array.from(new Set(games.map(g => g.category).filter(Boolean)))];

  const filtered = useMemo(() => games.filter(g => {
    const matchS = (g.title ?? '').toLowerCase().includes(search.toLowerCase());
    const matchC = catFilter === 'Все' || g.category === catFilter;
    return matchS && matchC;
  }), [games, search, catFilter]);

  const openAdd  = () => { setForm(EMPTY_FORM); setApiError(''); setSaveOk(false); setModal('add'); };
  const openEdit = (g) => { setSelected(g); setForm(toForm(g)); setApiError(''); setSaveOk(false); setModal('edit'); };
  const openDel  = (g) => { setSelected(g); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); setSaveOk(false); setApiError(''); setScreenshotInput(''); };

  const set = (k) => (e) =>
    setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true); setApiError('');
    try {
      const payload = fromForm(form, selected);
      if (modal === 'add') await gamesApi.create(payload);
      else                  await gamesApi.update(selected.id, payload);
      setSaveOk(true);
      await refetch();
      setTimeout(closeModal, 900);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await gamesApi.remove(selected.id);
      await refetch();
      closeModal();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true); setSeedDone(false);
    try {
      await Promise.all(seedData.map(g => gamesApi.create(fromForm(toForm(g), g))));
      setSeedDone(true);
      await refetch();
      setTimeout(() => setSeedDone(false), 3000);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div>
      {/* Заголовок */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Игры</h1>
          <p className="admin-page-sub">
            {loading ? 'Загрузка…' : `${games.length} игр в API`}
          </p>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {!loading && games.length === 0 && (
            <button className="btn btn--secondary" onClick={handleSeed} disabled={seeding}
              title="Загрузить все игры из локальных данных в MockAPI">
              {seeding
                ? <><Loader size={14} className="spin-icon" /> Загрузка…</>
                : seedDone
                ? <><CheckCircle size={14} /> Готово!</>
                : <><Upload size={14} /> Заполнить API данными</>}
            </button>
          )}
          <button className="btn btn--ghost btn--sm" onClick={refetch} title="Обновить">
            <RefreshCw size={14} />
          </button>
          <button className="btn btn--primary" onClick={openAdd}>
            <Plus size={15} /> Добавить игру
          </button>
        </div>
      </div>

      {/* Ошибка */}
      {error && (
        <div className="admin-api-error" style={{ marginBottom:16 }}>
          <AlertCircle size={15} /> {error}
          <button onClick={refetch} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'var(--red)' }}>
            Повторить
          </button>
        </div>
      )}

      {/* Пустое состояние */}
      {!loading && !error && games.length === 0 && (
        <div className="admin-card" style={{ marginTop:8 }}>
          <div className="admin-card__body" style={{ textAlign:'center', padding:'60px 24px' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🎮</div>
            <h3 style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>API пуст</h3>
            <p style={{ fontSize:14, color:'var(--text-secondary)', marginBottom:24 }}>
              Нажмите <strong>«Заполнить API данными»</strong> чтобы загрузить {seedData.length} игр в MockAPI, или добавьте вручную.
            </p>
            <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
              <button className="btn btn--primary" onClick={handleSeed} disabled={seeding}>
                {seeding
                  ? <><Loader size={14} className="spin-icon" /> Загрузка {seedData.length} игр…</>
                  : <><Upload size={14} /> Загрузить {seedData.length} игр</>}
              </button>
              <button className="btn btn--secondary" onClick={openAdd}>
                <Plus size={14} /> Добавить вручную
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Скелетон */}
      {loading && (
        <div className="admin-card">
          <div className="admin-card__body" style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ display:'flex', gap:12, alignItems:'center' }}>
                <div className="skeleton" style={{ width:56, height:34, borderRadius:4, flexShrink:0 }} />
                <div className="skeleton" style={{ flex:1, height:16, borderRadius:4 }} />
                <div className="skeleton" style={{ width:80, height:16, borderRadius:4 }} />
                <div className="skeleton" style={{ width:60, height:16, borderRadius:4 }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Таблица */}
      {!loading && games.length > 0 && (
        <div className="admin-card">
          <div className="admin-card__header">
            <div className="admin-toolbar">
              <div className="admin-toolbar__search">
                <Search size={14} className="admin-toolbar__search-icon" />
                <input className="admin-toolbar__input" placeholder="Поиск игр…"
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select className="admin-toolbar__select" value={catFilter}
                onChange={e => setCatFilter(e.target.value)}>
                {cats.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <span style={{ fontSize:13, color:'var(--text-muted)' }}>{filtered.length} результатов</span>
          </div>

          <div className="admin-card__body--noPad admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Обложка</th><th>Название</th><th>Категория</th>
                  <th>Цена</th><th>Скидка</th><th>Рейтинг</th><th>Статус</th><th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(g => (
                  <tr key={g.id}>
                    <td>
                      {g.image
                        ? <img src={g.image} alt={g.title} className="admin-table__img" loading="lazy" />
                        : <div className="admin-table__img" style={{ background:'var(--bg-secondary)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🎮</div>
                      }
                    </td>
                    <td className="admin-table__name" title={g.title}>{g.title}</td>
                    <td><span className="status-badge status-badge--inactive">{g.category || '—'}</span></td>
                    <td style={{ color:'var(--purple-light)', fontWeight:700 }}>${g.price}</td>
                    <td>
                      {parseInt(g.discount) > 0
                        ? <span className="status-badge status-badge--sale">-{g.discount}%</span>
                        : <span style={{ color:'var(--text-muted)' }}>—</span>
                      }
                    </td>
                    <td>
                      <span style={{ display:'flex', alignItems:'center', gap:4, color:'var(--yellow)', fontWeight:600, fontSize:13 }}>
                        <Star size={12} fill="currentColor" />{g.rating}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-badge--${g.isNew ? 'sale' : 'active'}`}>
                        {g.isNew ? 'Новинка' : 'В каталоге'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        <button className="admin-btn-icon" onClick={() => openEdit(g)} title="Редактировать">
                          <Pencil size={13} />
                        </button>
                        <button className="admin-btn-icon admin-btn-icon--danger" onClick={() => openDel(g)} title="Удалить">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-pagination">
            <span>{filtered.length} игр в API</span>
          </div>
        </div>
      )}

      {/* Модалка добавления / редактирования */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="admin-modal admin-modal--lg">
            <div className="admin-modal__header">
              <span className="admin-modal__title">
                {modal === 'add' ? '+ Добавить игру' : `Редактировать — ${selected?.title}`}
              </span>
              <button className="admin-modal__close" onClick={closeModal}><X size={15} /></button>
            </div>
            <div className="admin-modal__body">
              {apiError && (
                <div className="admin-api-error" style={{ marginBottom:16 }}>
                  <AlertCircle size={14} /> {apiError}
                </div>
              )}
              <div className="admin-form-grid">
                <div className="admin-form-group admin-form-grid--full">
                  <label className="admin-form-label">Название *</label>
                  <input className="admin-form-input" placeholder="Название игры"
                    value={form.title} onChange={set('title')} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Цена ($)</label>
                  <input className="admin-form-input" type="number" placeholder="29.99"
                    value={form.price} onChange={set('price')} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Старая цена ($)</label>
                  <input className="admin-form-input" type="number" placeholder="59.99"
                    value={form.oldPrice} onChange={set('oldPrice')} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Скидка (%)</label>
                  <input className="admin-form-input" type="number" placeholder="40"
                    value={form.discount} onChange={set('discount')} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Рейтинг (0–5)</label>
                  <input className="admin-form-input" type="number" step="0.1" placeholder="4.5"
                    value={form.rating} onChange={set('rating')} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Категория</label>
                  <select className="admin-form-select" value={form.category} onChange={set('category')}>
                    {['RPG','Action','Shooter','Strategy','Racing','Sports','Horror','Indie'].map(c =>
                      <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Платформы (через запятую)</label>
                  <input className="admin-form-input" placeholder="PC, PlayStation, Xbox"
                    value={form.platform} onChange={set('platform')} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Разработчик</label>
                  <input className="admin-form-input" placeholder="Название студии"
                    value={form.developer} onChange={set('developer')} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Издатель</label>
                  <input className="admin-form-input" placeholder="Название издателя"
                    value={form.publisher} onChange={set('publisher')} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Дата выхода</label>
                  <input className="admin-form-input" type="date"
                    value={form.releaseDate} onChange={set('releaseDate')} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Жанр</label>
                  <input className="admin-form-input" placeholder="RPG, Action"
                    value={form.genre} onChange={set('genre')} />
                </div>
                <div className="admin-form-group admin-form-grid--full">
                  <label className="admin-form-label">URL обложки</label>
                  <input className="admin-form-input" placeholder="https://…"
                    value={form.image} onChange={set('image')} />
                  {form.image && (
                    <img src={form.image} alt="предпросмотр"
                      style={{ marginTop:8, height:60, objectFit:'cover', borderRadius:4, border:'1px solid var(--border)' }} />
                  )}
                </div>
                <div className="admin-form-group admin-form-grid--full">
                  <label className="admin-form-label">Описание</label>
                  <textarea className="admin-form-textarea" placeholder="Описание игры…"
                    value={form.description} onChange={set('description')} />
                </div>
                <div className="admin-form-group admin-form-grid--full">
                  <label className="admin-form-label">Скриншоттор</label>
                  <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                    <input
                      className="admin-form-input"
                      placeholder="https://… (скриншоттун URL'у)"
                      value={screenshotInput}
                      onChange={e => setScreenshotInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addScreenshot())}
                    />
                    <button
                      type="button"
                      className="btn btn--secondary"
                      onClick={addScreenshot}
                      style={{ whiteSpace:'nowrap', flexShrink:0 }}
                    >
                      <Plus size={14} /> Кошуу
                    </button>
                  </div>
                  {form.screenshots?.length > 0 && (
                    <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                      {form.screenshots.map((url, idx) => (
                        <div key={idx} style={{ position:'relative', width:120 }}>
                          <img
                            src={url}
                            alt={`screenshot-${idx + 1}`}
                            style={{ width:120, height:70, objectFit:'cover', borderRadius:6, border:'1px solid var(--border)', display:'block' }}
                          />
                          <button
                            type="button"
                            onClick={() => removeScreenshot(idx)}
                            style={{
                              position:'absolute', top:3, right:3,
                              background:'rgba(0,0,0,0.65)', border:'none', borderRadius:'50%',
                              width:20, height:20, display:'flex', alignItems:'center', justifyContent:'center',
                              cursor:'pointer', color:'#fff', padding:0,
                            }}
                            title="Өчүрүү"
                          >
                            <X size={11} />
                          </button>
                          <span style={{ fontSize:10, color:'var(--text-muted)', display:'block', marginTop:2, textAlign:'center' }}>
                            #{idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="admin-form-group">
                  <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, color:'var(--text-secondary)' }}>
                    <input type="checkbox" checked={!!form.isNew} onChange={set('isNew')}
                      style={{ accentColor:'var(--purple)' }} />
                    Отметить как новинку
                  </label>
                </div>
                <div className="admin-form-group">
                  <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, color:'var(--text-secondary)' }}>
                    <input type="checkbox" checked={!!form.isOnSale} onChange={set('isOnSale')}
                      style={{ accentColor:'var(--purple)' }} />
                    Участвует в распродаже
                  </label>
                </div>
              </div>
            </div>
            <div className="admin-modal__footer">
              <button className="btn btn--ghost" onClick={closeModal} disabled={saving}>Отмена</button>
              <button className="btn btn--primary" onClick={handleSave}
                disabled={saving || !form.title.trim()}>
                {saving
                  ? <><Loader size={14} className="spin-icon" /> Сохранение…</>
                  : saveOk
                  ? <><CheckCircle size={14} /> Сохранено!</>
                  : modal === 'add' ? '+ Добавить игру' : 'Сохранить изменения'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Подтверждение удаления */}
      {modal === 'delete' && (
        <div className="admin-modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="admin-modal admin-confirm-modal">
            <div className="admin-modal__header">
              <span className="admin-modal__title">Удалить игру</span>
              <button className="admin-modal__close" onClick={closeModal}><X size={15} /></button>
            </div>
            <div className="admin-modal__body">
              <div className="admin-confirm-icon"><Trash2 size={26} /></div>
              <div className="admin-confirm-title">Удалить «{selected?.title}»?</div>
              <p className="admin-confirm-sub">Это действие необратимо. Игра будет удалена из API.</p>
              {apiError && <p style={{ color:'var(--red)', fontSize:13, marginTop:12 }}>{apiError}</p>}
            </div>
            <div className="admin-modal__footer">
              <button className="btn btn--ghost" onClick={closeModal} disabled={saving}>Отмена</button>
              <button className="btn btn--danger" onClick={handleDelete} disabled={saving}>
                {saving ? 'Удаление…' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
