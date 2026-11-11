import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { Empty, Header, Notice } from './Projects.jsx';

export default function CaseDetail() {
  const { caseId } = useParams(); const [doc, setDoc] = useState(null); const [milestones, setMilestones] = useState([]); const [selectedMilestone, setSelectedMilestone] = useState(''); const [finalNote, setFinalNote] = useState(''); const [action, setAction] = useState('FIGHT'); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [success, setSuccess] = useState('');
  async function load() {
    setError('');
    try { const result = await api.get(`/cases/${caseId}`); setDoc(result.case); setFinalNote(result.case.finalNote ?? ''); setAction(result.case.decision?.action ?? 'FIGHT');
      const { projects } = await api.get('/projects'); const details = await Promise.all((projects ?? []).map((p) => api.get(`/projects/${p._id}`))); setMilestones(details.flatMap((d) => (d.milestones ?? []).map((m) => ({ ...m, projectTitle: d.project.title }))));
    } catch (e) { setError(e.message); }
  }
  useEffect(() => { load(); }, [caseId]);
  const evidence = doc?.evidenceRefs ?? [];
  const assessment = doc?.ai?.assessment;
  const allowed = doc?.paypal?.allowedActions ?? [];
  async function run(path, body = {}) { setBusy(true); setError(''); setSuccess(''); try { await api.post(path, body); setSuccess('Saved.'); await load(); } catch (e) { setError(e.message); } finally { setBusy(false); } }
  async function saveDraft() { setBusy(true); setError(''); try { await api.patch(`/cases/${caseId}/draft`, { action, finalNote }); setSuccess('Draft saved. Approval was cleared; approve the updated draft before submitting.'); await load(); } catch (e) { setError(e.message); } finally { setBusy(false); } }
  if (!doc && !error) return <p className="text-sm text-muted">Loading case…</p>;
  if (!doc) return <><Notice>{error}</Notice><Link to="/cases" className="secondary-button">Back to cases</Link></>;
  return <div>
    <Header eyebrow="PAYPAL SANDBOX CASE" title={doc.paypalDisputeId} description={`${doc.paypal?.reason || 'Dispute'} · ${(Number(doc.paypal?.disputeAmountCents ?? 0) / 100).toFixed(2)} ${doc.paypal?.currency || 'USD'} · ${doc.paypal?.status || doc.status}`} action={<Link to="/cases" className="secondary-button">← Cases</Link>} />
    {error && <Notice>{error}</Notice>}{success && <Notice tone="success">{success}</Notice>}
    <div className="mb-5 flex flex-wrap gap-2"><span className="status-pill status-review"><span className="status-dot" />{doc.status.replaceAll('_', ' ')}</span><button className="secondary-button" disabled={busy} onClick={() => run(`/cases/${caseId}/refresh`)}>Refresh from PayPal</button></div>
    {!doc.milestoneId ? <section className="rounded-2xl border border-line bg-white p-5 shadow-panel"><h2 className="font-semibold">Map this dispute to a milestone</h2><p className="mt-1 text-sm text-muted">Choose the work connected to this payment before analyzing it.</p><div className="mt-4 flex flex-col gap-3 sm:flex-row"><select className="field-input flex-1" value={selectedMilestone} onChange={(e) => setSelectedMilestone(e.target.value)}><option value="">Select a milestone…</option>{milestones.map((m) => <option key={m._id} value={m._id}>{m.projectTitle} — {m.title}</option>)}</select><button className="primary-button" disabled={busy || !selectedMilestone} onClick={() => run(`/cases/${caseId}/map`, { milestoneId: selectedMilestone })}>Map case</button></div></section> : <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
      <section className="rounded-2xl border border-line bg-white p-5 shadow-panel"><div className="flex items-start justify-between gap-3"><div><p className="eyebrow">AI ASSESSMENT</p><h2 className="mt-1 text-lg font-semibold">Review the evidence against each criterion</h2></div><button className="secondary-button" disabled={busy} onClick={() => run(`/cases/${caseId}/analyse`)}>Run analysis</button></div>
        {doc.ai?.error && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">AI analysis unavailable: {doc.ai.error}</p>}
        {assessment ? <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl bg-[#f8faf8] p-4 text-xs leading-5">{JSON.stringify(assessment, null, 2)}</pre> : <p className="mt-4 text-sm text-muted">Run analysis to generate a structured assessment.</p>}
        <div className="mt-4 border-t border-line pt-4"><p className="text-xs font-semibold">Evidence refs</p>{evidence.length ? <ul className="mt-2 space-y-2 text-sm text-muted">{evidence.map((e) => <li key={e.ref} className="rounded-lg bg-[#f8faf8] p-3"><strong className="text-ink">{e.ref}</strong> · {String(e.evidenceId)}</li>)}</ul> : <p className="mt-2 text-xs text-muted">No evidence linked yet. Add delivery evidence on the project milestone page.</p>}</div>
      </section>
      <section className="rounded-2xl border border-line bg-white p-5 shadow-panel"><p className="eyebrow">HUMAN REVIEW</p><h2 className="mt-1 text-lg font-semibold">Approve only the response you agree with</h2>
        {doc.ai?.draft && <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap rounded-xl bg-[#f8faf8] p-3 text-xs leading-5">{JSON.stringify(doc.ai.draft, null, 2)}</pre>}
        <label className="field-label mt-4">Recommended action<select className="field-input" value={action} onChange={(e) => setAction(e.target.value)}><option value="FIGHT">{allowed.includes('provide_supporting_info') ? 'Provide supporting information' : 'Provide evidence'}</option><option value="PARTIAL_REFUND">Offer partial refund</option><option value="ACCEPT">Accept claim</option></select></label>
        <label className="field-label mt-3">PayPal response note<textarea className="field-input min-h-32" value={finalNote} onChange={(e) => setFinalNote(e.target.value)} maxLength={2000} /></label>
        {doc.ai?.removed?.length > 0 && <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3"><p className="text-xs font-semibold text-red-800">Removed unsupported claims</p>{doc.ai.removed.map((item, index) => <p key={index} className="mt-1 text-xs text-red-700 line-through">{item.text || item.claim}: {item.reason}</p>)}</div>}
        <p className="mt-3 text-xs text-muted">Available PayPal actions: {allowed.length ? allowed.join(', ') : 'none currently'}</p>
        <div className="mt-4 flex flex-wrap gap-2"><button className="secondary-button" disabled={busy || doc.status !== 'READY'} onClick={saveDraft}>Save edits</button><button className="primary-button" disabled={busy || doc.status !== 'READY' || !finalNote.trim()} onClick={() => run(`/cases/${caseId}/approve`, { confirm: true })}>Approve response</button><button className="primary-button" disabled={busy || doc.status !== 'APPROVED'} onClick={() => run(`/cases/${caseId}/submit`)}>Submit to PayPal</button></div>
      </section>
    </div>}
    {doc.timeline?.length > 0 && <section className="mt-5 rounded-2xl border border-line bg-white p-5 shadow-panel"><h2 className="font-semibold">Case timeline</h2><ol className="mt-3 space-y-2">{doc.timeline.slice().reverse().map((item, i) => <li key={`${item.eventType}-${i}`} className="text-sm"><span className="font-medium">{item.eventType?.replaceAll('_', ' ')}</span><span className="text-muted"> — {item.detail}</span></li>)}</ol></section>}
  </div>;
}
