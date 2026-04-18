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
  'https://zestbill-delta.vercel.app/',

  ,
  // Add any Vercel preview URLs here if needed
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, mobile apps, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.error(`CORS blocked for origin: ${origin}`);
      return callback(new Error('CORS not allowed'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ✅ Handle preflight requests for ALL routes
app.options('*', cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Register routes
console.log("Registering routes...");
try {
  const authRoutes = require("./routes/auth");
  app.use("/api/auth", authRoutes);
  console.log("✓ Auth routes registered");
} catch (error) {
  console.error("Error registering auth routes:", error);
  console.error(error.stack);
}

try {
  app.use("/api/products", require("./routes/products"));
  console.log("✓ Product routes registered");
} catch (error) {
  console.error("Error registering product routes:", error);
  console.error(error.stack);
}

try {
  app.use("/api/orders", require("./routes/orders"));
  console.log("✓ Order routes registered");
} catch (error) {
  console.error("Error registering order routes:", error);
  console.error(error.stack);
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.get("/", (req, res) => {
  res.json({
    message: "Backend server is running",
    endpoints: ["/api/auth/login", "/api/auth/register", "/api/health"]
  });
});

// Initialize database and start server
(async () => {
  try {
    await connectDB();
    console.log("Database initialized");
  } catch (error) {
    console.error("Database connection error:", error.message);
    console.warn("Server will start without database connection. Some features may not work.");
  }

  try {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`Test auth: http://localhost:${PORT}/api/auth/test`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  console.error(error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});