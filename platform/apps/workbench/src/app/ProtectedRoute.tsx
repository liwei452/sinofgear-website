import { useQuery } from '@tanstack/react-query'
import { Navigate, Outlet, useLocation } from 'react-router'
import { ApiError, apiRequest } from '../api/client'

export function ProtectedRoute() {
  const location = useLocation()
  const session = useQuery({
    queryKey: ['session'],
    queryFn: () => apiRequest<{ user: { id: string; displayName: string } }>('/auth/me'),
  })

  if (session.isPending) return <div className="center-state" role="status">正在验证登录状态…</div>
  if (session.error instanceof ApiError && session.error.status === 401) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  if (session.isError) return <div className="error-panel" role="alert">无法连接工作台，请刷新重试。</div>
  return <Outlet />
}
