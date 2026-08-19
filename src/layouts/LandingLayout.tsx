import { Outlet } from 'react-router'
import { Footer } from '@/features/landing/components/Footer'
import { Navbar } from '@/features/landing/components/Navbar'

export function LandingLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}