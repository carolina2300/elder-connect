import { Outlet } from 'react-router'
import { TopNav } from './TopNav'
import { Footer } from './Footer'

export function AppShell() {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden">
      <TopNav />
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
