import { Link } from 'react-router'
import { Heart } from 'lucide-react'
import { t } from '@/shared/i18n/strings'

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/50 py-4">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4">
        <Link to="/" className="flex items-center gap-1.5">
          <span className="flex size-6 items-center justify-center rounded bg-primary text-primary-foreground">
            <Heart className="size-3" aria-hidden fill="currentColor" />
          </span>
          <span className="text-sm font-bold tracking-tight">{t.brand.name}</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/privacy" className="text-xs text-foreground/60 transition-colors hover:text-primary">
            {t.footer.privacyPolicy}
          </Link>
          <Link to="/cookies" className="text-xs text-foreground/60 transition-colors hover:text-primary">
            {t.footer.cookiePolicy}
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">{t.footer.copyright}</p>
      </div>
    </footer>
  )
}
