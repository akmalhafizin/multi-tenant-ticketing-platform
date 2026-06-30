const prisma = require("../lib/prisma");

/**
 * List tickets for an organization.
 */
async function list(organizationId, { status, limit = 50, offset = 0 } = {}) {
  const where = { organizationId };
  if (status) where.status = status;

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        category: { select: { name: true } },
        assignedAgent: { select: { id: true, name: true } },
      },
    }),
    prisma.ticket.count({ where }),
  ]);

  return { tickets, total };
}

/**
 * Get a single ticket by ID (admin detail view).
 */
async function getById(id, organizationId) {
  const ticket = await prisma.ticket.findFirst({
    where: { id, organizationId },
    include: {
      category: { select: { id: true, name: true } },
      assignedAgent: { select: { id: true, name: true, email: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, name: true } },
        },
      },
      attachments: {
        select: { id: true, fileName: true, fileType: true, fileSize: true, url: true },
      },
    },
  });

  if (!ticket) {
    const err = new Error("Ticket not found");
    err.status = 404;
    throw err;
  }

  return ticket;
}

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
  files = [],
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
  });

  // Create attachment records for uploaded files
  const attachments = [];
  for (const file of files) {
    const att = await prisma.attachment.create({
      data: {
        ticketId: ticket.id,
        url: `/uploads/${file.filename}`,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
      },
    });
    attachments.push(att);
  }

  return { ...ticket, attachments };
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

/**
 * Update a ticket's status, category, or assignment.
 */
async function update(id, data, organizationId) {
  const ticket = await prisma.ticket.findFirst({ where: { id, organizationId } });
  if (!ticket) {
    const err = new Error("Ticket not found");
    err.status = 404;
    throw err;
  }

  const updates = {};

  if (data.status !== undefined) {
    const valid = ["OPEN", "PENDING", "ON_HOLD", "RESOLVED", "CLOSED"];
    if (!valid.includes(data.status)) {
      const err = new Error("Invalid status");
      err.status = 400;
      throw err;
    }
    updates.status = data.status;
    if (data.status === "RESOLVED") updates.resolvedAt = new Date();
  }

  if (data.categoryId !== undefined) {
    if (data.categoryId) {
      const cat = await prisma.category.findFirst({ where: { id: data.categoryId, organizationId } });
      if (!cat) {
        const err = new Error("Category not found in this organization");
        err.status = 400;
        throw err;
      }
    }
    updates.categoryId = data.categoryId || null;
  }

  if (data.assignedAgentId !== undefined) {
    if (data.assignedAgentId) {
      const agent = await prisma.user.findFirst({ where: { id: data.assignedAgentId, organizationId } });
      if (!agent) {
        const err = new Error("User not found in this organization");
        err.status = 400;
        throw err;
      }
    }
    updates.assignedAgentId = data.assignedAgentId || null;
  }

  if (Object.keys(updates).length === 0) return ticket;

  return prisma.ticket.update({
    where: { id },
    data: updates,
    include: {
      category: { select: { id: true, name: true } },
      assignedAgent: { select: { id: true, name: true, email: true } },
    },
  });
}

/**
 * Add a comment to a ticket.
 * If notifyGuest is true, logs the tracking link that would be emailed.
 */
async function addComment(ticketId, { userId, body, isInternal, notifyGuest }, organizationId) {
  const ticket = await prisma.ticket.findFirst({ where: { id: ticketId, organizationId } });
  if (!ticket) {
    const err = new Error("Ticket not found");
    err.status = 404;
    throw err;
  }

  if (!body || !body.trim()) {
    const err = new Error("Comment body is required");
    err.status = 400;
    throw err;
  }

  // Build status change entries as comments
  const comment = await prisma.comment.create({
    data: {
      ticketId,
      authorType: "AGENT",
      userId,
      body: body.trim(),
      isInternal: isInternal || false,
    },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  // If notifyGuest and ticket has guestEmail, log the notification
  let notification = null;
  if (notifyGuest && ticket.guestEmail) {
    const trackingLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/track/${ticket.publicToken}`;
    console.log(`[EMAIL] To: ${ticket.guestEmail} — New reply on ticket #${ticket.id}`);
    console.log(`[EMAIL] Tracking link: ${trackingLink}`);
    notification = {
      to: ticket.guestEmail,
      trackingLink,
      message: `New update on your ticket. View progress at: ${trackingLink}`,
    };
  }

  // Auto-set ticket to PENDING when agent replies (if it was ON_HOLD)
  if (ticket.status === "ON_HOLD") {
    await prisma.ticket.update({ where: { id: ticketId }, data: { status: "PENDING" } });
  }

  return { comment, notification };
}

module.exports = { createPublic, createStaff, getByPublicToken, replyByPublicToken, list, getById, update, addComment };
