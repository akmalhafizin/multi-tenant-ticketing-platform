const { Router } = require("express");
const orgController = require("../controllers/orgController");
const { authenticate, requireRole } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = Router();

router.get("/", authenticate, orgController.get);
router.patch("/", authenticate, requireRole("OWNER", "ADMIN"), orgController.update);
router.post(
  "/assets",
  authenticate,
  requireRole("OWNER", "ADMIN"),
  upload.upload.single("file"),
  orgController.uploadAsset
);

module.exports = router;
