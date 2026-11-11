import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';

const links = [
  { to: '/', label: 'Overview', icon: '◫', end: true },
  { to: '/projects', label: 'Projects', icon: '▧' },
  { to: '/milestones', label: 'Milestones', icon: '◷' },
  { to: '/cases', label: 'Dispute cases', icon: '◇' },
];

export default function AppShell({ user }) {
  const auth = useAuth();
  const location = useLocation();
  const firstName = user?.name?.split(' ')[0] || 'Freelancer';
  const today = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());
  const currentPage = links.find((item) => item.end ? location.pathname === item.to : location.pathname.startsWith(item.to))?.label || 'Workspace';
  async function signOut() { await auth.logout(); }
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <aside className="sidebar fixed inset-y-0 left-0 z-20 hidden w-[248px] flex-col border-r border-line bg-white lg:flex">
        <div className="flex h-[76px] items-center gap-3 px-6">
          <div className="brand-mark">P</div>
          <div><div className="text-[17px] font-bold tracking-[-0.04em]">ProofPay</div><div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Freelancer payments</div></div>
        </div>
        <div className="mx-4 mt-5 rounded-xl border border-line bg-[#f8faff] p-3.5">
          <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#0066f5]"/><span className="text-xs font-semibold text-[#053782]">Sandbox environment</span></div>
          <p className="mb-0 mt-1.5 text-xs leading-5 text-muted">PayPal calls use simulated data; no live funds move.</p>
        </div>
        <nav className="mt-8 flex-1 px-3">
          <p className="px-3 pb-2 text-xs font-bold uppercase tracking-[0.12em] text-muted">Workspace</p>
          <div className="space-y-1">
            {links.map((item) => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}>
              <span className="nav-icon">{item.icon}</span><span className="flex-1">{item.label}</span>
            </NavLink>)}
          </div>
        </nav>
        <div className="border-t border-line p-4">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="avatar">{firstName.slice(0, 1).toUpperCase()}</div>
            <div className="min-w-0 flex-1"><div className="break-words text-xs font-semibold leading-4">{user?.name || user?.email}</div><div className="text-xs text-muted">Freelancer account</div></div>
            <button className="help-button" onClick={signOut}>Sign out</button>
          </div>
        </div>
      </aside>
      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-10 flex h-[68px] items-center justify-between border-b border-line bg-white/90 px-5 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3 lg:hidden"><div className="brand-mark !h-8 !w-8 !text-base">P</div><span className="font-bold tracking-tight">ProofPay</span></div>
          <div className="hidden text-sm text-muted sm:block">{today} <span className="mx-2 text-[#d5d9df]">/</span> <span className="font-medium text-ink">{currentPage}</span></div>
          <a className="help-button" href="https://github.com/Pratheesh-555/Proof-Pay/blob/main/docs/WORKFLOW_SEQUENCE.md" target="_blank" rel="noreferrer">How it works <span className="ml-1 text-brand">↗</span></a>
        </header>
        <main className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 sm:py-10"><div key={location.pathname} className="page-enter"><Outlet /></div></main>
      </div>
    </div>
  );
}

