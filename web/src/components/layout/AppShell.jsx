import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';

const links = [
  { to: '/', label: 'Overview', icon: '◫', end: true },
  { to: '/projects', label: 'Projects', icon: '▧' },
  { to: '/milestones', label: 'Milestones', icon: '◷' },
  { to: '/cases', label: 'Dispute cases', icon: '◇', badge: 'Sandbox' },
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
          <div className="brand-mark">p</div>
          <div><div className="text-[17px] font-bold tracking-[-0.04em]">proofpay</div><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Freelancer workspace</div></div>
        </div>
        <div className="mx-4 mt-5 rounded-2xl border border-[#dbe7fa] bg-[#f3f7ff] p-4">
          <span className="sandbox-pill">PAYPAL SANDBOX</span>
          <p className="mb-0 mt-2 text-xs leading-5 text-muted">Test payments and dispute actions in a safe environment.</p>
        </div>
        <nav className="mt-8 flex-1 px-3">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#9aa49f]">Workspace</p>
          <div className="space-y-1">
            {links.map((item) => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}>
              <span className="nav-icon">{item.icon}</span><span className="flex-1">{item.label}</span>{item.badge && <span className="rounded-full bg-[#edf4ff] px-2 py-0.5 text-[10px] font-semibold text-[#053782]">{item.badge}</span>}
            </NavLink>)}
          </div>
        </nav>
        <div className="border-t border-line p-4">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="avatar">{firstName.slice(0, 1).toUpperCase()}</div>
            <div className="min-w-0 flex-1"><div className="truncate text-xs font-semibold">{user?.name || user?.email}</div><div className="text-[11px] text-muted">Freelancer account</div></div>
            <button className="help-button" onClick={signOut}>Sign out</button>
          </div>
        </div>
      </aside>
      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-10 flex h-[76px] items-center justify-between border-b border-line bg-white/95 px-5 shadow-[0_2px_10px_rgba(17,24,39,.025)] backdrop-blur-xl sm:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex items-center gap-2.5 lg:hidden"><div className="brand-mark !h-8 !w-8 !text-base">p</div><span className="font-bold tracking-tight">proofpay</span></div>
            <div className="hidden items-center gap-4 lg:flex"><span className="topbar-date">{today}</span><span className="topbar-divider"/><div><p className="m-0 text-[10px] font-bold uppercase tracking-[.14em] text-muted">Workspace</p><p className="m-0 mt-0.5 text-sm font-semibold text-ink">{currentPage}</p></div></div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4"><span className="sandbox-pill hidden sm:inline-flex">PAYPAL SANDBOX</span><button className="help-button hidden lg:inline-flex" type="button">Help & feedback <span className="ml-1 text-brand">↗</span></button><span className="topbar-divider hidden lg:block"/><div className="flex items-center gap-2"><div className="avatar">{firstName.slice(0, 1).toUpperCase()}</div><span className="hidden max-w-28 truncate text-sm font-semibold sm:inline">{firstName}</span></div></div>
        </header>
        <main className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 sm:py-10"><div key={location.pathname} className="page-enter"><Outlet /></div></main>
      </div>
    </div>
  );
}

