import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMe } from '../store/authSlice';
import type { RootState } from '../store';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const dispatch = useAppDispatch();
  const { user, tokens, loading } = useAppSelector((s: RootState) => s.auth);
  const location = useLocation();

  useEffect(() => {
    if (!user && tokens && !loading) {
      dispatch(fetchMe());
    }
  }, [user, tokens, loading, dispatch]);

  if (!tokens) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (loading && !user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
