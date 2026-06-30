const { Router } = require("express");
const ticketController = require("../controllers/ticketController");
const { authenticate } = require("../middleware/auth");

const router = Router();

// Public ticket creation — org resolved from subdomain
router.post("/public", ticketController.createPublic);

// Authenticated ticket creation (staff dashboard)
router.post("/", authenticate, ticketController.create);

module.exports = router;
