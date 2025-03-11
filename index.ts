import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import testRoutes from "./src/routes/test";

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Ruta principal
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Express & TypeScript Server");
});

// Usar rutas
app.use("/api/test", testRoutes);

// Iniciar servidor
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
