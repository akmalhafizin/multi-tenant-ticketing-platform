const prisma = require("../lib/prisma");

/**
 * List all categories for an organization.
 */
async function list(organizationId) {
  return prisma.category.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
  });
}

/**
 * Get a single category by id (scoped to org).
 */
async function getById(id, organizationId) {
  const category = await prisma.category.findFirst({
    where: { id, organizationId },
  });
  if (!category) {
    const err = new Error("Category not found");
    err.status = 404;
    throw err;
  }
  return category;
}

/**
 * Create a new category.
 */
async function create(name, organizationId) {
  // Check for duplicate name within org
  const existing = await prisma.category.findFirst({
    where: { organizationId, name },
  });
  if (existing) {
    const err = new Error("A category with this name already exists");
    err.status = 409;
    throw err;
  }

  return prisma.category.create({
    data: { name, organizationId },
  });
}

/**
 * Update a category name.
 */
async function update(id, name, organizationId) {
  await getById(id, organizationId);

  // Check for duplicate name (excluding self)
  const duplicate = await prisma.category.findFirst({
    where: { organizationId, name, id: { not: id } },
  });
  if (duplicate) {
    const err = new Error("A category with this name already exists");
    err.status = 409;
    throw err;
  }

  return prisma.category.update({
    where: { id },
    data: { name },
  });
}

/**
 * Delete a category.
 */
async function remove(id, organizationId) {
  await getById(id, organizationId);

  // Check if any tickets use this category
  const ticketCount = await prisma.ticket.count({
    where: { categoryId: id, organizationId },
  });
  if (ticketCount > 0) {
    const err = new Error(
      `Cannot delete — ${ticketCount} ticket(s) are using this category`
    );
    err.status = 409;
    throw err;
  }

  // Check if org uses it as default
  const org = await prisma.organization.findFirst({
    where: { id: organizationId, defaultCategoryId: id },
  });
  if (org) {
    const err = new Error(
      "Cannot delete — this category is set as the organization's default"
    );
    err.status = 409;
    throw err;
  }

  return prisma.category.delete({ where: { id } });
}

module.exports = { list, getById, create, update, remove };
