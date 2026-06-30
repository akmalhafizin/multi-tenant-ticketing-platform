const { Router } = require("express");
const roleController = require("../controllers/roleController");
const { authenticate, requireRole } = require("../middleware/auth");

const router = Router();

router.get("/", authenticate, requireRole("OWNER"), roleController.list);
router.get("/:id", authenticate, requireRole("OWNER"), roleController.getById);
router.post("/", authenticate, requireRole("OWNER"), roleController.create);
router.put("/:id", authenticate, requireRole("OWNER"), roleController.update);
router.delete("/:id", authenticate, requireRole("OWNER"), roleController.remove);

module.exports = router;
