import { Route, Routes } from 'react-router'
import SiteLayout from '@/components/SiteLayout'
import { LanguageProvider } from '@/i18n/LanguageContext'
import { pages } from '@/data/pages'
import PageHero from '@/components/PageHero'
import Seo from '@/components/Seo'
import NotFoundPage from '@/pages/NotFoundPage'
import ProductsPage from '@/pages/ProductsPage'
import ProductDetailPage from '@/pages/ProductDetailPage'

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
          <Route index element={<BasicPage page="home" />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:slug" element={<ProductDetailPage />} />
          <Route path="capabilities" element={<BasicPage page="capabilities" />} />
          <Route path="quality" element={<BasicPage page="quality" />} />
          <Route path="contact" element={<BasicPage page="contact" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </LanguageProvider>
  )
}
