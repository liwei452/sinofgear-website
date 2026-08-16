import { Route, Routes } from 'react-router'
import SiteLayout from '@/components/SiteLayout'
import { LanguageProvider } from '@/i18n/LanguageContext'
import NotFoundPage from '@/pages/NotFoundPage'
import ProductsPage from '@/pages/ProductsPage'
import ProductDetailPage from '@/pages/ProductDetailPage'
import IndustryLandingPage from '@/pages/IndustryLandingPage'
import HomePage from '@/pages/HomePage'
import CapabilitiesPage from '@/pages/CapabilitiesPage'
import QualityPage from '@/pages/QualityPage'
import ContactPage from '@/pages/ContactPage'
import AboutPage from '@/pages/AboutPage'
import { CustomerServiceProvider } from '@/customerService/CustomerServiceContext'
import BlogIndexPage from '@/pages/BlogIndexPage'
import BlogArticlePage from '@/pages/BlogArticlePage'
import RouteAnalytics from '@/analytics/RouteAnalytics'

export default function App() {
  return (
    <LanguageProvider>
      <CustomerServiceProvider>
        <RouteAnalytics />
        <Routes>
          <Route element={<SiteLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:slug" element={<ProductDetailPage />} />
            <Route path="industries/:industry/:need" element={<IndustryLandingPage />} />
            <Route path="capabilities" element={<CapabilitiesPage />} />
            <Route path="quality" element={<QualityPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="blog" element={<BlogIndexPage />} />
            <Route path="blog/:slug" element={<BlogArticlePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </CustomerServiceProvider>
    </LanguageProvider>
  )
}
