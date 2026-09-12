import { ResourceManager } from '../components/ResourceManager'
import type { Faq } from '../../types/content'

export function FaqsPage() {
  return (
    <ResourceManager<Faq>
      description="The question and answer list on the homepage."
      resourcePath="/faqs"
      fields={[
        { key: 'question', label: 'Question', type: 'text', required: true },
        { key: 'answer', label: 'Answer', type: 'textarea', required: true },
      ]}
      emptyItem={{ question: '', answer: '' }}
      renderLabel={(item) => item.question}
    />
  )
}
