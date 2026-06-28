import { Navigate } from 'react-router-dom';
import { useAuth }  from '@/features/auth';
import { PageSpinner } from '@/shared/components';

interface RoleGuardProps {
  roles:    ('TEACHER' | 'STUDENT')[];
  children: React.ReactNode;
}

export default function RoleGuard({ roles, children }: RoleGuardProps) {
  const { user, loading } = useAuth();

  if (loading) return <PageSpinner />;
  if (!user)   return <Navigate to="/login"    replace />;
  if (!roles.includes(user.role)) return <Navigate to="/403" replace />;

  return <>{children}</>;
}
