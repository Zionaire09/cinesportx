import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { useSiteSettings } from '@/contexts/site-settings';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { userFeaturesEnabled, settingsLoading } = useSiteSettings();

  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse-slow text-white font-medium">Loading...</div>
      </div>
    );
  }

  // If user features are disabled and the visitor is not an admin, redirect home
  if (!userFeaturesEnabled && !user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
