import { useRef } from 'react'

interface Props {
  file: File | null
  onChange: (file: File | null) => void
}

const ACCEPT = '.pdf,.dwg,.docx,.doc,.zip,.rar,.jpg,.jpeg,.png,.gif,.webp,.txt,.csv,.xlsx'

function formatSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`
  return `${bytes} B`
}

export default function FileUploadZone({ file, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-4">
      <label className="text-xs font-medium tracking-wide text-gray-600">CONTRACT / SCHEMATIC FILE</label>
      {file ? (
        <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <span className="material-symbols-outlined text-gray-400">description</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
          </div>
          <button type="button" onClick={() => { onChange(null); if (inputRef.current) inputRef.current.value = '' }}
            className="text-sm text-red-600 hover:underline">Remove</button>
        </div>
      ) : (
        <div onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors">
          <input ref={inputRef} type="file" accept={ACCEPT} className="hidden"
            onChange={(e) => e.target.files && onChange(e.target.files[0])} />
          <span className="material-symbols-outlined text-3xl text-gray-400">upload_file</span>
          <p className="text-sm text-gray-500 mt-2">Click to upload file</p>
          <p className="text-xs text-gray-400 mt-1">PDF, DWG, DOCX, ZIP, RAR — up to 25MB</p>
        </div>
      )}
    </div>
  )
}
