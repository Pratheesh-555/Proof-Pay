import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext.jsx';
import AppShell from './components/layout/AppShell.jsx';
const Dashboard = lazy(() => import('./routes/Dashboard.jsx'));
import Login from './routes/Login.jsx';
import Projects from './routes/Projects.jsx';
import ProjectDetail from './routes/ProjectDetail.jsx';
import Milestones from './routes/Milestones.jsx';
import ClientReview from './routes/ClientReview.jsx';
import Cases from './routes/Cases.jsx';
import CaseDetail from './routes/CaseDetail.jsx';

function ProtectedShell() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-sm text-muted">Loading ProofPay…</div>;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return <AppShell user={user} />;
}

export default function App() {
  return <BrowserRouter><AuthProvider><Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/c/:token" element={<ClientReview />} />
    <Route element={<ProtectedShell />}>
      <Route path="/" element={<Suspense fallback={<div className="text-sm text-muted">Loading dashboard…</div>}><Dashboard /></Suspense>} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:projectId" element={<ProjectDetail />} />
      <Route path="/milestones" element={<Milestones />} />
      <Route path="/cases" element={<Cases />} />
      <Route path="/cases/:caseId" element={<CaseDetail />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></AuthProvider></BrowserRouter>;
}
