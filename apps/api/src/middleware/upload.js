const multer = require("multer");
const path = require("path");
const s3 = require("../lib/s3");

const ALLOWED_EXTS = /\.(jpg|jpeg|png|gif|webp|pdf|dwg|docx|doc|zip|rar|txt|csv|xlsx)$/i;
const MAX_SIZE = 25 * 1024 * 1024; // 25MB

// Use memory storage — files stay in buffer until uploaded to S3
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_EXTS.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error(`File type not supported: ${file.originalname}`));
    }
  },
  limits: { fileSize: MAX_SIZE },
});

/**
 * Middleware that runs after multer parses the files.
 * Uploads each file to S3 and replaces req.files entries with multer-compatible objects.
 */
async function uploadToS3(req, res, next) {
  if (!req.files || req.files.length === 0) return next();

  // Determine org — tenant (public) or authenticated user
  const orgId = req.tenant?.id || req.user?.organizationId;

  try {
    const uploaded = [];
    for (const file of req.files) {
      const result = await s3.upload({
        buffer: file.buffer,
        fileName: file.originalname,
        mimeType: file.mimetype,
        orgId,
      });

      uploaded.push({
        ...file,
        filename: result.key,          // S3 key — used for URL construction
        path: `/uploads/${result.key}`, // kept for consistency
        size: file.size,
      });
    }
    req.files = uploaded;
    next();
  } catch (err) {
    next(err);
  }
}

// Chain: multer parses → S3 uploads → controller receives populated req.files
module.exports = { upload, uploadToS3 };
