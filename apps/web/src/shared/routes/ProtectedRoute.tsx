import { Navigate } from 'react-router-dom';
import { useAuth }  from '@/features/auth';
import { PageSpinner } from '@/shared/components';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) return <PageSpinner />;
  if (!user)   return <Navigate to="/login" replace />;

  return <>{children}</>;
}
