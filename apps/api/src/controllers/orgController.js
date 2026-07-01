const orgService = require("../services/orgService");
const s3 = require("../lib/s3");

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

/**
 * POST /api/org/assets
 * Upload a branding asset (logo or banner).
 * Body: multipart with "file" field + "assetType" field ("logo" | "banner")
 */
async function uploadAsset(req, res, next) {
  try {
    const { assetType } = req.body;
    if (!assetType || !["logo", "banner"].includes(assetType)) {
      return res.status(400).json({ success: false, data: null, error: "assetType must be 'logo' or 'banner'" });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, data: null, error: "No file provided" });
    }

    const orgId = req.user.organizationId;
    const prefix = `org_${orgId}/branding`;
    const ext = req.file.originalname.includes(".")
      ? req.file.originalname.substring(req.file.originalname.lastIndexOf("."))
      : "";
    const key = `${prefix}/${assetType}${ext}`;

    await s3.uploadRaw({ bucket: process.env.S3_BUCKET || "ticketing", key, buffer: req.file.buffer, mimeType: req.file.mimetype });

    const url = `/uploads/${key}`;
    const updateData = assetType === "logo" ? { logoUrl: url } : { bannerUrl: url };
    const org = await orgService.update(orgId, updateData);

    return res.json({ success: true, data: { url, org }, error: null });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ success: false, data: null, error: err.message });
  }
}

module.exports = { get, update, uploadAsset };
