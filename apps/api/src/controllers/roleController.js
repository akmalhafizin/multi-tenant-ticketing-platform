const roleService = require("../services/roleService");

async function list(req, res, next) {
  try {
    const roles = await roleService.list(req.user.organizationId);
    return res.json({ success: true, data: roles, error: null });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const role = await roleService.getById(req.params.id, req.user.organizationId);
    return res.json({ success: true, data: role, error: null });
  } catch (err) {
    if (err.status === 404) return res.status(404).json({ success: false, data: null, error: err.message });
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, description, permissions } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, data: null, error: "Role name is required" });
    }
    const role = await roleService.create({ organizationId: req.user.organizationId, name: name.trim(), description, permissions });
    return res.status(201).json({ success: true, data: role, error: null });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ success: false, data: null, error: err.message });
  }
}

async function update(req, res, next) {
  try {
    const { name, description, permissions } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description;
    if (permissions !== undefined) updates.permissions = permissions;
    // Prevent overriding system-protected fields via mass assignment
    updates.isSystem = undefined;
    const role = await roleService.update(req.params.id, req.user.organizationId, updates);
    return res.json({ success: true, data: role, error: null });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ success: false, data: null, error: err.message });
  }
}

async function remove(req, res, next) {
  try {
    await roleService.remove(req.params.id, req.user.organizationId);
    return res.json({ success: true, data: null, error: null });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ success: false, data: null, error: err.message });
  }
}

module.exports = { list, getById, create, update, remove };
