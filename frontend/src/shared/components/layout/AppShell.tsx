import { Outlet } from 'react-router'
import { TopNav } from './TopNav'
import { Footer } from './Footer'

export function AppShell() {
  return (
    <div className="flex h-screen flex-col">
      <TopNav />
      <main className="flex flex-1 flex-col overflow-y-auto">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
