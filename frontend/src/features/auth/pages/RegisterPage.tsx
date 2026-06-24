import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, Navigate, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Heart } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import { registerSchema, type RegisterInput } from '../schemas'
import { useRegister } from '../api/auth'
import { useSessionStore } from '../session.store'
import { ApiError } from '@/shared/lib/api-client'
import { t } from '@/shared/i18n/strings'

export function RegisterPage() {
  const isAuth = useSessionStore((s) => Boolean(s.token))
  const navigate = useNavigate()
  const register = useRegister()

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      description: '',
      role: undefined as unknown as RegisterInput['role'],
    },
  })

  if (isAuth) return <Navigate to="/me" replace />

  const onSubmit = (input: RegisterInput) => {
    register.mutate(input, {
      onSuccess: () => {
        toast.success(t.toasts.welcomeAboard)
        navigate('/me', { replace: true })
      },
      onError: (err) => {
        const msg = err instanceof ApiError ? err.message : t.toasts.registrationFailed
        toast.error(msg)
      },
    })
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="mb-6 flex items-center justify-center gap-2">
        <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Heart className="size-5" aria-hidden fill="currentColor" />
        </span>
        <span className="text-xl font-bold tracking-tight">{t.brand.name}</span>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t.auth.registerTitle}</CardTitle>
          <CardDescription>{t.auth.registerDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base">{t.auth.roleQuestion}</FormLabel>
                    <FormControl>
                      <RadioGroup
                        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <label
                          htmlFor="role-caretaker"
                          className="flex cursor-pointer items-start gap-3 rounded-lg border bg-card p-4 transition hover:bg-accent has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent"
                        >
                          <RadioGroupItem id="role-caretaker" value="CARE_SEEKER" className="mt-1" />
                          <div className="space-y-1">
                            <div className="font-medium">{t.roles.CARE_SEEKER}</div>
                            <div className="text-sm text-muted-foreground">
                              {t.auth.careTakerCardDesc}
                            </div>
                          </div>
                        </label>
                        <label
                          htmlFor="role-caregiver"
                          className="flex cursor-pointer items-start gap-3 rounded-lg border bg-card p-4 transition hover:bg-accent has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent"
                        >
                          <RadioGroupItem id="role-caregiver" value="CARE_GIVER" className="mt-1" />
                          <div className="space-y-1">
                            <div className="font-medium">{t.roles.CARE_GIVER}</div>
                            <div className="text-sm text-muted-foreground">
                              {t.auth.careGiverCardDesc}
                            </div>
                          </div>
                        </label>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.common.fullName}</FormLabel>
                    <FormControl>
                      <Input autoComplete="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.auth.aboutYou}</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder={t.auth.aboutPlaceholder}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" size="lg" className="w-full" disabled={register.isPending}>
                {register.isPending ? t.auth.creatingAccount : t.landing.createAccount}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                {t.auth.haveAccount}{' '}
                <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                  {t.common.login}
                </Link>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
