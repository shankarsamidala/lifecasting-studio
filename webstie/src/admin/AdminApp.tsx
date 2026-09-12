import { Route, Routes } from 'react-router-dom'
import './admin.css'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from './AuthContext'
import { AdminLayout } from './AdminLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardHome } from './pages/DashboardHome'
import { CategoriesListPage } from './pages/CategoriesListPage'
import { CategoryEditPage } from './pages/CategoryEditPage'
import { ProductsListPage } from './pages/ProductsListPage'
import { ProductFormPage } from './pages/ProductFormPage'
import { HeroPage } from './pages/HeroPage'
import { GalleryPage } from './pages/GalleryPage'
import { TestimonialsPage } from './pages/TestimonialsPage'
import { FaqsPage } from './pages/FaqsPage'
import { NavLinksPage } from './pages/NavLinksPage'
import { FooterSettingsPage } from './pages/FooterSettingsPage'
import { SiteSettingsPage } from './pages/SiteSettingsPage'

export function AdminApp() {
  return (
    <div className="admin-theme">
      <Toaster />
      <AuthProvider>
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="categories" element={<CategoriesListPage />} />
            <Route path="categories/:categoryId" element={<CategoryEditPage />} />
            <Route path="products" element={<ProductsListPage />} />
            <Route path="products/new" element={<ProductFormPage />} />
            <Route path="products/:productId/edit" element={<ProductFormPage />} />
            <Route path="hero" element={<HeroPage />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="testimonials" element={<TestimonialsPage />} />
            <Route path="faqs" element={<FaqsPage />} />
            <Route path="nav-links" element={<NavLinksPage />} />
            <Route path="footer" element={<FooterSettingsPage />} />
            <Route path="settings" element={<SiteSettingsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </div>
  )
}
