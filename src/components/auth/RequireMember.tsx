import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import { LoadingScreen } from '../ui/LoadingScreen'
import { ErrorScreen } from '../ui/ErrorScreen'

// Só deixa passar membros da equipe. Os outros vão pra tela certa.
export function RequireMember() {
  const { status, access, error, refreshAccess } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <LoadingScreen />
  if (status === 'signed_out') return <Navigate to="/entrar" replace state={{ from: location.pathname }} />
  if (error) return <ErrorScreen message={error} onRetry={() => void refreshAccess()} />
  if (access === null) return <LoadingScreen />
  if (access === 'can_create_team') return <Navigate to="/criar-equipe" replace />
  if (access === 'no_access') return <Navigate to="/sem-acesso" replace />

  return <Outlet />
}
