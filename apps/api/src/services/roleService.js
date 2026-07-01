const prisma = require("../lib/prisma");

const DEFAULT_PERMISSIONS = {
  pages: {
    dashboard: true,
    tickets: true,
    categories: false,
    users: false,
    roles: false,
    settings: false,
    reports: false,
  },
  tickets: {
    view: true,
    create: true,
    assign: false,
    close: false,
    delete: false,
    reply: true,
  },
};

const SYSTEM_ROLES = {
  OWNER: {
    name: "Owner",
    description: "Full access to all features and settings",
    permissions: {
      pages: { dashboard: true, tickets: true, categories: true, users: true, roles: true, settings: true, reports: true },
      tickets: { view: true, create: true, assign: true, close: true, delete: true, reply: true },
    },
  },
  ADMIN: {
    name: "Admin",
    description: "Manage staff, categories, and tickets",
    permissions: {
      pages: { dashboard: true, tickets: true, categories: true, users: true, roles: false, settings: true, reports: true },
      tickets: { view: true, create: true, assign: true, close: true, delete: false, reply: true },
    },
  },
  AGENT: {
    name: "Agent",
    description: "View and work on tickets",
    permissions: {
      pages: { dashboard: true, tickets: true, categories: false, users: false, roles: false, settings: false, reports: false },
      tickets: { view: true, create: true, assign: false, close: false, delete: false, reply: true },
    },
  },
};

/**
 * Seed default roles for an organization.
 */
async function seedDefaults(organizationId) {
  const created = [];
  for (const [key, config] of Object.entries(SYSTEM_ROLES)) {
    const role = await prisma.role.upsert({
      where: { organizationId_name: { organizationId, name: config.name } },
      update: { permissions: config.permissions },
      create: {
        organizationId,
        name: config.name,
        description: config.description,
        isSystem: true,
        permissions: config.permissions,
      },
    });
    created.push(role);
  }
  return created;
}

/**
 * List all roles in an organization.
 */
async function list(organizationId) {
  return prisma.role.findMany({
    where: { organizationId },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Get a single role.
 */
async function getById(id, organizationId) {
  const role = await prisma.role.findFirst({ where: { id, organizationId } });
  if (!role) {
    const err = new Error("Role not found");
    err.status = 404;
    throw err;
  }
  return role;
}

/**
 * Create a custom role.
 */
async function create({ name, description, permissions, organizationId }) {
  if (!name || !name.trim()) {
    const err = new Error("Role name is required");
    err.status = 400;
    throw err;
  }

  return prisma.role.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      permissions: mergePermissions(DEFAULT_PERMISSIONS, permissions),
      organizationId,
    },
  });
}

/**
 * Update a role.
 */
async function update(id, data, organizationId) {
  const role = await getById(id, organizationId);

  if (data.name !== undefined && !data.name.trim()) {
    const err = new Error("Role name is required");
    err.status = 400;
    throw err;
  }

  const updates = {};
  if (data.name !== undefined) updates.name = data.name.trim();
  if (data.description !== undefined) updates.description = data.description.trim() || null;
  if (data.permissions !== undefined) {
    updates.permissions = mergePermissions(role.permissions, data.permissions);
  }

  return prisma.role.update({ where: { id }, data: updates });
}

/**
 * Delete a custom role.
 */
async function remove(id, organizationId) {
  const role = await getById(id, organizationId);
  if (role.isSystem) {
    const err = new Error("System roles cannot be deleted");
    err.status = 400;
    throw err;
  }

  // Unlink users with this role
  await prisma.user.updateMany({
    where: { roleId: id },
    data: { roleId: null },
  });

  await prisma.role.delete({ where: { id } });
}

function mergePermissions(base, override) {
  if (!override) return base;
  return {
    pages: { ...base.pages, ...(override.pages || {}) },
    tickets: { ...base.tickets, ...(override.tickets || {}) },
  };
}

module.exports = { seedDefaults, list, getById, create, update, remove };
