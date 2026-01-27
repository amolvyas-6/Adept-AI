import express from "express";
import "dotenv/config";
import profileRoutes from "./routes/profileRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/profiles", profileRoutes);
app.use("/documents", documentRoutes);
app.use("/auth", authRoutes);

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`App is listening on Port ${PORT}`);
});
