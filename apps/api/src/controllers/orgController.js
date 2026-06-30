const orgService = require("../services/orgService");

/**
 * GET /api/org
 */
async function get(req, res, next) {
  try {
    const org = await orgService.getById(req.user.organizationId);
    if (!org) {
      return res
        .status(404)
        .json({ success: false, data: null, error: "Organization not found" });
    }
    return res.json({ success: true, data: org, error: null });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/org
 */
async function update(req, res, next) {
  try {
    const org = await orgService.update(req.user.organizationId, req.body);
    return res.json({ success: true, data: org, error: null });
  } catch (err) {
    const status = err.status || 500;
    return res
      .status(status)
      .json({ success: false, data: null, error: err.message });
  }
}

module.exports = { get, update };
