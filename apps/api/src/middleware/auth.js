const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

/**
 * Middleware that verifies the Bearer token and attaches
 * decoded user payload to req.user.
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      data: null,
      error: "Authentication required",
    });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      data: null,
      error: "Invalid or expired token",
    });
  }
}

/**
 * Middleware that restricts access to specific roles.
 * Must be used after `authenticate`.
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        data: null,
        error: "Insufficient permissions",
      });
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
