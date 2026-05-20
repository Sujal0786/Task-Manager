import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import AppLayout from '../components/layout/AppLayout.jsx';
import Login from '../pages/Login.jsx';
import Signup from '../pages/Signup.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Projects from '../pages/Projects.jsx';
import ProjectDetail from '../pages/ProjectDetail.jsx';
import MyTasks from '../pages/MyTasks.jsx';
import NotFound from '../pages/NotFound.jsx';

const AppRoutes = () => {
  const { isAuthenticated, initializing } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          initializing ? (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
              <span className="text-sm text-slate-500">Loading…</span>
            </div>
          ) : isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/signup"
        element={
          initializing ? (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
              <span className="text-sm text-slate-500">Loading…</span>
            </div>
          ) : isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <Signup />
          )
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/my-tasks" element={<MyTasks />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
