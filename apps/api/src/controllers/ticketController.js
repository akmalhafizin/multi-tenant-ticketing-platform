const ticketService = require("../services/ticketService");

/**
 * POST /api/tickets/public
 * Creates a ticket from the public submission form.
 * Organization is resolved from subdomain (req.tenant).
 */
async function createPublic(req, res, next) {
  try {
    // Must be accessed via a subdomain (tenant must be resolved)
    if (!req.tenant) {
      return res.status(400).json({
        success: false,
        data: null,
        error:
          "This endpoint must be accessed via an organization subdomain",
      });
    }

    const ticket = await ticketService.createPublic({
      ...req.body,
      organizationId: req.tenant.id,
      files: req.files || [],
    });

    return res.status(201).json({
      success: true,
      data: {
        id: ticket.id,
        publicToken: ticket.publicToken,
        title: ticket.title,
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category?.name || null,
        attachments: (ticket.attachments || []).length,
        createdAt: ticket.createdAt,
      },
      error: null,
    });
  } catch (err) {
    if (err.status === 400) {
      return res
        .status(400)
        .json({ success: false, data: null, error: err.message });
    }
    next(err);
  }
}

/**
 * POST /api/tickets
 * Creates a ticket from the staff/admin dashboard.
 */
async function create(req, res, next) {
  try {
    const ticket = await ticketService.createStaff({
      ...req.body,
      organizationId: req.user.organizationId,
      actorUserId: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      data: {
        id: ticket.id,
        title: ticket.title,
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category?.name || null,
        assignedAgent: ticket.assignedAgent,
        createdAt: ticket.createdAt,
      },
      error: null,
    });
  } catch (err) {
    if (err.status === 400) {
      return res
        .status(400)
        .json({ success: false, data: null, error: err.message });
    }
    next(err);
  }
}

/**
 * GET /api/tickets/track/:publicToken
 * Public — no auth. Returns ticket details + public comments.
 */
async function trackGet(req, res, next) {
  try {
    const ticket = await ticketService.getByPublicToken(req.params.publicToken);
    return res.json({ success: true, data: ticket, error: null });
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({ success: false, data: null, error: err.message });
    }
    next(err);
  }
}

/**
 * POST /api/tickets/track/:publicToken/reply
 * Public — no auth. Guest adds a reply to their ticket.
 */
async function trackReply(req, res, next) {
  try {
    const comment = await ticketService.replyByPublicToken(req.params.publicToken, req.body);
    return res.status(201).json({ success: true, data: comment, error: null });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ success: false, data: null, error: err.message });
  }
}

/**
 * GET /api/tickets
 * List tickets for the authenticated user's organization.
 */
async function list(req, res, next) {
  try {
    const { status, limit, offset } = req.query;
    const result = await ticketService.list(req.user.organizationId, {
      status,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    });
    return res.json({ success: true, data: result, error: null });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/tickets/:id
 * Get a single ticket by ID.
 */
async function getById(req, res, next) {
  try {
    const ticket = await ticketService.getById(req.params.id, req.user.organizationId);
    return res.json({ success: true, data: ticket, error: null });
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({ success: false, data: null, error: err.message });
    }
    next(err);
  }
}

/**
 * PATCH /api/tickets/:id
 * Update status, category, or assignment.
 */
async function update(req, res, next) {
  try {
    const ticket = await ticketService.update(req.params.id, req.body, req.user.organizationId);
    return res.json({ success: true, data: ticket, error: null });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ success: false, data: null, error: err.message });
  }
}

/**
 * POST /api/tickets/:id/comments
 * Add a comment to a ticket.
 */
async function addComment(req, res, next) {
  try {
    const result = await ticketService.addComment(req.params.id, {
      userId: req.user.userId,
      body: req.body.body,
      isInternal: req.body.isInternal || false,
      notifyGuest: req.body.notifyGuest || false,
    }, req.user.organizationId);
    return res.status(201).json({ success: true, data: result, error: null });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ success: false, data: null, error: err.message });
  }
}

module.exports = { createPublic, create, trackGet, trackReply, list, getById, update, addComment };
