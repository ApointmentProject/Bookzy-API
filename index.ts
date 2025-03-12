import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import testRoutes from "./src/routes/test.routes";

dotenv.config();

const app: Application = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the Bookzy API");
});

app.use("/api/test", testRoutes);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
