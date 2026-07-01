import { test, expect } from '@playwright/test'

const API = 'http://localhost:3001'
const ORG_SLUG = 'rcl-engineering'

let adminToken = ''
let agentToken = ''

test.describe('API — Auth', () => {
  test('POST /api/auth/login — admin success', async ({ request }) => {
    const res = await request.post(`${API}/api/auth/login`, {
      data: { email: 'admin@rclengineering.com', password: 'admin123' },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.token).toBeTruthy()
    adminToken = body.data.token
  })

  test('POST /api/auth/login — wrong password fails', async ({ request }) => {
    const res = await request.post(`${API}/api/auth/login`, {
      data: { email: 'admin@rclengineering.com', password: 'wrong' },
    })
    expect(res.status()).toBe(401)
    const body = await res.json()
    expect(body.success).toBe(false)
  })

  test('POST /api/auth/login — agent success', async ({ request }) => {
    const res = await request.post(`${API}/api/auth/login`, {
      data: { email: 'agent@rclengineering.com', password: 'agent123' },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.success).toBe(true)
    agentToken = body.data.token
  })

  test('GET /api/auth/me — returns current user', async ({ request }) => {
    const res = await request.get(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.data.email).toBe('admin@rclengineering.com')
  })

  test('GET /api/auth/me — no token fails', async ({ request }) => {
    const res = await request.get(`${API}/api/auth/me`)
    expect(res.status()).toBe(401)
  })
})

test.describe('API — Categories', () => {
  test('GET /api/categories — returns categories', async ({ request }) => {
    const res = await request.get(`${API}/api/categories`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(Array.isArray(body.data)).toBe(true)
  })

  test('POST /api/categories — create (owner)', async ({ request }) => {
    const res = await request.post(`${API}/api/categories`, {
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      data: { name: `TestCat_${Date.now()}` },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  test('POST /api/categories — agent cannot create', async ({ request }) => {
    const res = await request.post(`${API}/api/categories`, {
      headers: { Authorization: `Bearer ${agentToken}`, 'Content-Type': 'application/json' },
      data: { name: 'ShouldFail' },
    })
    expect(res.status()).toBe(403)
  })
})

test.describe('API — Tickets', () => {
  test('POST /api/tickets/public — guest creates ticket', async ({ request }) => {
    const res = await request.post(`${API}/api/tickets/public`, {
      headers: { 'X-Org-Slug': ORG_SLUG, 'Content-Type': 'application/json' },
      data: { title: 'API Test', guestName: 'Tester', guestEmail: 'test@api.com' },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.publicToken).toBeTruthy()
  })

  test('POST /api/tickets — staff creates ticket', async ({ request }) => {
    const res = await request.post(`${API}/api/tickets`, {
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      data: { title: 'Staff Created', priority: 'HIGH' },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.success).toBe(true)
  })

  test('GET /api/tickets — lists tickets', async ({ request }) => {
    const res = await request.get(`${API}/api/tickets`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.data.total).toBeGreaterThan(0)
    expect(body.data.tickets.length).toBeGreaterThan(0)
  })

  test('GET /api/tickets/track/:token — guest tracking', async ({ request }) => {
    // Create a ticket first
    const create = await request.post(`${API}/api/tickets/public`, {
      headers: { 'X-Org-Slug': ORG_SLUG, 'Content-Type': 'application/json' },
      data: { title: 'Track Test', guestEmail: 'track@test.com' },
    })
    const { publicToken } = (await create.json()).data

    const res = await request.get(`${API}/api/tickets/track/${publicToken}`)
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.data.status).toBe('OPEN')
  })

  test('PATCH /api/tickets/:id — update status', async ({ request }) => {
    // Get first ticket
    const list = await request.get(`${API}/api/tickets`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    const ticketId = (await list.json()).data.tickets[0].id

    const res = await request.patch(`${API}/api/tickets/${ticketId}`, {
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      data: { status: 'PENDING' },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.data.status).toBe('PENDING')
  })

  test('POST /api/tickets/:id/comments — add comment', async ({ request }) => {
    const list = await request.get(`${API}/api/tickets`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    const ticketId = (await list.json()).data.tickets[0].id

    const res = await request.post(`${API}/api/tickets/${ticketId}/comments`, {
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      data: { body: 'Integration test comment', notifyGuest: false },
    })
    expect(res.ok()).toBeTruthy()
  })

  test('POST /api/tickets/rate/:token — rate and close', async ({ request }) => {
    // Create + resolve a ticket
    const create = await request.post(`${API}/api/tickets/public`, {
      headers: { 'X-Org-Slug': ORG_SLUG, 'Content-Type': 'application/json' },
      data: { title: 'Rate Test', guestEmail: 'rate@test.com' },
    })
    const ticketId = (await create.json()).data.id
    const publicToken = (await create.json()).data.publicToken

    // Admin resolves it
    await request.patch(`${API}/api/tickets/${ticketId}`, {
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      data: { status: 'RESOLVED' },
    })

    // Guest rates
    const rate = await request.post(`${API}/api/tickets/rate/${publicToken}`, {
      data: { rating: 5 },
    })
    expect(rate.ok()).toBeTruthy()
    const body = await rate.json()
    expect(body.data.status).toBe('CLOSED')
    expect(body.data.rating).toBe(5)
  })
})

test.describe('API — Roles', () => {
  test('GET /api/roles — owner can list roles', async ({ request }) => {
    const res = await request.get(`${API}/api/roles`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.data.length).toBeGreaterThanOrEqual(3) // Owner, Admin, Agent
  })

  test('GET /api/roles — agent cannot list', async ({ request }) => {
    const res = await request.get(`${API}/api/roles`, {
      headers: { Authorization: `Bearer ${agentToken}` },
    })
    expect(res.status()).toBe(403)
  })
})

test.describe('API — Org', () => {
  test('GET /api/org — returns org settings', async ({ request }) => {
    const res = await request.get(`${API}/api/org`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.data.name).toBe('RCL Engineering')
    expect(body.data.slug).toBe('rcl-engineering')
  })
})

test.describe('API — Users', () => {
  test('GET /api/users — list staff', async ({ request }) => {
    const res = await request.get(`${API}/api/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(Array.isArray(body.data)).toBe(true)
  })

  test('GET /api/users — agent cannot list', async ({ request }) => {
    const res = await request.get(`${API}/api/users`, {
      headers: { Authorization: `Bearer ${agentToken}` },
    })
    expect(res.status()).toBe(403)
  })
})

test.describe('API — Invites', () => {
  test('POST /api/invites — owner can create', async ({ request }) => {
    const email = `invite_${Date.now()}@test.com`
    const res = await request.post(`${API}/api/invites`, {
      headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
      data: { email, role: 'AGENT' },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.success).toBe(true)
  })
})
