import express from "express";
import "dotenv/config";
import userRoutes from "./routes/userRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();

app.use("/users", userRoutes);
app.use("/documents", documentRoutes);
app.use("/chats", chatRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`App is listening on Port ${PORT}`);
});
