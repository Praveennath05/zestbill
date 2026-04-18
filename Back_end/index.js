require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./db");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS - must be first, before any routes
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://zestbill-delta.vercel.app',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || /^https:\/\/.*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    console.error(`CORS blocked for origin: ${origin}`);
    return callback(new Error('CORS not allowed'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

console.log("Registering routes...");
try {
  app.use("/api/auth", require("./routes/auth"));
  console.log("✓ Auth routes registered");
} catch (error) {
  console.error("Error registering auth routes:", error.stack);
}
try {
  app.use("/api/products", require("./routes/products"));
  console.log("✓ Product routes registered");
} catch (error) {
  console.error("Error registering product routes:", error.stack);
}
try {
  app.use("/api/orders", require("./routes/orders"));
  console.log("✓ Order routes registered");
} catch (error) {
  console.error("Error registering order routes:", error.stack);
}

app.get("/api/health", (req, res) => res.json({ status: "ok", message: "Server is running" }));
app.get("/", (req, res) => res.json({ message: "Backend server is running" }));

(async () => {
  try {
    await connectDB();
    console.log("Database initialized");
  } catch (error) {
    console.error("Database connection error:", error.message);
  }
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();

process.on('uncaughtException', (error) => console.error('Uncaught Exception:', error));
process.on('unhandledRejection', (reason) => console.error('Unhandled Rejection:', reason));