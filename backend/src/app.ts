import express from "express";
import "dotenv/config";
import { errorHandler } from "./middlewares/errorHandler.js";
import profileRoutes from "./routes/profileRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import courseRouter from "./routes/courseRoutes.js";
import deptRoutes from "./routes/deptRoutes.js";
import libraryRoutes from "./routes/libraryRoutes.js";
import cors from "cors";
import universityRoutes from "./routes/universityRoutes.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "*" }));

// Routes
app.use("/profiles", profileRoutes);
app.use("/documents", documentRoutes);
app.use("/auth", authRoutes);
app.use("/courses", courseRouter);
app.use("/departments", deptRoutes);
app.use("/libraries", libraryRoutes);
app.use("/universities", universityRoutes);

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`App is listening on Port ${PORT}`);
});
