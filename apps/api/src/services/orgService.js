const prisma = require("../lib/prisma");

/**
 * Get organization details by ID.
 */
async function getById(organizationId) {
  return prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      name: true,
      slug: true,
      welcomeMessage: true,
      defaultCategoryId: true,
      resolutionSlaHours: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * Update organization settings.
 * Only fields provided in `data` will be updated.
 */
async function update(organizationId, data) {
  const updates = {};

  if (data.name !== undefined) {
    if (!data.name.trim()) {
      const err = new Error("Organization name is required");
      err.status = 400;
      throw err;
    }
    updates.name = data.name.trim();
  }

  if (data.slug !== undefined) {
    if (!data.slug.trim()) {
      const err = new Error("Slug is required");
      err.status = 400;
      throw err;
    }
    // Check slug uniqueness (excluding self)
    const existing = await prisma.organization.findFirst({
      where: { slug: data.slug.trim(), id: { not: organizationId } },
    });
    if (existing) {
      const err = new Error("This slug is already taken by another organization");
      err.status = 409;
      throw err;
    }
    updates.slug = data.slug.trim();
  }

  if (data.resolutionSlaHours !== undefined) {
    updates.resolutionSlaHours = data.resolutionSlaHours ? parseInt(data.resolutionSlaHours) : null;
  }

  if (data.welcomeMessage !== undefined) {
    updates.welcomeMessage = data.welcomeMessage.trim() || null;
  }

  if (data.defaultCategoryId !== undefined) {
    // If setting a default category, verify it belongs to this org
    if (data.defaultCategoryId) {
      const cat = await prisma.category.findFirst({
        where: { id: data.defaultCategoryId, organizationId },
      });
      if (!cat) {
        const err = new Error("Category not found in this organization");
        err.status = 400;
        throw err;
      }
    }
    updates.defaultCategoryId = data.defaultCategoryId || null;
  }

  if (Object.keys(updates).length === 0) {
    const err = new Error("No valid fields to update");
    err.status = 400;
    throw err;
  }

  return prisma.organization.update({
    where: { id: organizationId },
    data: updates,
    select: {
      id: true,
      name: true,
      slug: true,
      welcomeMessage: true,
      defaultCategoryId: true,
      resolutionSlaHours: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

module.exports = { getById, update };
