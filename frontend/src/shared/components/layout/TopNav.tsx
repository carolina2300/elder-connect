import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router'
import { Heart, LogOut, Menu, User as UserIcon } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { useSessionStore } from '@/features/auth/session.store'
import { useLogout } from '@/features/auth/api/auth'
import { RoleBadge } from '@/features/profile/components/RoleBadge'
import { cn } from '@/shared/lib/cn'
import { t } from '@/shared/i18n/strings'

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

interface NavItem {
  to: string
  label: string
}

export function TopNav() {
  const user = useSessionStore((s) => s.currentUser)
  const isAuth = useSessionStore((s) => Boolean(s.token))
  const logout = useLogout()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const onLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => navigate('/', { replace: true }),
    })
  }

  const items: NavItem[] = (() => {
    if (!isAuth || !user) {
      return [
        { to: '/login', label: t.nav.findCaregivers },
        { to: '/login', label: t.nav.findCareSeekers },
        { to: '/register', label: t.nav.becomeCaregiver },
      ]
    }
    if (user.role === 'CARE_SEEKER') {
      return [
        { to: '/search/caregivers', label: t.nav.findCaregivers },
        { to: '/messages', label: t.nav.messages },
      ]
    }
    return [
      { to: '/search/caretakers', label: t.nav.findCareSeekers },
      { to: '/messages', label: t.nav.messages },
    ]
  })()

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'text-sm font-medium transition-colors',
      isActive ? 'text-primary' : 'text-foreground/80 hover:text-primary'
    )

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Heart className="size-5" aria-hidden fill="currentColor" />
          </span>
          <span className="text-lg font-bold tracking-tight">{t.brand.name}</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {items.map((item) => (
            <NavLink key={item.label} to={item.to} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label={t.nav.menu}>
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle>{t.nav.menu}</SheetTitle>
                </SheetHeader>
                <nav className="mt-4 flex flex-col gap-1 px-4">
                  {items.map((item) => (
                    <SheetClose asChild key={item.label}>
                      <NavLink
                        to={item.to}
                        className={({ isActive }) =>
                          cn(
                            'rounded-md px-3 py-2 text-base font-medium transition-colors',
                            isActive
                              ? 'bg-accent text-primary'
                              : 'text-foreground/80 hover:bg-accent hover:text-primary'
                          )
                        }
                      >
                        {item.label}
                      </NavLink>
                    </SheetClose>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          )}

          {isAuth && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="size-8">
                    {user.photo ? <AvatarImage src={user.photo} alt={user.name} /> : null}
                    <AvatarFallback>{initials(user.name)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="space-y-1">
                  <div>{user.name}</div>
                  <RoleBadge role={user.role} />
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/me">
                    <UserIcon /> {t.nav.myProfile}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} disabled={logout.isPending}>
                  <LogOut /> {t.common.logout}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link to="/login">{t.common.login}</Link>
              </Button>
              <Button asChild>
                <Link to="/register">{t.common.signUp}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
