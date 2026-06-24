import { Link } from 'react-router'
import { ArrowRight, Heart, Search, MessagesSquare, ShieldCheck } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { useSessionStore } from '@/features/auth/session.store'
import { t } from '@/shared/i18n/strings'

interface Stat {
  value: string
  label: string
}

const stats: Stat[] = [
  { value: '10.000+', label: t.landing.stats.verifiedCaregivers },
  { value: '50.000+', label: t.landing.stats.familiesHelped },
  { value: '4,9', label: t.landing.stats.averageRating },
  { value: '98%', label: t.landing.stats.satisfactionRate },
]

export function LandingPage() {
  const isAuth = useSessionStore((s) => Boolean(s.token))

  return (
    <>
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
          <h1 className="mx-auto max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
            {t.landing.heroTitle}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {t.landing.heroSubtitle}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {isAuth ? (
              <>
                <Button asChild size="lg">
                  <Link to="/posts/new">
                    {t.newPost.createPost} <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/me">{t.landing.goToMyProfile}</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link to="/register">
                    {t.landing.findCaregiver} <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/register">{t.landing.becomeCaregiver}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-border/60 bg-card/40">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-bold text-primary sm:text-5xl">{s.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t.landing.whyTitle}</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t.landing.whySubtitle}</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="space-y-3 p-6">
              <ShieldCheck className="size-8 text-primary" aria-hidden />
              <h3 className="text-lg font-semibold">{t.landing.features.verifiedTitle}</h3>
              <p className="text-sm text-muted-foreground">{t.landing.features.verifiedDesc}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 p-6">
              <Search className="size-8 text-primary" aria-hidden />
              <h3 className="text-lg font-semibold">{t.landing.features.searchTitle}</h3>
              <p className="text-sm text-muted-foreground">{t.landing.features.searchDesc}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 p-6">
              <MessagesSquare className="size-8 text-primary" aria-hidden />
              <h3 className="text-lg font-semibold">{t.landing.features.messagesTitle}</h3>
              <p className="text-sm text-muted-foreground">{t.landing.features.messagesDesc}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 p-6">
              <Heart className="size-8 text-primary" aria-hidden />
              <h3 className="text-lg font-semibold">{t.landing.features.careTitle}</h3>
              <p className="text-sm text-muted-foreground">{t.landing.features.careDesc}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-t border-border/60 bg-card/40">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t.landing.ctaTitle}</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t.landing.ctaSubtitle}</p>
          {!isAuth && (
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/register">{t.landing.createAccount}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/login">{t.common.login}</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
