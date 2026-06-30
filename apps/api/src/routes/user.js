const { Router } = require("express");
const userController = require("../controllers/userController");
const { authenticate, requireRole } = require("../middleware/auth");

const router = Router();

router.get("/", authenticate, requireRole("OWNER", "ADMIN"), userController.list);
router.patch("/:id/role", authenticate, requireRole("OWNER"), userController.updateRole);
router.delete("/:id", authenticate, requireRole("OWNER", "ADMIN"), userController.remove);

module.exports = router;
