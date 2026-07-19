import { Route, Routes } from 'react-router'
import SiteLayout from '@/components/SiteLayout'
import { LanguageProvider } from '@/i18n/LanguageContext'
import { pages } from '@/data/pages'
import { getProductBySlug } from '@/data/products'
import { useParams } from 'react-router'
import PageHero from '@/components/PageHero'
import Seo from '@/components/Seo'
import NotFoundPage from '@/pages/NotFoundPage'

function BasicPage({ page }: { page: 'home' | 'products' | 'capabilities' | 'quality' | 'contact' }) {
  const content = pages[page]
  return (
    <>
      <Seo seo={content.seo} pathname={page === 'home' ? '/' : `/${page}`} />
      <PageHero eyebrow={content.eyebrow} title={content.title} subtitle={content.subtitle} />
    </>
  )
}

function BasicProductPage() {
  const { slug } = useParams()
  const product = getProductBySlug(slug)
  if (!product) return <NotFoundPage />

  return (
    <>
      <Seo
        seo={product.seo}
        pathname={`/products/${product.slug}`}
        type="product"
        image={product.image}
      />
      <PageHero eyebrow="Custom product" title={product.name} subtitle={product.valueProposition} />
    </>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<BasicPage page="home" />} />
          <Route path="products" element={<BasicPage page="products" />} />
          <Route path="products/:slug" element={<BasicProductPage />} />
          <Route path="capabilities" element={<BasicPage page="capabilities" />} />
          <Route path="quality" element={<BasicPage page="quality" />} />
          <Route path="contact" element={<BasicPage page="contact" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </LanguageProvider>
  )
}
