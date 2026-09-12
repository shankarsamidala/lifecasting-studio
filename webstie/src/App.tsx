import { Route, Routes, useParams } from 'react-router-dom'
import { Footer } from './components/Footer/Footer'
import { Header } from './components/Header/Header'
import { CategoryPage } from './pages/CategoryPage'
import { ContactPage } from './pages/ContactPage'
import { Home } from './pages/Home'
import { ProductPage } from './pages/ProductPage'
import { ShippingPolicyPage } from './pages/ShippingPolicyPage'

// Keyed by route params so navigating between categories/models remounts the
// page (fresh fetch state) instead of reusing the same component instance.
function CategoryPageRoute() {
  const { categorySlug } = useParams()
  return <CategoryPage key={categorySlug} />
}

function ProductPageRoute() {
  const { categorySlug, modelSlug } = useParams()
  return <ProductPage key={`${categorySlug}/${modelSlug}`} />
}

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collections/:categorySlug" element={<CategoryPageRoute />} />
          <Route path="/collections/:categorySlug/:modelSlug" element={<ProductPageRoute />} />
          <Route path="/pages/shipping-policy" element={<ShippingPolicyPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
