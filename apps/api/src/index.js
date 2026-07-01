const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config({ path: path.join(__dirname, "..", "..", "..", ".env") });

const authRoutes = require("./routes/auth");
const categoryRoutes = require("./routes/category");
const userRoutes = require("./routes/user");
const ticketRoutes = require("./routes/ticket");
const orgRoutes = require("./routes/org");
const inviteRoutes = require("./routes/invite");
const roleRoutes = require("./routes/role");
const { resolveTenant } = require("./middleware/tenant");

const app = express();

// ─── Security Headers ─────────────────────────────────────────
app.use(helmet());

// ─── CORS — locked to frontend origin ─────────────────────────
const ALLOWED_ORIGIN = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(cors({ origin: ALLOWED_ORIGIN, credentials: true }));

// ─── Body Parsing ─────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));

// ─── Rate Limiting ────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 60_000, // 1 minute
  max: 5,           // 5 attempts per minute
  message: { success: false, data: null, error: "Too many attempts. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth/login", authLimiter);

// ─── Tenant Resolution (subdomain-based) ───────────────────────
app.use(resolveTenant);

// ─── Serve uploaded files via S3/MinIO ────────────────────────
const s3 = require("./lib/s3");
app.get("/uploads/:key", async (req, res, next) => {
  try {
    const obj = await s3.getFile(req.params.key);
    if (!obj) return res.status(404).json({ success: false, data: null, error: "File not found" });

    res.setHeader("Content-Type", obj.ContentType || "application/octet-stream");
    res.setHeader("Content-Length", obj.ContentLength || 0);
    res.setHeader("X-Content-Type-Options", "nosniff");
    obj.Body.pipe(res);
  } catch (err) {
    next(err);
  }
});

// ─── Routes ──────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "API running 🚀" });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/org", orgRoutes);
app.use("/api/invites", inviteRoutes);
app.use("/api/roles", roleRoutes);

// ─── Error Handler ───────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    data: null,
    error: "Internal server error",
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`API running on port ${PORT}`);
  try { await s3.ensureBucket(); } catch {}
});
