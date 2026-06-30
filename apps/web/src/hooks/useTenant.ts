/**
 * Extracts the organization slug from the browser's hostname.
 *
 * Dev:   rcl-engineering.lvh.me:5174  →  rcl-engineering
 * Prod:  rcl-engineering.yourapp.com  →  rcl-engineering
 * Local: localhost:5174               →  null
 */
export function extractSlugFromHost(): string | null {
  if (typeof window === 'undefined') return null
  const hostname = window.location.hostname

  // lvh.me / localhost / IP — no subdomain
  if (
    hostname === 'localhost' ||
    hostname === 'lvh.me' ||
    hostname === '127.0.0.1' ||
    /^\d+\.\d+\.\d+\.\d+$/.test(hostname)
  ) {
    return null
  }

  // Subdomain exists — e.g. "rcl-engineering.lvh.me"
  const parts = hostname.split('.')
  if (parts.length >= 2) {
    const slug = parts[0]
    // Skip generic prefixes
    if (!['www', 'app', 'admin'].includes(slug)) {
      return slug
    }
  }

  return null
}

/**
 * React hook that provides the current tenant slug from the subdomain.
 */
export function useTenant() {
  return { slug: extractSlugFromHost() }
}
