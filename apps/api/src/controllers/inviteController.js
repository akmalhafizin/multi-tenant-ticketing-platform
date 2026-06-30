const inviteService = require("../services/inviteService");

/**
 * POST /api/invites
 */
async function create(req, res, next) {
  try {
    const { email, role } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false, data: null, error: "Email is required",
      });
    }
    const invite = await inviteService.create({
      email,
      role: role || "AGENT",
      invitedByUserId: req.user.userId,
      organizationId: req.user.organizationId,
    });
    return res.status(201).json({
      success: true,
      data: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        status: invite.status,
        token: invite.token,
        expiresAt: invite.expiresAt,
        organizationName: invite.organization.name,
        inviteLink: `${process.env.FRONTEND_URL || "http://localhost:5176"}/invite/${invite.token}`,
      },
      error: null,
    });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ success: false, data: null, error: err.message });
  }
}

/**
 * GET /api/invites
 */
async function list(req, res, next) {
  try {
    const invites = await inviteService.list(req.user.organizationId);
    return res.json({ success: true, data: invites, error: null });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/invites/:id/revoke
 */
async function revoke(req, res, next) {
  try {
    await inviteService.revoke(req.params.id, req.user.organizationId);
    return res.json({ success: true, data: null, error: null });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ success: false, data: null, error: err.message });
  }
}

/**
 * GET /api/invites/:token — public, no auth
 */
async function getByToken(req, res, next) {
  try {
    const result = await inviteService.getByToken(req.params.token);
    return res.json({ success: true, data: result, error: null });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ success: false, data: null, error: err.message });
  }
}

/**
 * POST /api/invites/:token/accept — public, no auth
 */
async function accept(req, res, next) {
  try {
    const { name, password } = req.body;
    if (!name || !password) {
      return res.status(400).json({
        success: false, data: null, error: "Name and password are required",
      });
    }
    const result = await inviteService.accept(req.params.token, { name, password });
    return res.json({ success: true, data: result, error: null });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ success: false, data: null, error: err.message });
  }
}

module.exports = { create, list, revoke, getByToken, accept };
