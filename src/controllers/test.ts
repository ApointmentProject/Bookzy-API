import { Request, Response } from "express";
import db from "../config/database";

// Función con el tipo correcto
export const getTestData = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const data = await db.oneOrNone("SELECT * FROM test LIMIT 1");
    if (!data) {
      res.status(404).json({ message: "No data found" });
      return;
    }
    res.json(data);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
