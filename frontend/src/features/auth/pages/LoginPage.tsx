import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Heart } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import { loginSchema, type LoginInput } from '../schemas'
import { useLogin } from '../api/auth'
import { useSessionStore } from '../session.store'
import { ApiError } from '@/shared/lib/api-client'
import { t } from '@/shared/i18n/strings'

interface LocationState {
  from?: string
}

export function LoginPage() {
  const isAuth = useSessionStore((s) => Boolean(s.token))
  const location = useLocation()
  const navigate = useNavigate()
  const login = useLogin()

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  if (isAuth) return <Navigate to="/me" replace />

  const onSubmit = (input: LoginInput) => {
    login.mutate(input, {
      onSuccess: () => {
        const state = location.state as LocationState | null
        navigate(state?.from ?? '/me', { replace: true })
      },
      onError: (err) => {
        const msg = err instanceof ApiError ? err.message : t.toasts.loginFailed
        toast.error(msg)
      },
    })
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col items-center justify-center px-4 py-10">
      <div className="mb-6 flex items-center gap-2">
        <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Heart className="size-5" aria-hidden fill="currentColor" />
        </span>
        <span className="text-xl font-bold tracking-tight">{t.brand.name}</span>
      </div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">{t.auth.loginTitle}</CardTitle>
          <CardDescription>{t.auth.loginDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.common.email}</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.common.password}</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" size="lg" disabled={login.isPending}>
                {login.isPending ? t.auth.loggingIn : t.common.login}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {t.auth.noAccount}{' '}
                <Link to="/register" className="font-medium text-primary underline-offset-4 hover:underline">
                  {t.auth.registerCta}
                </Link>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
