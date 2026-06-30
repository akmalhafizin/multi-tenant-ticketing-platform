const prisma = require("../lib/prisma");

/**
 * Get a ticket by public token (guest tracking).
 */
async function getByPublicToken(publicToken) {
  const ticket = await prisma.ticket.findUnique({
    where: { publicToken },
    include: {
      category: { select: { name: true } },
      assignedAgent: { select: { name: true } },
      comments: {
        where: { isInternal: false },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          authorType: true,
          guestName: true,
          body: true,
          createdAt: true,
        },
      },
    },
  });

  if (!ticket) {
    const err = new Error("Ticket not found");
    err.status = 404;
    throw err;
  }

  return {
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    status: ticket.status,
    priority: ticket.priority,
    category: ticket.category?.name || null,
    assignedTo: ticket.assignedAgent?.name || null,
    guestName: ticket.guestName,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    comments: ticket.comments,
  };
}

/**
 * Add a guest reply to a ticket by public token.
 */
async function replyByPublicToken(publicToken, { guestName, body }) {
  const ticket = await prisma.ticket.findUnique({
    where: { publicToken },
  });

  if (!ticket) {
    const err = new Error("Ticket not found");
    err.status = 404;
    throw err;
  }

  if (!body || !body.trim()) {
    const err = new Error("Reply body is required");
    err.status = 400;
    throw err;
  }

  // If ticket is resolved or closed, prevent replies
  if (ticket.status === "RESOLVED" || ticket.status === "CLOSED") {
    const err = new Error("This ticket is closed and no longer accepts replies");
    err.status = 400;
    throw err;
  }

  const comment = await prisma.comment.create({
    data: {
      ticketId: ticket.id,
      authorType: "GUEST",
      guestName: guestName?.trim() || ticket.guestName || "Guest",
      body: body.trim(),
      isInternal: false,
    },
  });

  // Auto set ticket back to PENDING when guest replies
  if (ticket.status === "ON_HOLD") {
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: "PENDING" },
    });
  }

  return {
    id: comment.id,
    body: comment.body,
    guestName: comment.guestName,
    createdAt: comment.createdAt,
  };
}

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

module.exports = { createPublic, createStaff, getByPublicToken, replyByPublicToken };
