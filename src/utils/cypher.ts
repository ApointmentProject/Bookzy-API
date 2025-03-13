import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const SECRET_KEY = Buffer.from(process.env.SECRET_KEY || "", "hex");
const IV = Buffer.from(process.env.IV || "", "hex");
const ALGORITHM = "aes-256-cbc";

// Passwords (Hash and Salt algorithms) ------------------------------------------------------
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(password, salt);
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Regular data encryptation ------------------------------------------------------
export function encryptData(data: string): string {
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, IV);

  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");

  return encrypted;
}

export function decryptData(encryptedData: string): string {
  if (!encryptedData) {
    throw new Error("Invalid encrypted string format");
  }

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    SECRET_KEY,
    IV,
  );

  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
