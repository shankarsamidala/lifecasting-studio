import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../lib/api'
import type { Category } from '../../types/content'
import { StringListEditor } from '../components/StringListEditor'
import { AdminTable, type Column } from '../components/AdminTable'
import { formatStartingPrice } from '../../lib/pricing'

const inputClass =
  'w-full rounded-lg border border-ink-900/15 px-3 py-2 font-sans text-sm outline-none focus:border-primary'

export function CategoryEditPage() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const navigate = useNavigate()
  const [category, setCategory] = useState<Category | null>(null)
  const [saving, setSaving] = useState(false)

  const refetch = () => api.get<Category>(`/categories/${categoryId}`).then(setCategory)

  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId])

  if (!category) return <p className="font-sans text-sm text-text-muted">Loading…</p>

  const update = <K extends keyof Category>(key: K, value: Category[K]) =>
    setCategory((current) => (current ? { ...current, [key]: value } : current))

  const handleSaveCategory = async () => {
    setSaving(true)
    try {
      await api.patch(`/categories/${category.id}`, {
        label: category.label,
        slug: category.slug,
        filters: category.filters,
        warranty: category.warranty,
        castingDelivery: category.castingDelivery,
        finalDelivery: category.finalDelivery,
        castingProcess: category.castingProcess,
        materials: category.materials,
        preservation: category.preservation,
        showReviews: category.showReviews,
      })
    } finally {
      setSaving(false)
    }
  }

  const filters = category.filters ?? []

  const columns: Column<Category['models'][number]>[] = [
    {
      key: 'thumbnail',
      header: '',
      className: 'w-16',
      render: (model) =>
        model.imageUrl ? (
          <img src={model.imageUrl} alt="" className="h-12 w-12 rounded-md object-cover" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-surface-alt font-sans text-[10px] text-text-muted">
            No image
          </div>
        ),
    },
    { key: 'label', header: 'Name', render: (model) => model.label },
    { key: 'price', header: 'Price', render: (model) => formatStartingPrice(model) },
  ]

  return (
    <div className="max-w-3xl">
      <button
        type="button"
        onClick={() => navigate('/admin/categories')}
        className="mb-4 font-sans text-sm text-text-muted hover:text-primary"
      >
        ← Back to Categories
      </button>
      <h1 className="font-display mb-6 text-2xl font-semibold text-text">{category.label}</h1>

      <details open className="mb-4 rounded-xl border border-ink-900/10 bg-surface p-5">
        <summary className="cursor-pointer font-sans text-sm font-semibold text-text marker:content-none">
          Basic Info
        </summary>
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block font-sans text-sm font-medium text-text">Label</span>
              <input type="text" value={category.label} onChange={(event) => update('label', event.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className="mb-1 block font-sans text-sm font-medium text-text">Slug</span>
              <input type="text" value={category.slug} onChange={(event) => update('slug', event.target.value)} className={inputClass} />
            </label>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={category.showReviews}
              onChange={(event) => update('showReviews', event.target.checked)}
            />
            <span className="font-sans text-sm text-text">Show customer reviews on this category's pages</span>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block font-sans text-sm font-medium text-text">Warranty</span>
              <input
                type="text"
                value={category.warranty ?? ''}
                onChange={(event) => update('warranty', event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block font-sans text-sm font-medium text-text">Casting process</span>
              <input
                type="text"
                value={category.castingProcess ?? ''}
                onChange={(event) => update('castingProcess', event.target.value)}
                className={inputClass}
              />
            </label>
          </div>
        </div>
      </details>

      <details className="mb-4 rounded-xl border border-ink-900/10 bg-surface p-5">
        <summary className="cursor-pointer font-sans text-sm font-semibold text-text marker:content-none">
          Filter Tabs {filters.length > 0 ? `(${filters.length})` : ''}
        </summary>
        <div className="mt-4">
          <p className="mb-2 font-sans text-xs text-text-muted">
            Optional tabs shown on the category page, e.g. "2 Casting" / "4 Casting".
          </p>
          <div className="space-y-2">
            {filters.map((filter, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={filter.label}
                  onChange={(event) =>
                    update(
                      'filters',
                      filters.map((f, i) => (i === index ? { ...f, label: event.target.value } : f)),
                    )
                  }
                  placeholder="Label"
                  className={`flex-1 ${inputClass}`}
                />
                <input
                  type="text"
                  value={filter.slug}
                  onChange={(event) =>
                    update(
                      'filters',
                      filters.map((f, i) => (i === index ? { ...f, slug: event.target.value } : f)),
                    )
                  }
                  placeholder="slug"
                  className={`w-40 ${inputClass}`}
                />
                <button
                  type="button"
                  onClick={() => update('filters', filters.filter((_, i) => i !== index))}
                  className="rounded-lg border border-red-200 px-3 py-1 font-sans text-sm text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => update('filters', [...filters, { label: '', slug: '' }])}
            className="mt-2 rounded-lg border border-ink-900/15 px-3 py-1.5 font-sans text-sm text-text"
          >
            Add filter tab
          </button>
        </div>
      </details>

      <details className="mb-6 rounded-xl border border-ink-900/10 bg-surface p-5">
        <summary className="cursor-pointer font-sans text-sm font-semibold text-text marker:content-none">
          Delivery, Materials & Preservation Text
        </summary>
        <div className="mt-4 space-y-4">
          <StringListEditor
            label="Casting & delivery details"
            values={category.castingDelivery ?? []}
            onChange={(values) => update('castingDelivery', values)}
          />
          <StringListEditor
            label="Final delivery"
            values={category.finalDelivery ?? []}
            onChange={(values) => update('finalDelivery', values)}
          />
          <StringListEditor
            label="Materials"
            values={category.materials ?? []}
            onChange={(values) => update('materials', values)}
          />
          <StringListEditor
            label="Preservation instructions"
            values={category.preservation ?? []}
            onChange={(values) => update('preservation', values)}
          />
        </div>
      </details>

      <button type="button" onClick={handleSaveCategory} disabled={saving} className="btn-primary mb-8 disabled:opacity-60">
        {saving ? 'Saving…' : 'Save Category'}
      </button>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-text">
            Products in {category.label} ({category.models.length})
          </h2>
          <Link to={`/admin/products/new?categoryId=${category.id}`} className="btn-primary no-underline">
            + Add Product
          </Link>
        </div>

        <AdminTable
          columns={columns}
          items={category.models}
          onEdit={(model) => navigate(`/admin/products/${model.id}/edit`)}
          emptyMessage="No products in this category yet."
        />
      </div>
    </div>
  )
}
