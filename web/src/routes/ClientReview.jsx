import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiRequest } from '../api.js';
import { Empty, Notice } from './Projects.jsx';

export default function ClientReview() {
  const { token } = useParams(); const [data, setData] = useState(null); const [name, setName] = useState(''); const [note, setNote] = useState(''); const [payUrl, setPayUrl] = useState(''); const [error, setError] = useState(''); const [success, setSuccess] = useState(''); const [busy, setBusy] = useState(false);
  async function load() { try { setError(''); const result = await apiRequest('/client/project', { headers: { 'X-Client-Token': token } }); setData(result); } catch (e) { setError(e.message); } }
  useEffect(() => { load(); }, [token]);
  async function approve(id) { setBusy(true); setError(''); try { const result = await apiRequest(`/client/milestones/${id}/approve`, { method: 'POST', headers: { 'X-Client-Token': token }, body: JSON.stringify({ approverName: name, confirm: true }) }); setPayUrl(result.payUrl); setSuccess('Approval saved. Your PayPal invoice is ready.'); await load(); } catch (e) { setError(e.message); } finally { setBusy(false); } }
  async function requestChanges(id) { if (note.trim().length < 10) { setError('Please add a change note of at least 10 characters.'); return; } setBusy(true); setError(''); try { await apiRequest(`/client/milestones/${id}/request-changes`, { method: 'POST', headers: { 'X-Client-Token': token }, body: JSON.stringify({ note }) }); setNote(''); setSuccess('Your change request was sent to the freelancer.'); await load(); } catch (e) { setError(e.message); } finally { setBusy(false); } }
  return <main className="min-h-screen bg-canvas px-4 py-8 sm:px-8 sm:py-12"><div className="mx-auto max-w-2xl">
    <div className="mb-7 flex items-center gap-3"><div className="brand-mark">p</div><div><p className="text-base font-bold">proofpay</p><p className="text-xs text-muted">Client review · PayPal Sandbox</p></div></div>
    {error && <Notice>{error}</Notice>}{success && <Notice tone="success">{success}</Notice>}
    {!data && !error && <p className="text-sm text-muted">Loading review…</p>}
    {data && <><p className="eyebrow">WORK READY FOR REVIEW</p><h1 className="page-title mt-2">{data.project.title}</h1><p className="mt-2 text-sm text-muted">Prepared by {data.freelancer?.businessName || data.freelancer?.name || 'your freelancer'}</p>
      <div className="mt-6 space-y-4">{data.milestones.map(({ milestone, evidence, invoice }) => <article key={milestone._id} className="rounded-2xl border border-line bg-white p-5 shadow-panel">
        <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">{milestone.title}</h2><p className="mt-1 text-sm text-muted">${(milestone.amountCents / 100).toFixed(2)} USD</p></div><span className="status-pill status-review"><span className="status-dot" />{milestone.status.replaceAll('_', ' ')}</span></div>
        {milestone.scope && <p className="mt-4 text-sm leading-6">{milestone.scope}</p>}
        <div className="mt-4"><p className="text-xs font-semibold">Acceptance criteria</p><ul className="mt-2 space-y-2 text-sm text-muted">{(milestone.acceptanceCriteria ?? []).map((c) => <li key={c.id}>□ {c.text}</li>)}</ul></div>
        {evidence?.length > 0 && <div className="mt-4"><p className="text-xs font-semibold">Delivery evidence</p><ul className="mt-2 space-y-1 text-xs text-muted">{evidence.map((e) => <li key={e._id}>• {e.title}: {e.summary}</li>)}</ul></div>}
        {milestone.status === 'DELIVERED' && <div className="mt-5 border-t border-line pt-4">
          <label className="field-label">Your name<input className="field-input" value={name} onChange={(e) => setName(e.target.value)} required /></label>
          <div className="mt-3 flex flex-wrap gap-2"><button className="primary-button" disabled={busy || !name.trim()} onClick={() => approve(milestone._id)}>Approve and create PayPal invoice</button><button className="secondary-button" disabled={busy} onClick={() => requestChanges(milestone._id)}>Request changes</button></div>
          <label className="field-label mt-3">Change request note<textarea className="field-input min-h-16" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Describe what should be updated." /></label>
        </div>}
        {invoice?.payerViewUrl && <a className="primary-button mt-4 inline-flex" href={invoice.payerViewUrl} target="_blank" rel="noreferrer">Pay with PayPal</a>}
        {payUrl && <a className="primary-button mt-4 inline-flex" href={payUrl} target="_blank" rel="noreferrer">Open PayPal invoice</a>}
      </article>)}
      {!data.milestones.length && <Empty title="Nothing ready for review" text="The freelancer will add a milestone here when work is ready." />}</div>
    </>}
  </div></main>;
}
