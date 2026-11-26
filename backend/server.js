
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/database");

const authRoutes = require("./routes/AuthRoutes");
const userRoutes = require("./routes/UserRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FoodExpress API is running!"
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "foodexpress-api" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Start server after database connection
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`FoodExpress API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
