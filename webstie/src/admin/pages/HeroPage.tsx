import { ResourceManager } from '../components/ResourceManager'
import type { HeroImage } from '../../types/content'

export function HeroPage() {
  return (
    <ResourceManager<HeroImage>
      description="Photos shown in the homepage carousel."
      resourcePath="/hero"
      fields={[
        { key: 'src', label: 'Image', type: 'image', required: true },
        { key: 'title', label: 'Title / alt text', type: 'text', required: true },
      ]}
      emptyItem={{ src: '', title: '' }}
      renderLabel={(item) => item.title}
    />
  )
}
