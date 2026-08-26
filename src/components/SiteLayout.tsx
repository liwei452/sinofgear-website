import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import Header from '@/sections/Header'
import Footer from '@/sections/Footer'
import FloatingCta from '@/sections/FloatingCta'

export default function SiteLayout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="min-h-[70vh] pt-16 lg:pt-[76px]">
        <Outlet />
      </main>
      <Footer />
      <FloatingCta />
    </div>
  )
}
