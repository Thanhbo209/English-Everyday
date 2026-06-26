import { Navigate } from 'react-router-dom';

/** Redirect root to /dashboard — DashboardLayout handles auth. */
export default function Home() {
  return <Navigate to="/dashboard" replace />;
}
