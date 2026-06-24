import { Navigate, Outlet, useLocation } from 'react-router'
import { useSessionStore } from '../session.store'

export function RequireAuth() {
  const isAuth = useSessionStore((s) => Boolean(s.token))
  const location = useLocation()
  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  return <Outlet />
}
