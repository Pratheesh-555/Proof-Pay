import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { Empty, Header, Notice } from './Projects.jsx';

export default function Cases() {
  const [cases, setCases] = useState([]); const [disputeId, setDisputeId] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [success, setSuccess] = useState('');
  async function load() { try { const result = await api.get('/cases'); setCases(result.cases ?? []); } catch (e) { setError(e.message); } }
  useEffect(() => { load(); }, []);
  async function importDispute(event) { event.preventDefault(); setBusy(true); setError(''); setSuccess(''); try { const result = await api.post('/cases/import', { disputeId }); setSuccess(`Imported ${result.case.paypalDisputeId}. Map it to a milestone, then run analysis.`); setDisputeId(''); await load(); } catch (e) { setError(e.message); } finally { setBusy(false); } }
  return <div>
    <Header eyebrow="PAYPAL SANDBOX" title="Dispute cases" description="Import a Sandbox dispute, map it to the project milestone, and review the evidence-backed AI draft before sending." />
    {error && <Notice>{error}</Notice>}{success && <Notice tone="success">{success}</Notice>}
    <section className="mb-6 rounded-2xl border border-[#dbe7fa] bg-[#f3f7ff] p-5"><p className="eyebrow">IMPORT SANDBOX CASE</p><form className="mt-2 flex flex-col gap-3 sm:flex-row" onSubmit={importDispute}><input className="field-input flex-1" value={disputeId} onChange={(e) => setDisputeId(e.target.value)} placeholder="PayPal dispute ID" required /><button className="primary-button" disabled={busy}>{busy ? 'Fetching…' : 'Import from PayPal'}</button></form><p className="mt-2 text-xs text-muted">Read-only import. It fetches the dispute details from your PayPal Sandbox app.</p></section>
    <div className="space-y-3">{cases.length ? cases.map((c) => <Link key={c._id} to={`/cases/${c._id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-5 shadow-panel hover:border-[#c7d8f5]"><div><h2 className="font-semibold">{c.paypalDisputeId}</h2><p className="mt-1 text-sm text-muted">{c.paypal?.reason || 'Reason pending'} · {c.paypal?.currency || 'USD'} {(Number(c.paypal?.disputeAmountCents ?? 0) / 100).toFixed(2)}</p></div><span className="status-pill status-review"><span className="status-dot" />{c.status.replaceAll('_', ' ')}</span></Link>) : <Empty title="No cases imported" text="Import your Sandbox dispute ID to bring it into ProofPay." />}</div>
    <div className="mt-6"><button className="secondary-button" onClick={load}>Refresh list</button></div>
  </div>;
}
