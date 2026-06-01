require("dotenv").config({ path: "../.env" });
const express = require('express');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const app = express(); 
connectDB(); 


app.use(helmet({crossOriginResourcePolicy: { policy: "cross-origin" }}));
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));   // handle large payloads
app.use(express.urlencoded({ extended: true }));

// Logger (only in dev)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Static Files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));


app.get("/", (req, res) => {
  res.status(200).json({ message: `Server is running on port ${PORT}` });
});


// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!", error: err.message });
});

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));