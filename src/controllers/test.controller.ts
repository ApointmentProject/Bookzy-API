import { Request, Response } from "express";
import db from "../config/database";
import Test from "../models/test.model";
import { hashPassword, comparePassword } from "../utils/cypher";

export const getTestData = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const data: Test | null = await db.oneOrNone("SELECT * FROM test LIMIT 1");
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

export const testCypher = async (req: Request, res: Response) => {
  const password = "testPassword";
  // const hashedPassword = await hashPassword(password);
  // console.log(hashedPassword);
  // res.json(hashedPassword);
  const hash = "$2b$10$niGU3qmtZYlRTbbqCoJFGOOxhuf.4qmRnDtkS55JApfEoLxSKXB82";
  const comparison = await comparePassword(password, hash);
  console.log(comparison);
  res.json(comparison);
};
