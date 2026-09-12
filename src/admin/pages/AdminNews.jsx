import { useState, useMemo } from 'react';
import {
  Search, Plus, Pencil, Trash2, X, CheckCircle,
  Loader, AlertCircle, RefreshCw, Upload
} from 'lucide-react';
import useNews from '../../hooks/useNews';
import { newsApi } from '../../api/api';
import { news as seedData } from '../../data/news';

const EMPTY = {
  title:'', category:'Update', author:'', date:'',
  image:'', excerpt:'', content:'', isNew: false,
};
const CATS = ['Update','DLC','Sale','Announcement','Awards','Review'];

export default function AdminNews() {
  const { articles, loading, error, refetch } = useNews();

  const [search,   setSearch]   = useState('');
  const [modal,    setModal]    = useState(null);
  const [selected, setSelected] = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);
  const [saveOk,   setSaveOk]   = useState(false);
  const [apiError, setApiError] = useState('');
  const [seeding,  setSeeding]  = useState(false);
  const [seedDone, setSeedDone] = useState(false);

  const filtered = useMemo(() =>
    articles.filter(a =>
      (a.title||'').toLowerCase().includes(search.toLowerCase()) ||
      (a.author||'').toLowerCase().includes(search.toLowerCase())
    ), [articles, search]);

  const openAdd  = () => { setForm({ ...EMPTY, date: new Date().toISOString().split('T')[0] }); setApiError(''); setSaveOk(false); setModal('add'); };
  const openEdit = (a) => { setSelected(a); setForm({ ...EMPTY, ...a }); setApiError(''); setSaveOk(false); setModal('edit'); };
  const openDel  = (a) => { setSelected(a); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); setSaveOk(false); setApiError(''); };
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.type==='checkbox' ? e.target.checked : e.target.value }));

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true); setApiError('');
    const payload = {
      ...form,
      slug: form.title.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,''),
      tags: selected?.tags ?? [form.category],
    };
    try {
      if (modal === 'add') await newsApi.create(payload);
      else                  await newsApi.update(selected.id, payload);
      setSaveOk(true);
      await refetch();
      setTimeout(closeModal, 800);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await newsApi.remove(selected.id);
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
      await Promise.all(seedData.map(a => newsApi.create({
        title:    a.title,
        slug:     a.slug,
        category: a.category,
        author:   a.author,
        date:     a.date,
        image:    a.image,
        excerpt:  a.excerpt,
        content:  a.content,
        isNew:    a.isNew ?? false,
        tags:     a.tags ?? [],
      })));
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
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">News</h1>
          <p className="admin-page-sub">{loading ? 'Loading…' : `${articles.length} articles in API`}</p>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {!loading && articles.length === 0 && (
            <button className="btn btn--secondary" onClick={handleSeed} disabled={seeding}>
              {seeding ? <><Loader size={14} className="spin-icon" /> Seeding…</>
               : seedDone ? <><CheckCircle size={14} /> Done!</>
               : <><Upload size={14} /> Seed News</>}
            </button>
          )}
          <button className="btn btn--ghost btn--sm" onClick={refetch}><RefreshCw size={14} /></button>
          <button className="btn btn--primary" onClick={openAdd}><Plus size={15} /> New Article</button>
        </div>
      </div>

      {(error || apiError) && (
        <div className="admin-api-error" style={{ marginBottom:16 }}>
          <AlertCircle size={14} /> {error || apiError}
          <button onClick={refetch} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'var(--red)' }}>Retry</button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && articles.length === 0 && (
        <div className="admin-card">
          <div className="admin-card__body" style={{ textAlign:'center', padding:'60px 24px' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>📰</div>
            <h3 style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>API is empty</h3>
            <p style={{ fontSize:14, color:'var(--text-secondary)', marginBottom:24 }}>
              Click <strong>Seed News</strong> to push {seedData.length} articles from local data to MockAPI.
            </p>
            <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
              <button className="btn btn--primary" onClick={handleSeed} disabled={seeding}>
                {seeding ? <><Loader size={14} className="spin-icon" /> Seeding…</> : <><Upload size={14} /> Seed {seedData.length} Articles</>}
              </button>
              <button className="btn btn--secondary" onClick={openAdd}><Plus size={14} /> Add Manually</button>
            </div>
          </div>
        </div>
      )}

      {/* Skeleton */}
      {loading && (
        <div className="admin-card">
          <div className="admin-card__body" style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ display:'flex', gap:12, alignItems:'center' }}>
                <div className="skeleton" style={{ width:56, height:34, borderRadius:4, flexShrink:0 }} />
                <div className="skeleton" style={{ flex:1, height:16, borderRadius:4 }} />
                <div className="skeleton" style={{ width:100, height:16, borderRadius:4 }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && articles.length > 0 && (
        <div className="admin-card">
          <div className="admin-card__header">
            <div className="admin-toolbar">
              <div className="admin-toolbar__search">
                <Search size={14} className="admin-toolbar__search-icon" />
                <input className="admin-toolbar__input" placeholder="Search articles…"
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <span style={{ fontSize:13, color:'var(--text-muted)' }}>{filtered.length} articles</span>
          </div>

          <div className="admin-card__body--noPad admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Cover</th><th>Title</th><th>Category</th><th>Author</th><th>Date</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td>
                      {a.image
                        ? <img src={a.image} alt={a.title} className="admin-table__img" loading="lazy" />
                        : <div className="admin-table__img" style={{ background:'var(--bg-secondary)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>📰</div>
                      }
                    </td>
                    <td className="admin-table__name" title={a.title}>{a.title}</td>
                    <td><span className="status-badge status-badge--inactive">{a.category||'—'}</span></td>
                    <td style={{ fontSize:12, color:'var(--text-secondary)' }}>{a.author||'—'}</td>
                    <td style={{ fontSize:12, color:'var(--text-muted)' }}>{a.date||'—'}</td>
                    <td>
                      <span className={`status-badge status-badge--${a.isNew?'sale':'active'}`}>
                        {a.isNew?'New':'Published'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        <button className="admin-btn-icon" onClick={() => openEdit(a)}><Pencil size={13} /></button>
                        <button className="admin-btn-icon admin-btn-icon--danger" onClick={() => openDel(a)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit modal */}
      {(modal==='add'||modal==='edit') && (
        <div className="admin-modal-overlay" onClick={e=>e.target===e.currentTarget&&closeModal()}>
          <div className="admin-modal admin-modal--lg">
            <div className="admin-modal__header">
              <span className="admin-modal__title">{modal==='add'?'+ New Article':`Edit — ${selected?.title?.slice(0,40)}`}</span>
              <button className="admin-modal__close" onClick={closeModal}><X size={15}/></button>
            </div>
            <div className="admin-modal__body">
              {apiError && <div className="admin-api-error" style={{ marginBottom:16 }}><AlertCircle size={14}/> {apiError}</div>}
              <div className="admin-form-grid">
                <div className="admin-form-group admin-form-grid--full">
                  <label className="admin-form-label">Title *</label>
                  <input className="admin-form-input" placeholder="Article title…" value={form.title} onChange={set('title')}/>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Category</label>
                  <select className="admin-form-select" value={form.category} onChange={set('category')}>
                    {CATS.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Author</label>
                  <input className="admin-form-input" placeholder="Author name" value={form.author} onChange={set('author')}/>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Date</label>
                  <input className="admin-form-input" type="date" value={form.date} onChange={set('date')}/>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Cover Image URL</label>
                  <input className="admin-form-input" placeholder="https://…" value={form.image} onChange={set('image')}/>
                </div>
                <div className="admin-form-group admin-form-grid--full">
                  <label className="admin-form-label">Excerpt</label>
                  <textarea className="admin-form-textarea" style={{ minHeight:70 }} placeholder="Brief summary…" value={form.excerpt} onChange={set('excerpt')}/>
                </div>
                <div className="admin-form-group admin-form-grid--full">
                  <label className="admin-form-label">Full Content</label>
                  <textarea className="admin-form-textarea" style={{ minHeight:140 }} placeholder="Full article…" value={form.content} onChange={set('content')}/>
                </div>
                <div className="admin-form-group">
                  <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, color:'var(--text-secondary)' }}>
                    <input type="checkbox" checked={!!form.isNew} onChange={set('isNew')} style={{ accentColor:'var(--purple)' }}/>
                    Mark as New
                  </label>
                </div>
              </div>
            </div>
            <div className="admin-modal__footer">
              <button className="btn btn--ghost" onClick={closeModal} disabled={saving}>Cancel</button>
              <button className="btn btn--primary" onClick={handleSave} disabled={saving||!form.title.trim()}>
                {saving ? <><Loader size={14} className="spin-icon"/> Saving…</>
                 : saveOk ? <><CheckCircle size={14}/> Saved!</>
                 : modal==='add' ? 'Publish' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete */}
      {modal==='delete' && (
        <div className="admin-modal-overlay" onClick={e=>e.target===e.currentTarget&&closeModal()}>
          <div className="admin-modal admin-confirm-modal">
            <div className="admin-modal__header">
              <span className="admin-modal__title">Delete Article</span>
              <button className="admin-modal__close" onClick={closeModal}><X size={15}/></button>
            </div>
            <div className="admin-modal__body">
              <div className="admin-confirm-icon"><Trash2 size={26}/></div>
              <div className="admin-confirm-title">Delete this article?</div>
              <p className="admin-confirm-sub">"{selected?.title}" will be permanently removed from the API.</p>
              {apiError && <p style={{ color:'var(--red)', fontSize:13, marginTop:12 }}>{apiError}</p>}
            </div>
            <div className="admin-modal__footer">
              <button className="btn btn--ghost" onClick={closeModal} disabled={saving}>Cancel</button>
              <button className="btn btn--danger" onClick={handleDelete} disabled={saving}>
                {saving ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
