const userService = require("../services/userService");

/**
 * GET /api/users
 */
async function list(req, res, next) {
  try {
    const users = await userService.list(req.user.organizationId);
    return res.json({ success: true, data: users, error: null });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/users/:id/role
 */
async function updateRole(req, res, next) {
  try {
    const { role } = req.body;
    const validRoles = ["OWNER", "ADMIN", "AGENT"];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        data: null,
        error: `Role must be one of: ${validRoles.join(", ")}`,
      });
    }

    const user = await userService.updateRole(
      req.params.id,
      role,
      req.user.userId,
      req.user.organizationId
    );
    return res.json({ success: true, data: user, error: null });
  } catch (err) {
    const status = err.status || 500;
    return res
      .status(status)
      .json({ success: false, data: null, error: err.message });
  }
}

/**
 * DELETE /api/users/:id
 */
async function remove(req, res, next) {
  try {
    await userService.remove(
      req.params.id,
      req.user.userId,
      req.user.role,
      req.user.organizationId
    );
    return res.json({ success: true, data: null, error: null });
  } catch (err) {
    const status = err.status || 500;
    return res
      .status(status)
      .json({ success: false, data: null, error: err.message });
  }
}

module.exports = { list, updateRole, remove };
