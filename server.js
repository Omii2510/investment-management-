
require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const connectDB = require("./config/db");

// Import middleware
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// Import routes
const authRoutes = require("./routes/authRoutes");
const investmentRoutes = require("./routes/investmentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const referralRoutes = require("./routes/referralRoutes");

const app = express();

// Security middleware
app.disable("x-powered-by");
app.use(helmet());

// Request middleware
app.use(express.json({ limit: "10kb" }));

// Home route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Investment Management API is running!"
  });
});

// Authentication APIs
app.use("/api/auth", authRoutes);

// Investment APIs
app.use("/api/investments", investmentRoutes);

// Dashboard APIs
app.use("/api/dashboard", dashboardRoutes);

// Referral APIs
app.use("/api/referrals", referralRoutes);

// Handle undefined routes
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);

// Server configuration
const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log("MongoDB connection established.");
      console.log(`Server running on port ${PORT}`);
      console.log("Security middleware enabled.");
    });

  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
