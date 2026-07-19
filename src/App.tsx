import { useState } from 'react'
import { LanguageProvider } from '@/i18n/LanguageContext'
import { useReveal } from '@/hooks/useReveal'
import Header from '@/sections/Header'
import Hero from '@/sections/Hero'
import Products from '@/sections/Products'
import Capabilities from '@/sections/Capabilities'
import Quality from '@/sections/Quality'
import Industries from '@/sections/Industries'
import Process from '@/sections/Process'
import Faq from '@/sections/Faq'
import Inquiry from '@/sections/Inquiry'
import Footer from '@/sections/Footer'
import FloatingCta from '@/sections/FloatingCta'

function Site() {
  const [product, setProduct] = useState('')
  const ref = useReveal<HTMLDivElement>()

  return (
    <div ref={ref} className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Products onInquire={setProduct} />
        <Capabilities />
        <Quality />
        <Industries />
        <Process />
        <Faq />
        <Inquiry product={product} setProduct={setProduct} />
      </main>
      <Footer />
      <FloatingCta />
    </div>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <Site />
    </LanguageProvider>
  )
}
