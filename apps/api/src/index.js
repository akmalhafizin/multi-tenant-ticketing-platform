const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const categoryRoutes = require("./routes/category");

const app = express();

app.use(cors());
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "API running 🚀" });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);

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

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});