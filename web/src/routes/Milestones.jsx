import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { Empty, Header, Notice } from './Projects.jsx';

export default function Milestones() {
  const [items, setItems] = useState([]); const [error, setError] = useState('');
  useEffect(() => { let active = true; (async () => { try { const { projects } = await api.get('/projects'); const rows = await Promise.all((projects ?? []).map(async (p) => { const d = await api.get(`/projects/${p._id}`); return (d.milestones ?? []).map((m) => ({ ...m, project: d.project })); })); if (active) setItems(rows.flat()); } catch (e) { if (active) setError(e.message); } })(); return () => { active = false; }; }, []);
  return <div><Header eyebrow="DELIVERY" title="Milestones" description="See delivery and approval status across your client work." />{error && <Notice>{error}</Notice>}
    <div className="space-y-3">{items.length ? items.map((m) => <Link key={m._id} to={`/projects/${m.project._id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-5 shadow-panel hover:border-[#c7d8f5]"><div><h2 className="font-semibold">{m.title}</h2><p className="mt-1 text-sm text-muted">{m.project.title} · ${(m.amountCents / 100).toFixed(2)} USD</p></div><span className="status-pill status-review"><span className="status-dot" />{m.status.replaceAll('_', ' ')}</span></Link>) : <Empty title="No milestones yet" text="Create a project and add its first milestone to get started." />}</div>
  </div>;
}
