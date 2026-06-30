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

/**
 * Create a ticket from the staff/admin dashboard.
 * The organizationId comes from the authenticated user's JWT.
 */
async function createStaff({
  title,
  description,
  priority,
  status,
  categoryId,
  assignedAgentId,
  guestName,
  guestEmail,
  guestPhone,
  organizationId,
  actorUserId,
}) {
  if (!title || !title.trim()) {
    const err = new Error("Title is required");
    err.status = 400;
    throw err;
  }

  // Verify category belongs to this org
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

  // Verify assigned agent belongs to this org
  if (assignedAgentId) {
    const agent = await prisma.user.findFirst({
      where: { id: assignedAgentId, organizationId },
    });
    if (!agent) {
      const err = new Error("Invalid assigned agent");
      err.status = 400;
      throw err;
    }
  }

  // Validate enum values
  const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
  const finalPriority = validPriorities.includes(priority) ? priority : "MEDIUM";

  const validStatuses = ["OPEN", "PENDING", "ON_HOLD", "RESOLVED", "CLOSED"];
  const finalStatus = validStatuses.includes(status) ? status : "OPEN";

  const ticket = await prisma.ticket.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      priority: finalPriority,
      status: finalStatus,
      categoryId: categoryId || null,
      assignedAgentId: assignedAgentId || null,
      guestName: guestName?.trim() || null,
      guestEmail: guestEmail?.trim() || null,
      guestPhone: guestPhone?.trim() || null,
      organizationId,
    },
    include: {
      category: { select: { name: true } },
      assignedAgent: { select: { id: true, name: true, email: true } },
    },
  });

  // If the ticket was created with a non-OPEN status or assigned, log an initial comment
  if (assignedAgentId || finalStatus !== "OPEN") {
    const commentParts = [];
    if (assignedAgentId) commentParts.push(`Assigned to agent`);
    if (finalStatus !== "OPEN") commentParts.push(`Status set to ${finalStatus}`);

    await prisma.comment.create({
      data: {
        ticketId: ticket.id,
        authorType: "AGENT",
        userId: actorUserId,
        body: `Ticket created by staff. ${commentParts.join(". ")}.`,
        isInternal: true,
      },
    });
  }

  return ticket;
}

module.exports = { createPublic, createStaff };
