import { Navigate, Outlet } from 'react-router'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { useSessionStore } from '../session.store'
import { t } from '@/shared/i18n/strings'
import type { Role } from '@/shared/types/domain'

interface Props {
  role: Role
}

export function RequireRole({ role }: Props) {
  const currentUser = useSessionStore((s) => s.currentUser)
  const mismatch = currentUser && currentUser.role !== role

  useEffect(() => {
    if (mismatch) {
      const msg = role === 'CARE_GIVER' ? t.toasts.onlyForCaregivers : t.toasts.onlyForCareTakers
      toast.error(msg)
    }
  }, [mismatch, role])

  if (!currentUser) return <Navigate to="/login" replace />
  if (mismatch) return <Navigate to="/me" replace />
  return <Outlet />
}
