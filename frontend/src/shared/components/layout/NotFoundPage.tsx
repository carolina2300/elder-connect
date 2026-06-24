import { Link } from 'react-router'
import { Heart } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { t } from '@/shared/i18n/strings'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-4 py-20 text-center">
      <span className="mb-6 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Heart className="size-6" aria-hidden fill="currentColor" />
      </span>
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">{t.notFound.code}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">{t.notFound.title}</h1>
      <p className="mt-3 text-muted-foreground">{t.notFound.description}</p>
      <Button asChild className="mt-6">
        <Link to="/">{t.notFound.goHome}</Link>
      </Button>
    </div>
  )
}
