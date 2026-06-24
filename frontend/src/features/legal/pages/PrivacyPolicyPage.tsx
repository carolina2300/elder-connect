import { Link } from 'react-router'
import { t } from '@/shared/i18n/strings'

export function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        to="/"
        className="mb-8 inline-block text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
      >
        {t.legal.backHome}
      </Link>

      <h1 className="text-3xl font-bold tracking-tight">{t.legal.privacyTitle}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t.legal.privacyLastUpdated}</p>
      <p className="mt-6 text-base leading-relaxed text-foreground/80">{t.legal.privacyIntro}</p>

      <Section heading={t.legal.privacyControllerHeading} body={t.legal.privacyControllerBody} preWrap />
      <Section heading={t.legal.privacyDataCollectedHeading} body={t.legal.privacyDataCollectedBody} />
      <Section heading={t.legal.privacyPurposeHeading} body={t.legal.privacyPurposeBody} />
      <Section heading={t.legal.privacyRetentionHeading} body={t.legal.privacyRetentionBody} />
      <Section heading={t.legal.privacyRightsHeading} body={t.legal.privacyRightsBody} />
      <Section heading={t.legal.privacySecurityHeading} body={t.legal.privacySecurityBody} />
      <Section heading={t.legal.privacyContactHeading} body={t.legal.privacyContactBody} />
    </div>
  )
}

function Section({
  heading,
  body,
  preWrap = false,
}: {
  heading: string
  body: string
  preWrap?: boolean
}) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold">{heading}</h2>
      <p
        className={`mt-2 text-base leading-relaxed text-foreground/80${preWrap ? ' whitespace-pre-line' : ''}`}
      >
        {body}
      </p>
    </section>
  )
}
