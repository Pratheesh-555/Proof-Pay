import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';

const links = [
  { to: '/', label: 'Overview', icon: '◫', end: true },
  { to: '/projects', label: 'Projects', icon: '▧' },
  { to: '/milestones', label: 'Milestones', icon: '◷' },
  { to: '/cases', label: 'Dispute cases', icon: '◇', badge: 'Sandbox' },
];

export default function AppShell({ user }) {
  const auth = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'Freelancer';
  const today = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());
  async function signOut() { await auth.logout(); }
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <aside className="sidebar fixed inset-y-0 left-0 z-20 hidden w-[248px] flex-col border-r border-line bg-white lg:flex">
        <div className="flex h-[76px] items-center gap-3 px-6">
          <div className="brand-mark">p</div>
          <div><div className="text-[17px] font-bold tracking-[-0.04em]">proofpay</div><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Freelancer workspace</div></div>
        </div>
        <div className="mx-4 mt-5 rounded-xl border border-line bg-[#fafbf9] p-3.5">
          <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#7fa894]"/><span className="text-xs font-semibold text-[#466357]">Sandbox environment</span></div>
          <p className="mb-0 mt-1.5 text-[11px] leading-4 text-muted">Payments and dispute actions are simulated with PayPal Sandbox.</p>
        </div>
        <nav className="mt-8 flex-1 px-3">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#9aa49f]">Workspace</p>
          <div className="space-y-1">
            {links.map((item) => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}>
              <span className="nav-icon">{item.icon}</span><span className="flex-1">{item.label}</span>{item.badge && <span className="rounded-full bg-[#f1f4f2] px-2 py-0.5 text-[9px] font-semibold text-[#75817d]">{item.badge}</span>}
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
        <header className="sticky top-0 z-10 flex h-[68px] items-center justify-between border-b border-line bg-white/90 px-5 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3 lg:hidden"><div className="brand-mark !h-8 !w-8 !text-base">p</div><span className="font-bold tracking-tight">proofpay</span></div>
          <div className="hidden text-xs text-muted sm:block">{today} <span className="mx-2 text-[#d5dbd8]">/</span> <span className="font-medium text-ink">Workspace</span></div>
          <div className="flex items-center gap-3"><button className="icon-button" aria-label="Notifications">♧</button><button className="help-button">Help & feedback <span className="ml-1 text-muted">↗</span></button></div>
        </header>
        <main className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 sm:py-10"><Outlet /></main>
      </div>
    </div>
  );
}

