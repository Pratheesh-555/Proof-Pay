import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { Header, Notice, Empty } from './Projects.jsx';

export default function ProjectDetail() {
  const { projectId } = useParams(); const location = useLocation();
  const [project, setProject] = useState(null); const [milestones, setMilestones] = useState([]); const [clientLink, setClientLink] = useState(location.state?.clientLink ?? '');
  const [form, setForm] = useState({ title: '', scope: '', amount: '', criteria: '' }); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [success, setSuccess] = useState('');
  async function load() { setError(''); try { const result = await api.get(`/projects/${projectId}`); setProject(result.project); setMilestones(result.milestones ?? []); } catch (e) { setError(e.message); } }
  useEffect(() => { load(); }, [projectId]);
  async function createMilestone(event) {
    event.preventDefault(); setBusy(true); setError(''); setSuccess('');
    try { await api.post(`/projects/${projectId}/milestones`, { title: form.title, scope: form.scope, amount: form.amount, acceptanceCriteria: form.criteria.split('\n').map((x) => x.trim()).filter(Boolean) }); setForm({ title: '', scope: '', amount: '', criteria: '' }); setSuccess('Milestone added.'); await load(); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  async function deliver(milestoneId) {
    const note = window.prompt('Add a short delivery note for the evidence ledger:');
    if (note === null) return;
    setBusy(true); setError(''); setSuccess('');
    try { await api.post(`/milestones/${milestoneId}/deliver`, { note }); setSuccess('Marked delivered. This seller note is stored as claimed evidence.'); await load(); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  async function rotateLink() {
    setError(''); try { const result = await api.post(`/projects/${projectId}/client-link/rotate`, {}); setClientLink(result.clientLink); } catch (e) { setError(e.message); }
  }
  async function copyLink() {
    let link = clientLink;
    if (!link) { const result = await api.post(`/projects/${projectId}/client-link/rotate`, {}); link = result.clientLink; setClientLink(link); }
    await navigator.clipboard.writeText(link); setSuccess('Client review link copied.');
  }
  if (!project && !error) return <p className="text-sm text-muted">Loading project…</p>;
  return <div>
    <Header eyebrow="PROJECT" title={project?.title || 'Project'} description={project?.description || `${project?.clientId?.name || 'Client'} · ${project?.clientId?.email || ''}`} action={<Link to="/projects" className="secondary-button">← Projects</Link>} />
    {error && <Notice>{error}</Notice>}{success && <Notice tone="success">{success}</Notice>}
    <div className="mb-6 rounded-2xl border border-[#dce9e0] bg-[#f2f8f4] p-5">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="eyebrow">CLIENT REVIEW</p><h2 className="mt-1 text-sm font-semibold">Share a private approval link</h2><p className="mt-1 text-xs text-muted">Links expire after 30 days. Rotating one invalidates the previous link.</p></div><div className="flex gap-2"><button className="secondary-button" onClick={rotateLink}>Generate link</button><button className="primary-button" onClick={copyLink} disabled={!clientLink}>Copy link</button></div></div>
      {clientLink && <p className="mt-3 break-all rounded-lg bg-white px-3 py-2 font-mono text-xs text-muted">{clientLink}</p>}
    </div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="space-y-3">
        <h2 className="mb-1 text-sm font-semibold">Milestones</h2>
        {milestones.length ? milestones.map((m) => <article key={m._id} className="rounded-2xl border border-line bg-white p-5 shadow-panel">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">{m.title}</h3><p className="mt-1 text-sm text-muted">${(m.amountCents / 100).toFixed(2)} USD · {m.status.replaceAll('_', ' ')}</p></div><span className={`status-pill ${m.status === 'PAID' ? 'status-paid' : 'status-review'}`}><span className="status-dot" />{m.status.replaceAll('_', ' ')}</span></div>
          {m.scope && <p className="mt-3 text-sm leading-6 text-muted">{m.scope}</p>}
          <ul className="mt-3 space-y-1 text-xs text-muted">{(m.acceptanceCriteria ?? []).map((c) => <li key={c.id}>• {c.text}</li>)}</ul>
          {m.status === 'DRAFT' || m.status === 'CHANGES_REQUESTED' ? <button className="secondary-button mt-4" disabled={busy} onClick={() => deliver(m._id)}>Mark delivered</button> : null}
          {m.status === 'APPROVED' && <button className="secondary-button mt-4" disabled={busy} onClick={async () => { setBusy(true); try { await api.post(`/milestones/${m._id}/invoice/retry`, {}); setSuccess('PayPal Sandbox invoice sent.'); await load(); } catch (e) { setError(e.message); } finally { setBusy(false); } }}>Retry invoice send</button>}
        </article>) : <Empty title="Add a milestone" text="Define what the client will receive, how it will be accepted, and the USD amount." />}
      </section>
      <section className="rounded-2xl border border-line bg-white p-5 shadow-panel">
        <p className="eyebrow">NEW MILESTONE</p><h2 className="mt-1 text-lg font-semibold">Agree on the work</h2>
        <form className="mt-4 space-y-3" onSubmit={createMilestone}>
          <Field label="Milestone name" value={form.title} set={(title) => setForm({ ...form, title })} required />
          <Field label="Amount (USD)" value={form.amount} set={(amount) => setForm({ ...form, amount })} type="number" required min="0.01" step="0.01" />
          <label className="field-label">Scope<textarea className="field-input min-h-20" value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })} /></label>
          <label className="field-label">Acceptance criteria <span className="text-muted">(one per line)</span><textarea className="field-input min-h-24" value={form.criteria} onChange={(e) => setForm({ ...form, criteria: e.target.value })} required /></label>
          <button className="primary-button w-full" disabled={busy}>{busy ? 'Saving…' : 'Add milestone'}</button>
        </form>
      </section>
    </div>
  </div>;
}
function Field({ label, value, set, type = 'text', required = false, min, step }) { return <label className="field-label">{label}<input className="field-input" type={type} value={value} onChange={(e) => set(e.target.value)} required={required} min={min} step={step} /></label>; }
