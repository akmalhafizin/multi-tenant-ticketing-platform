const categoryService = require("../services/categoryService");

/**
 * GET /api/categories
 */
async function list(req, res, next) {
  try {
    const categories = await categoryService.list(req.user.organizationId);
    return res.json({ success: true, data: categories, error: null });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/categories/:id
 */
async function getById(req, res, next) {
  try {
    const category = await categoryService.getById(
      req.params.id,
      req.user.organizationId
    );
    return res.json({ success: true, data: category, error: null });
  } catch (err) {
    if (err.status === 404) {
      return res
        .status(404)
        .json({ success: false, data: null, error: err.message });
    }
    next(err);
  }
}

/**
 * POST /api/categories
 */
async function create(req, res, next) {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ success: false, data: null, error: "Category name is required" });
    }
    const category = await categoryService.create(
      name.trim(),
      req.user.organizationId
    );
    return res.status(201).json({ success: true, data: category, error: null });
  } catch (err) {
    if (err.status === 409) {
      return res
        .status(409)
        .json({ success: false, data: null, error: err.message });
    }
    next(err);
  }
}

/**
 * PUT /api/categories/:id
 */
async function update(req, res, next) {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ success: false, data: null, error: "Category name is required" });
    }
    const category = await categoryService.update(
      req.params.id,
      name.trim(),
      req.user.organizationId
    );
    return res.json({ success: true, data: category, error: null });
  } catch (err) {
    if (err.status === 404 || err.status === 409) {
      return res
        .status(err.status)
        .json({ success: false, data: null, error: err.message });
    }
    next(err);
  }
}

/**
 * DELETE /api/categories/:id
 */
async function remove(req, res, next) {
  try {
    await categoryService.remove(req.params.id, req.user.organizationId);
    return res.json({ success: true, data: null, error: null });
  } catch (err) {
    if (err.status === 404 || err.status === 409) {
      return res
        .status(err.status)
        .json({ success: false, data: null, error: err.message });
    }
    next(err);
  }
}

module.exports = { list, getById, create, update, remove };
