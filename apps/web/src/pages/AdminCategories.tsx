import { useState, useEffect } from 'react'
import { api } from '../lib/api'

interface Category {
  id: string
  name: string
  organizationId: string
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Add category state
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      const res = await api<Category[]>('/api/categories')
      setCategories(res.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    try {
      await api('/api/categories', {
        method: 'POST',
        body: JSON.stringify({ name: newName.trim() }),
      })
      setNewName('')
      setShowAdd(false)
      await fetchCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category')
    }
  }

  async function handleSaveEdit(id: string) {
    if (!editName.trim()) return
    try {
      await api(`/api/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: editName.trim() }),
      })
      setEditingId(null)
      setEditName('')
      await fetchCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category')
    }
  }

  async function handleDelete(id: string) {
    try {
      await api(`/api/categories/${id}`, { method: 'DELETE' })
      setDeleteId(null)
      await fetchCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category')
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-gray-500">
        Loading categories...
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-gray-900">
            Categories
          </h1>
          <p className="text-lg leading-relaxed text-gray-600 mt-2">
            Manage ticket categories for your organization.
          </p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setError('') }}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-red-700 transition-colors"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Add Category
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-3">
          <span className="material-symbols-outlined text-base mt-0.5">error</span>
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* Add Category Form */}
      {showAdd && (
        <div className="mb-6 bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">New Category</h3>
          <form onSubmit={handleAdd} className="flex items-center gap-4">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter category name"
              autoFocus
              className="flex-1 h-12 px-4 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none text-sm"
            />
            <button
              type="submit"
              disabled={!newName.trim()}
              className="px-6 py-2.5 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-red-700 transition-colors disabled:opacity-40"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => { setShowAdd(false); setNewName(''); setError('') }}
              className="px-6 py-2.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs">
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">#</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Category Name</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-400 text-sm">
                    No categories yet. Click "Add Category" to create one.
                  </td>
                </tr>
              ) : (
                categories.map((cat, i) => (
                  <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-400 font-mono">{i + 1}</td>
                    <td className="px-6 py-4">
                      {editingId === cat.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 h-10 px-3 border border-gray-300 rounded focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(cat.id)
                              if (e.key === 'Escape') { setEditingId(null); setEditName('') }
                            }}
                          />
                          <button
                            onClick={() => handleSaveEdit(cat.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                          >
                            <span className="material-symbols-outlined text-base">check</span>
                          </button>
                          <button
                            onClick={() => { setEditingId(null); setEditName('') }}
                            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded"
                          >
                            <span className="material-symbols-outlined text-base">close</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingId(cat.id)
                            setEditName(cat.name)
                            setError('')
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        {deleteId === cat.id ? (
                          <div className="flex items-center gap-1 ml-2">
                            <span className="text-xs text-gray-500 mr-1">Delete?</span>
                            <button
                              onClick={() => handleDelete(cat.id)}
                              className="px-2.5 py-1.5 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 transition-colors"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteId(null)}
                              className="px-2.5 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setDeleteId(cat.id); setError('') }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs font-medium text-gray-500">
            {categories.length} categor{categories.length === 1 ? 'y' : 'ies'} total
          </p>
        </div>
      </div>
    </div>
  )
}
