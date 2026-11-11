import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function Projects() {
  const [projects, setProjects] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', clientName: '', clientEmail: '' });
  async function load() { try { const data = await api.get('/projects'); setProjects(data.projects ?? []); } catch (e) { setError(e.message); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);
  async function create(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { const result = await api.post('/projects', { title: form.title, description: form.description, client: { name: form.clientName, email: form.clientEmail } }); navigate(`/projects/${result.project._id}`, { state: { clientLink: result.clientLink } }); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  return <div>
    <Header eyebrow="WORKSPACE" title="Projects" description="Create a project, agree the milestone criteria, and share a client review link." />
    {error && <Notice>{error}</Notice>}
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="space-y-3">
        {loading ? <p className="text-sm text-muted">Loading projects…</p> : projects.length ? projects.map((p) => <Link key={p._id} to={`/projects/${p._id}`} className="block rounded-2xl border border-line bg-white p-5 shadow-panel hover:border-[#c7d8f5]">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold">{p.title}</h2><p className="mt-1 text-sm text-muted">{p.clientId?.name} · {p.clientId?.email}</p></div><span className="status-pill status-progress"><span className="status-dot" />{p.status}</span></div>
          {p.description && <p className="mt-3 text-sm leading-6 text-muted">{p.description}</p>}
        </Link>) : <Empty title="No projects yet" text="Create one to start a client approval and PayPal invoice flow." />}
      </section>
      <section className="rounded-2xl border border-line bg-white p-5 shadow-panel">
        <p className="eyebrow">NEW PROJECT</p><h2 className="mt-1 text-lg font-semibold">Start with the client</h2>
        <form className="mt-4 space-y-3" onSubmit={create}>
          <Field label="Project name" value={form.title} onChange={(title) => setForm({ ...form, title })} required />
          <Field label="Client name" value={form.clientName} onChange={(clientName) => setForm({ ...form, clientName })} required />
          <Field label="Client email" type="email" value={form.clientEmail} onChange={(clientEmail) => setForm({ ...form, clientEmail })} required />
          <label className="field-label">Description<textarea className="field-input min-h-20" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <button className="primary-button w-full" disabled={busy}>{busy ? 'Creating…' : 'Create project'}</button>
        </form>
      </section>
    </div>
  </div>;
}

export function Header({ eyebrow, title, description, action }) { return <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">{eyebrow}</p><h1 className="page-title">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p></div>{action}</div>; }
export function Field({ label, value, onChange, type = 'text', required = false, placeholder }) { return <label className="field-label">{label}<input className="field-input" type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} placeholder={placeholder} /></label>; }
export function Notice({ children, tone = 'error' }) { return <div role="alert" className={`mb-5 rounded-xl border px-4 py-3 text-sm ${tone === 'success' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'}`}>{children}</div>; }
export function Empty({ title, text }) { return <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-center"><h2 className="font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted">{text}</p></div>; }
