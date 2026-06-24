import { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Toaster } from '@/shared/components/ui/sonner'
import { TooltipProvider } from '@/shared/components/ui/tooltip'
import { queryClient } from './query-client'
import { router } from '@/router'
import { useSessionStore } from '@/features/auth/session.store'
import { useMe } from '@/features/auth/api/auth'

function SessionGate({ children }: { children: React.ReactNode }) {
  const token = useSessionStore((s) => s.token)
  const clearSession = useSessionStore((s) => s.clearSession)
  const { isLoading, isError } = useMe(Boolean(token))

  useEffect(() => {
    if (isError) clearSession()
  }, [isError, clearSession])

  if (token && isLoading) {
    return (
      <div className="mx-auto max-w-md space-y-3 p-10">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  return <>{children}</>
}

export function Providers() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={200}>
        <SessionGate>
          <RouterProvider router={router} />
        </SessionGate>
        <Toaster richColors position="top-center" duration={Infinity} closeButton />
      </TooltipProvider>
    </QueryClientProvider>
  )
}
