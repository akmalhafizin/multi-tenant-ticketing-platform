const { Router } = require("express");
const ticketController = require("../controllers/ticketController");

const router = Router();

// Public ticket creation — org resolved from subdomain
router.post("/public", ticketController.createPublic);

module.exports = router;
