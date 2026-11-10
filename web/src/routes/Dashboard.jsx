import { useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';

ModuleRegistry.registerModules([AllCommunityModule]);

function StatusCell({ value }) {
  const cls = ['PAID', 'RESOLVED', 'APPROVED'].includes(value) ? 'status-paid' : ['DISPUTED', 'READY', 'WAITING_PAYPAL', 'UNMAPPED'].includes(value) ? 'status-review' : 'status-progress';
  return <span className={`status-pill ${cls}`}><span className="status-dot" />{String(value ?? '—').replaceAll('_', ' ')}</span>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [cases, setCases] = useState([]);
  const [milestoneCount, setMilestoneCount] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  async function load() {
    setLoading(true); setError('');
    try { const [p, c] = await Promise.all([api.get('/projects'), api.get('/cases')]); const projectRows = p.projects ?? []; setProjects(projectRows); setCases(c.cases ?? []); const details = await Promise.all(projectRows.map((project) => api.get(`/projects/${project._id}`))); setMilestoneCount(details.reduce((sum, detail) => sum + (detail.milestones?.length ?? 0), 0)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  const rows = useMemo(() => cases.map((item) => ({
    id: item._id,
    dispute: item.paypalDisputeId,
    project: item.projectTitle || item.projectId?.title || 'Needs mapping',
    reason: item.paypal?.reason || '—',
    amount: money(item.paypal?.disputeAmountCents, item.paypal?.currency),
    status: item.status,
    action: item.decision?.action || '—',
  })), [cases]);
  const columns = useMemo(() => [
    { field: 'dispute', headerName: 'DISPUTE', minWidth: 190, flex: 1, cellRenderer: ({ data }) => <Link className="font-semibold text-brand" to={`/cases/${data.id}`}>{data.dispute}</Link> },
    { field: 'project', headerName: 'PROJECT', minWidth: 160, flex: 1 },
    { field: 'reason', headerName: 'REASON', minWidth: 150, flex: 1 },
    { field: 'amount', headerName: 'AMOUNT', width: 120 },
    { field: 'action', headerName: 'AI ACTION', width: 120 },
    { field: 'status', headerName: 'STATUS', width: 165, cellRenderer: StatusCell },
  ], []);
  const openCases = cases.filter((c) => !['RESOLVED', 'SUBMITTED'].includes(c.status)).length;

  return <div>
    <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div><p className="eyebrow">WORKSPACE OVERVIEW</p><h1 className="page-title">Good to see you, {user?.name?.split(' ')[0] || 'Freelancer'}</h1><p className="mt-2 max-w-xl text-sm leading-6 text-muted">Track client approvals, PayPal invoices, and evidence-backed dispute responses.</p></div>
      <div className="flex gap-2"><button onClick={load} className="secondary-button" disabled={loading}>Refresh</button><Link to="/projects" className="primary-button">＋ New project</Link></div>
    </div>
    {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Active projects" value={projects.length} note="Connected to your workspace" icon="▧" tone="green" />
      <Metric label="Disputes needing review" value={openCases} note="Human approval required before submission" icon="◇" tone="rose" />
      <Metric label="Total cases" value={cases.length} note="PayPal Sandbox and replay cases" icon="↗" tone="blue" />
      <Metric label="Milestones" value={milestoneCount} note="Delivery and approval stages tracked" icon="◷" tone="sand" />
    </div>
    <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-panel">
      <div className="flex flex-col justify-between gap-4 border-b border-line px-5 py-5 sm:flex-row sm:items-center sm:px-6">
        <div><h2 className="text-[15px] font-semibold tracking-[-0.02em]">Dispute inbox</h2><p className="mt-1 text-xs text-muted">AI drafts require your review and approval.</p></div>
        <Link to="/cases" className="text-xs font-semibold text-brand">Open case workspace →</Link>
      </div>
      <div className="ag-theme-quartz proofpay-grid h-[330px] w-full">
        <AgGridReact rowData={rows} columnDefs={columns} rowHeight={54} headerHeight={42} suppressCellFocus pagination={false} loading={loading} overlayNoRowsTemplate="<span>No disputes yet. Import a Sandbox dispute from the Dispute cases page.</span>" />
      </div>
      <div className="flex flex-col justify-between gap-2 border-t border-line bg-[#fcfdfc] px-6 py-3 text-[11px] text-muted sm:flex-row"><span>PayPal Sandbox environment</span><span>AI recommendations are advisory; you approve every submission.</span></div>
    </section>
  </div>;
}

function Metric({ label, value, note, icon, tone }) {
  return <div className="rounded-2xl border border-line bg-white p-5 shadow-panel"><div className="flex items-center justify-between"><span className="text-xs font-medium text-muted">{label}</span><span className={`metric-icon metric-${tone}`}>{icon}</span></div><div className="mt-4 text-[27px] font-semibold tracking-[-0.055em]">{value}</div><div className="mt-1 text-[11px] text-muted">{note}</div></div>;
}
