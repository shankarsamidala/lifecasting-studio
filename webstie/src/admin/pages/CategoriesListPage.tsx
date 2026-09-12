import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '../../lib/api'
import type { Category } from '../../types/content'
import { AdminTable, type Column } from '../components/AdminTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function CategoriesListPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [creating, setCreating] = useState(false)
  const [newLabel, setNewLabel] = useState('')

  const refetch = () => api.get<Category[]>('/categories').then(setCategories)

  useEffect(() => {
    refetch()
  }, [])

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()
    await api.post('/categories', { label: newLabel, slug: slugify(newLabel), showReviews: false })
    setNewLabel('')
    setCreating(false)
    toast.success('Category created')
    refetch()
  }

  const handleDelete = async (category: Category) => {
    if (!confirm(`Delete "${category.label}" and all its products?`)) return
    await api.delete(`/categories/${category.id}`)
    toast.success('Category deleted')
    refetch()
  }

  const columns: Column<Category>[] = [
    { key: 'label', header: 'Name', render: (category) => <span className="font-medium">{category.label}</span> },
    { key: 'slug', header: 'Slug', render: (category) => `/${category.slug}` },
    { key: 'models', header: 'Products', render: (category) => category.models.length },
    {
      key: 'reviews',
      header: 'Shows Reviews',
      render: (category) =>
        category.showReviews ? <Badge variant="secondary">Yes</Badge> : <span className="text-muted-foreground">No</span>,
    },
  ]

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Each category is a menu item (e.g. "Baby Casting"). Open one to edit its delivery/materials text.
        </p>
        <Button type="button" onClick={() => setCreating(true)} className="shrink-0">
          + Add Category
        </Button>
      </div>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Category name</Label>
              <Input value={newLabel} onChange={(event) => setNewLabel(event.target.value)} required autoFocus />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreating(false)}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {categories === null ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <AdminTable
          columns={columns}
          items={categories}
          onEdit={(category) => navigate(`/admin/categories/${category.id}`)}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
