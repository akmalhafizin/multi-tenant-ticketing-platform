const prisma = require("../lib/prisma");

/**
 * Create a ticket from the public submission form.
 * The organization is resolved from the subdomain (req.tenant).
 */
async function createPublic({
  title,
  description,
  guestName,
  guestEmail,
  guestPhone,
  categoryId,
  organizationId,
}) {
  if (!title || !title.trim()) {
    const err = new Error("Title is required");
    err.status = 400;
    throw err;
  }

  // If categoryId provided, verify it belongs to this org
  if (categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: categoryId, organizationId },
    });
    if (!category) {
      const err = new Error("Invalid category");
      err.status = 400;
      throw err;
    }
  }

  const ticket = await prisma.ticket.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      guestName: guestName?.trim() || null,
      guestEmail: guestEmail?.trim() || null,
      guestPhone: guestPhone?.trim() || null,
      categoryId: categoryId || null,
      organizationId,
      status: "OPEN",
      priority: "MEDIUM",
    },
    include: {
      category: { select: { name: true } },
    },
  });

  return ticket;
}

module.exports = { createPublic };
