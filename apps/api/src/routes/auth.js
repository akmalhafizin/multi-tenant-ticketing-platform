const { Router } = require("express");
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

const router = Router();

router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.get("/me", authenticate, authController.me);

module.exports = router;
