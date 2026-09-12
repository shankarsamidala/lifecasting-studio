import fs from 'node:fs'
import path from 'node:path'

/**
 * StorageAdapter abstracts where uploaded files live. LocalDiskAdapter is used
 * today; swapping to Supabase Storage later means implementing this interface
 * against the Supabase SDK and changing one line in routes/uploads.ts — no
 * route or admin-UI code needs to change.
 */
export type StorageAdapter = {
  save(fileName: string, buffer: Buffer): Promise<string> // returns a public URL/path
  delete(publicUrl: string): Promise<void>
}

const UPLOADS_DIR = path.resolve(import.meta.dirname, '../uploads')

export class LocalDiskAdapter implements StorageAdapter {
  async save(fileName: string, buffer: Buffer): Promise<string> {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true })
    const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`
    fs.writeFileSync(path.join(UPLOADS_DIR, safeName), buffer)
    return `/uploads/${safeName}`
  }

  async delete(publicUrl: string): Promise<void> {
    if (!publicUrl.startsWith('/uploads/')) return
    const filePath = path.join(UPLOADS_DIR, publicUrl.replace('/uploads/', ''))
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  }
}

export const storage: StorageAdapter = new LocalDiskAdapter()
export { UPLOADS_DIR }
