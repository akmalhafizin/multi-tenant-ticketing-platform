import { extractSlugFromHost } from '../hooks/useTenant'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data: T; error: string | null }> {
  const token = localStorage.getItem('auth_token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Inject org slug from subdomain for tenant resolution
  const slug = extractSlugFromHost()
  if (slug) {
    headers['X-Org-Slug'] = slug
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const json = await res.json()

  if (!res.ok) {
    throw new Error(json.error || 'Request failed')
  }

  return json
}

export default API_BASE
