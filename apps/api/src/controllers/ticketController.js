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

module.exports = { createPublic };
