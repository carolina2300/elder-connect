import { Link } from 'react-router'
import { t } from '@/shared/i18n/strings'

export function CookiePolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        to="/"
        className="mb-8 inline-block text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
      >
        {t.legal.backHome}
      </Link>

      <h1 className="text-3xl font-bold tracking-tight">{t.legal.cookieTitle}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t.legal.cookieLastUpdated}</p>
      <p className="mt-6 text-base leading-relaxed text-foreground/80">{t.legal.cookieIntro}</p>

      <Section heading={t.legal.cookieNoCookiesHeading} body={t.legal.cookieNoCookiesBody} />
      <Section heading={t.legal.cookieLocalStorageHeading} body={t.legal.cookieLocalStorageBody} />
      <Section heading={t.legal.cookieFutureHeading} body={t.legal.cookieFutureBody} />
      <Section heading={t.legal.cookieContactHeading} body={t.legal.cookieContactBody} />
    </div>
  )
}

function Section({ heading, body }: { heading: string; body: string }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold">{heading}</h2>
      <p className="mt-2 text-base leading-relaxed text-foreground/80">{body}</p>
    </section>
  )
}
