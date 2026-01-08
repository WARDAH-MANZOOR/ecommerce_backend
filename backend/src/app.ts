import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();

// Global middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// API routes
app.use("/api", routes);

app.get("/", (_req, res) => {
  res.send("E-commerce backend running");
});

// Error handler
app.use(errorHandler);

export default app;
