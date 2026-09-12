import { ResourceManager } from '../components/ResourceManager'
import type { GalleryImage } from '../../types/content'

export function GalleryPage() {
  return (
    <ResourceManager<GalleryImage>
      description="Photos used across category tiles and cards."
      resourcePath="/gallery"
      fields={[
        { key: 'src', label: 'Image', type: 'image', required: true },
        { key: 'title', label: 'Title', type: 'text', required: true },
        { key: 'category', label: 'Category tag (optional)', type: 'text' },
      ]}
      emptyItem={{ src: '', title: '', category: '' }}
      renderLabel={(item) => item.title}
    />
  )
}
