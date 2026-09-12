import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '../../lib/api'
import type { Category, Model, TieredPricing } from '../../types/content'
import {
  AGE_TIER_LABELS,
  EMPTY_PRODUCT_FORM,
  generateModelCode,
  generateProductLabel,
  slugify,
  type ProductFormValues,
} from '../productForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

function modelToFormValues(model: Model): ProductFormValues {
  const tiers = model.pricingType === 'ageTiers' ? (model.pricingConfig as TieredPricing).tiers : []
  const under6 = tiers.find((tier) => tier.label === AGE_TIER_LABELS.under6Months)
  const above1 = tiers.find((tier) => tier.label === AGE_TIER_LABELS.aboveOneYear)
  return {
    categoryId: model.categoryId,
    slug: model.slug,
    code: model.code ?? '',
    group: model.group ?? '',
    imageUrl: model.imageUrl ?? '',
    variantType: model.variantType,
    customizationNote: model.customizationNote ?? '',
    priceUnder6Months: under6?.price ?? '',
    priceUnder6MonthsStrike: under6?.strikePrice ?? '',
    priceAboveOneYear: above1?.price ?? '',
    priceAboveOneYearStrike: above1?.strikePrice ?? '',
    preservationNote: model.preservationNote ?? '',
  }
}

function formValuesToPayload(values: ProductFormValues, category: Category, excludeProductId?: string) {
  const label = generateProductLabel(category.label, values.variantType)
  const existingCountForType = category.models.filter(
    (existing) => existing.variantType === values.variantType && existing.id !== excludeProductId,
  ).length
  const tiers = [
    {
      label: AGE_TIER_LABELS.under6Months,
      price: values.priceUnder6Months === '' ? 0 : values.priceUnder6Months,
      strikePrice: values.priceUnder6MonthsStrike === '' ? undefined : values.priceUnder6MonthsStrike,
    },
    {
      label: AGE_TIER_LABELS.aboveOneYear,
      price: values.priceAboveOneYear === '' ? 0 : values.priceAboveOneYear,
      strikePrice: values.priceAboveOneYearStrike === '' ? undefined : values.priceAboveOneYearStrike,
    },
  ]
  return {
    categoryId: values.categoryId,
    label,
    slug: values.slug || slugify(label),
    code: values.code || generateModelCode(category.label, values.variantType, existingCountForType),
    group: values.group || null,
    imageUrl: values.imageUrl || null,
    variantType: values.variantType,
    customizationNote: values.variantType === 'customization' ? values.customizationNote || null : null,
    pricingType: 'ageTiers',
    pricingConfig: { tiers },
    preservationNote: values.preservationNote || null,
  }
}

export function ProductFormPage() {
  const { productId } = useParams<{ productId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isEditing = Boolean(productId)

  const [categories, setCategories] = useState<Category[]>([])
  const [values, setValues] = useState<ProductFormValues>({
    ...EMPTY_PRODUCT_FORM,
    categoryId: searchParams.get('categoryId') ?? '',
  })
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    api.get<Category[]>('/categories').then(setCategories)
  }, [])

  useEffect(() => {
    if (!productId) return
    api.get<Model>(`/products/${productId}`).then((model) => {
      setValues(modelToFormValues(model))
      setLoading(false)
    })
  }, [productId])

  const update = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }))

  const activeCategory = categories.find((category) => category.id === values.categoryId)
  const filters = activeCategory?.filters ?? []

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!activeCategory) return
    setSaving(true)
    try {
      const payload = formValuesToPayload(values, activeCategory, productId)
      if (isEditing) {
        await api.patch(`/products/${productId}`, payload)
      } else {
        await api.post('/products', payload)
      }
      toast.success(isEditing ? 'Product updated' : 'Product created')
      navigate('/admin/products')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>

  return (
    <div className="max-w-2xl">
      <Button type="button" variant="link" className="mb-4 h-auto p-0" onClick={() => navigate('/admin/products')}>
        ← Back to Products
      </Button>
      <p className="mb-6 text-sm text-muted-foreground">
        {isEditing ? 'Edit this product.' : 'Add a new product to a category.'}
      </p>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={values.categoryId} onValueChange={(value) => update('categoryId', value)} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category…" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Filter group</Label>
                <Select
                  value={values.group}
                  onValueChange={(value) => update('group', value)}
                  disabled={filters.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="— none —" />
                  </SelectTrigger>
                  <SelectContent>
                    {filters.map((filter) => (
                      <SelectItem key={filter.slug} value={filter.slug}>
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Product image</Label>
              <div className="flex items-center gap-3">
                {values.imageUrl ? (
                  <img src={values.imageUrl} alt="" className="h-16 w-16 rounded-md border object-cover" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                    None
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={async (event) => {
                    const file = event.target.files?.[0]
                    if (!file) return
                    setUploading(true)
                    try {
                      const { url } = await api.upload(file)
                      update('imageUrl', url)
                    } finally {
                      setUploading(false)
                    }
                  }}
                />
                {uploading ? <span className="text-xs text-muted-foreground">Uploading…</span> : null}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={values.variantType}
                onValueChange={(value) => update('variantType', value as ProductFormValues['variantType'])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="customization">Customization</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {values.variantType === 'customization' ? (
              <div className="space-y-1.5">
                <Label>Customization details</Label>
                <Textarea
                  value={values.customizationNote}
                  onChange={(event) => update('customizationNote', event.target.value)}
                  rows={3}
                  placeholder="Describe what's customizable and how it affects the price…"
                />
              </div>
            ) : null}

            <div className="space-y-4 rounded-md border p-4">
              <div>
                <Label className="mb-2 block">{AGE_TIER_LABELS.under6Months}</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Price (₹)</Label>
                    <Input
                      type="number"
                      value={values.priceUnder6Months}
                      onChange={(event) =>
                        update('priceUnder6Months', event.target.value === '' ? '' : Number(event.target.value))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Strike-through (₹, optional)</Label>
                    <Input
                      type="number"
                      value={values.priceUnder6MonthsStrike}
                      onChange={(event) =>
                        update('priceUnder6MonthsStrike', event.target.value === '' ? '' : Number(event.target.value))
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">{AGE_TIER_LABELS.aboveOneYear}</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Price (₹)</Label>
                    <Input
                      type="number"
                      value={values.priceAboveOneYear}
                      onChange={(event) =>
                        update('priceAboveOneYear', event.target.value === '' ? '' : Number(event.target.value))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Strike-through (₹, optional)</Label>
                    <Input
                      type="number"
                      value={values.priceAboveOneYearStrike}
                      onChange={(event) =>
                        update('priceAboveOneYearStrike', event.target.value === '' ? '' : Number(event.target.value))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Preservation note (optional)</Label>
              <Textarea
                value={values.preservationNote}
                onChange={(event) => update('preservationNote', event.target.value)}
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={saving || !values.categoryId}>
                {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Product'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
