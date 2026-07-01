const express = require("express");
const cors = require("cors");
const path = require("path");
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

app.use(cors());
app.use(express.json());

// ─── Tenant Resolution (subdomain-based) ───────────────────────
app.use(resolveTenant);

// ─── Serve uploaded files ─────────────────────────────────────
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join("C:", "uploads");
app.use("/uploads", express.static(UPLOAD_DIR));

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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on port ${PORT}`);
});