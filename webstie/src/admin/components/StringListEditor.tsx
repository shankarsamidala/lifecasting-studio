type StringListEditorProps = {
  label: string
  values: string[]
  onChange: (values: string[]) => void
}

export function StringListEditor({ label, values, onChange }: StringListEditorProps) {
  return (
    <div>
      <span className="mb-1 block font-sans text-sm font-medium text-text">{label}</span>
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={value}
              onChange={(event) => onChange(values.map((v, i) => (i === index ? event.target.value : v)))}
              className="flex-1 rounded-lg border border-ink-900/15 px-3 py-2 font-sans text-sm outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => onChange(values.filter((_, i) => i !== index))}
              className="rounded-lg border border-red-200 px-3 py-1 font-sans text-sm text-red-600"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...values, ''])}
        className="mt-2 rounded-lg border border-ink-900/15 px-3 py-1.5 font-sans text-sm text-text"
      >
        Add line
      </button>
    </div>
  )
}
