import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import  webhookRouter  from "./routes/webhook/index.js";

import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();
// ⚠️ Must be BEFORE express.json() and cors()

const app = express();
app.use("/api/webhooks", webhookRouter);
// index.ts / app.ts
app.use("/invoices", express.static(path.join(process.cwd(), "public/invoices")));


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
