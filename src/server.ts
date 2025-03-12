// Imports
import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { notFound } from "./controllers/notFoundController";
import snippetRoutes from "./routes/snippetRoutes";

// __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Variables
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// static files config
app.use(express.static(path.join(__dirname, "../public")));

// EJS config
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Route for dashboard.ejs render
app.get("/", (req, res) => {
  res.render("dashboard");
});

// Routes
app.use("/api/snippets", snippetRoutes);
app.all("*", notFound);

// Database connection
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => {
    console.log("Database connection OK");

    // Server Listening
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}! 🚀`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
