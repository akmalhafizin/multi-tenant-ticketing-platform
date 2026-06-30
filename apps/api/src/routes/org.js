const { Router } = require("express");
const orgController = require("../controllers/orgController");
const { authenticate, requireRole } = require("../middleware/auth");

const router = Router();

router.get("/", authenticate, orgController.get);
router.patch("/", authenticate, requireRole("OWNER", "ADMIN"), orgController.update);

module.exports = router;
