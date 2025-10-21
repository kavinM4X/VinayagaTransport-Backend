import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectToDatabase } from "./src/config/db.js";
import partyRoutes from "./src/routes/party.routes.js";
import authRoutes from "./src/routes/auth.routes.js";
import statsRoutes from "./src/routes/stats.routes.js";
import { errorHandler } from "./src/middleware/errorHandler.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "transport-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/parties", partyRoutes);
app.use("/api/stats", statsRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
  });
}).catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
