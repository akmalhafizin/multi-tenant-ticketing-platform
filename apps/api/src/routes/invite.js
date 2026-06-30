const { Router } = require("express");
const inviteController = require("../controllers/inviteController");
const { authenticate, requireRole } = require("../middleware/auth");

const router = Router();

// Admin endpoints (authenticated)
router.post("/", authenticate, requireRole("OWNER", "ADMIN"), inviteController.create);
router.get("/", authenticate, requireRole("OWNER", "ADMIN"), inviteController.list);
router.patch("/:id/revoke", authenticate, requireRole("OWNER", "ADMIN"), inviteController.revoke);

// Public endpoints (no auth)
router.get("/:token", inviteController.getByToken);
router.post("/:token/accept", inviteController.accept);

module.exports = router;
