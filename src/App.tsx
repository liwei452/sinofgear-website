import { Route, Routes } from 'react-router'
import SiteLayout from '@/components/SiteLayout'
import { LanguageProvider } from '@/i18n/LanguageContext'
import { pages } from '@/data/pages'
import PageHero from '@/components/PageHero'
import Seo from '@/components/Seo'
import NotFoundPage from '@/pages/NotFoundPage'
import ProductsPage from '@/pages/ProductsPage'
import ProductDetailPage from '@/pages/ProductDetailPage'
import HomePage from '@/pages/HomePage'
import CapabilitiesPage from '@/pages/CapabilitiesPage'
import QualityPage from '@/pages/QualityPage'

function BasicPage({ page }: { page: 'home' | 'products' | 'capabilities' | 'quality' | 'contact' }) {
  const content = pages[page]
  return (
    <>
      <Seo seo={content.seo} pathname={page === 'home' ? '/' : `/${page}`} />
      <PageHero eyebrow={content.eyebrow} title={content.title} subtitle={content.subtitle} />
    </>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:slug" element={<ProductDetailPage />} />
          <Route path="capabilities" element={<CapabilitiesPage />} />
          <Route path="quality" element={<QualityPage />} />
          <Route path="contact" element={<BasicPage page="contact" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </LanguageProvider>
  )
}
