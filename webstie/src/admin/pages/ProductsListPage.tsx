import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import type { Model } from '../../types/content'
import { formatStartingPrice } from '../../lib/pricing'
import { AdminTable, type Column } from '../components/AdminTable'

type ProductRow = Model & { category: { id: string; label: string; slug: string } }

export function ProductsListPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<ProductRow[] | null>(null)

  const refetch = () => api.get<ProductRow[]>('/products').then(setProducts)

  useEffect(() => {
    refetch()
  }, [])

  const handleDelete = async (product: ProductRow) => {
    if (!confirm(`Delete "${product.label}"?`)) return
    await api.delete(`/products/${product.id}`)
    refetch()
  }

  const columns: Column<ProductRow>[] = [
    {
      key: 'thumbnail',
      header: '',
      className: 'w-16',
      render: (product) =>
        product.imageUrl ? (
          <img src={product.imageUrl} alt="" className="h-12 w-12 rounded-md object-cover" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-surface-alt font-sans text-[10px] text-text-muted">
            No image
          </div>
        ),
    },
    { key: 'label', header: 'Name', render: (product) => <span className="font-medium">{product.label}</span> },
    { key: 'category', header: 'Category', render: (product) => product.category.label },
    { key: 'price', header: 'Price', render: (product) => formatStartingPrice(product) },
    { key: 'code', header: 'Code', render: (product) => product.code ?? '—' },
  ]

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="font-sans text-sm text-text-muted">Every product across all categories.</p>
        <button type="button" onClick={() => navigate('/admin/products/new')} className="btn-primary shrink-0">
          + Add Product
        </button>
      </div>

      {products === null ? (
        <p className="font-sans text-sm text-text-muted">Loading…</p>
      ) : (
        <AdminTable
          columns={columns}
          items={products}
          onEdit={(product) => navigate(`/admin/products/${product.id}/edit`)}
          onDelete={handleDelete}
          emptyMessage="No products yet — add one to get started."
        />
      )}
    </div>
  )
}
