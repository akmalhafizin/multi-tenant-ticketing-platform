import { useState, useRef } from 'react'

interface Props {
  images: File[]
  onChange: (files: File[]) => void
}

const MAX_IMAGES = 5
const ACCEPT = 'image/jpeg,image/png,image/gif,image/webp'

export default function ImageUploadZone({ images, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  function handleFiles(list: FileList) {
    const allowed = Array.from(list).filter((f) => f.type.startsWith('image/'))
    const merged = [...images, ...allowed].slice(0, MAX_IMAGES)
    onChange(merged)
    if (inputRef.current) inputRef.current.value = ''
  }

  function remove(i: number) {
    onChange(images.filter((_, idx) => idx !== i))
  }

  return (
    <div className="space-y-4">
      <label className="text-xs font-medium tracking-wide text-gray-600">ISSUE PHOTOS (MULTIPLE)</label>
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative group">
              <img src={URL.createObjectURL(img)} alt="" className="h-20 w-20 object-cover rounded-lg border border-gray-200" />
              <button type="button" onClick={() => remove(i)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
            </div>
          ))}
        </div>
      )}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-red-600 bg-red-50' : 'border-gray-300 hover:border-gray-400'
        }`}>
        <input ref={inputRef} type="file" accept={ACCEPT} multiple className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)} />
        <span className="material-symbols-outlined text-3xl text-gray-400">add_photo_alternate</span>
        <p className="text-sm text-gray-500 mt-2">Drop images here or click to browse</p>
        <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WebP — up to {MAX_IMAGES} images</p>
      </div>
    </div>
  )
}
