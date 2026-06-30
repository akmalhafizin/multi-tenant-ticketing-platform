const { Router } = require("express");
const categoryController = require("../controllers/categoryController");
const { authenticate, requireRole } = require("../middleware/auth");

const router = Router();

router.get("/", authenticate, categoryController.list);
router.get("/:id", authenticate, categoryController.getById);
router.post("/", authenticate, requireRole("OWNER", "ADMIN"), categoryController.create);
router.put("/:id", authenticate, requireRole("OWNER", "ADMIN"), categoryController.update);
router.delete("/:id", authenticate, requireRole("OWNER", "ADMIN"), categoryController.remove);

module.exports = router;
