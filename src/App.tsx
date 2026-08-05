import { Route, Routes } from 'react-router'
import SiteLayout from '@/components/SiteLayout'
import { LanguageProvider } from '@/i18n/LanguageContext'
import NotFoundPage from '@/pages/NotFoundPage'
import ProductsPage from '@/pages/ProductsPage'
import ProductDetailPage from '@/pages/ProductDetailPage'
import HomePage from '@/pages/HomePage'
import CapabilitiesPage from '@/pages/CapabilitiesPage'
import QualityPage from '@/pages/QualityPage'
import ContactPage from '@/pages/ContactPage'
import AboutPage from '@/pages/AboutPage'
import { CustomerServiceProvider } from '@/customerService/CustomerServiceContext'

export default function App() {
  return (
    <LanguageProvider>
      <CustomerServiceProvider>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:slug" element={<ProductDetailPage />} />
            <Route path="capabilities" element={<CapabilitiesPage />} />
            <Route path="quality" element={<QualityPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </CustomerServiceProvider>
    </LanguageProvider>
  )
}
