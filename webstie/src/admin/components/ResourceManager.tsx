import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api, ApiError } from '../../lib/api'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export type FieldConfig = {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'image'
  required?: boolean
}

type ResourceManagerProps<T extends { id: string; position: number }> = {
  description?: string
  resourcePath: string
  fields: FieldConfig[]
  emptyItem: Record<string, unknown>
  renderLabel: (item: T) => string
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldConfig
  value: unknown
  onChange: (value: unknown) => void
}) {
  const [uploading, setUploading] = useState(false)

  if (field.type === 'textarea') {
    return (
      <Textarea
        value={(value as string) ?? ''}
        onChange={(event) => onChange(event.target.value)}
        required={field.required}
        rows={3}
      />
    )
  }

  if (field.type === 'number') {
    return (
      <Input
        type="number"
        value={(value as number) ?? ''}
        onChange={(event) => onChange(Number(event.target.value))}
        required={field.required}
      />
    )
  }

  if (field.type === 'image') {
    return (
      <div className="flex items-center gap-3">
        {value ? (
          <img src={value as string} alt="" className="h-14 w-14 rounded-md object-cover" />
        ) : null}
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
              onChange(url)
            } finally {
              setUploading(false)
            }
          }}
        />
        {uploading ? <span className="text-xs text-muted-foreground">Uploading…</span> : null}
      </div>
    )
  }

  return (
    <Input
      type="text"
      value={(value as string) ?? ''}
      onChange={(event) => onChange(event.target.value)}
      required={field.required}
    />
  )
}

function ItemFormDialog({
  open,
  title,
  fields,
  initial,
  onSave,
  onOpenChange,
}: {
  open: boolean
  title: string
  fields: FieldConfig[]
  initial: Record<string, unknown>
  onSave: (values: Record<string, unknown>) => Promise<void>
  onOpenChange: (open: boolean) => void
}) {
  const [values, setValues] = useState(initial)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setValues(initial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={async (event) => {
            event.preventDefault()
            setSaving(true)
            try {
              await onSave(values)
            } finally {
              setSaving(false)
            }
          }}
          className="space-y-4"
        >
          {fields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label>{field.label}</Label>
              <FieldInput
                field={field}
                value={values[field.key]}
                onChange={(value) => setValues((current) => ({ ...current, [field.key]: value }))}
              />
            </div>
          ))}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function ResourceManager<T extends { id: string; position: number }>({
  description,
  resourcePath,
  fields,
  emptyItem,
  renderLabel,
}: ResourceManagerProps<T>) {
  const [items, setItems] = useState<T[] | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const refetch = () => {
    api
      .get<T[]>(resourcePath)
      .then(setItems)
      .catch((err: unknown) => toast.error(err instanceof ApiError ? err.message : 'Failed to load'))
  }

  useEffect(refetch, [resourcePath])

  const handleCreate = async (values: Record<string, unknown>) => {
    await api.post(resourcePath, values)
    setCreating(false)
    toast.success('Added')
    refetch()
  }

  const handleUpdate = async (id: string, values: Record<string, unknown>) => {
    await api.patch(`${resourcePath}/${id}`, values)
    setEditingId(null)
    toast.success('Saved')
    refetch()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return
    await api.delete(`${resourcePath}/${id}`)
    toast.success('Deleted')
    refetch()
  }

  const move = async (index: number, direction: -1 | 1) => {
    if (!items) return
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= items.length) return
    const a = items[index]
    const b = items[targetIndex]
    await Promise.all([
      api.patch(`${resourcePath}/${a.id}`, { position: b.position }),
      api.patch(`${resourcePath}/${b.id}`, { position: a.position }),
    ])
    refetch()
  }

  const editingItem = items?.find((item) => item.id === editingId)
  const imageField = fields.find((field) => field.type === 'image')

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : <span />}
        <Button type="button" onClick={() => setCreating(true)} className="shrink-0">
          + Add New
        </Button>
      </div>

      <ItemFormDialog
        open={creating}
        title="Add New"
        fields={fields}
        initial={emptyItem}
        onSave={handleCreate}
        onOpenChange={setCreating}
      />
      {editingItem ? (
        <ItemFormDialog
          open={Boolean(editingId)}
          title="Edit"
          fields={fields}
          initial={editingItem as unknown as Record<string, unknown>}
          onSave={(values) => handleUpdate(editingItem.id, values)}
          onOpenChange={(open) => !open && setEditingId(null)}
        />
      ) : null}

      {items === null ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing here yet.</p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Order</TableHead>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => {
                const imageUrl = imageField ? (item as Record<string, unknown>)[imageField.key] : null
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          onClick={() => move(index, -1)}
                          disabled={index === 0}
                          aria-label="Move up"
                        >
                          ↑
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          onClick={() => move(index, 1)}
                          disabled={index === items.length - 1}
                          aria-label="Move down"
                        >
                          ↓
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {imageUrl ? (
                          <img src={imageUrl as string} alt="" className="h-10 w-10 rounded-md object-cover" />
                        ) : null}
                        <span className="truncate">{renderLabel(item)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setEditingId(item.id)}>
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
