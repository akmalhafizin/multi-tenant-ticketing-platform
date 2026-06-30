const { Router } = require("express");
const ticketController = require("../controllers/ticketController");
const { authenticate } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = Router();

// Public ticket creation — org resolved from subdomain (multipart with files)
router.post("/public", upload.array("files", 10), ticketController.createPublic);

// Authenticated ticket creation (staff dashboard)
router.post("/", authenticate, ticketController.create);
router.get("/", authenticate, ticketController.list);
router.get("/:id", authenticate, ticketController.getById);
router.patch("/:id", authenticate, ticketController.update);
router.post("/:id/comments", authenticate, ticketController.addComment);

// Guest tracking (public — no auth)
router.get("/track/:publicToken", ticketController.trackGet);
router.post("/track/:publicToken/reply", ticketController.trackReply);
router.post("/rate/:publicToken", ticketController.rate);

module.exports = router;
