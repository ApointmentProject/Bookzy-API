import bcrypt from "bcryptjs";
import crypto from "crypto";
import EncryptedData from "../intefaces/EncryptedData";

const SECRET_KEY = Buffer.from(process.env.SECRET_KEY || "", "hex");
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

// Passwords (Hash and Salt algorithms) ------------------------------------------------------
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Regular data encryptation ------------------------------------------------------
export function encryptData<T>(data: T): EncryptedData {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);

  const jsonData = JSON.stringify(data);
  let encrypted = cipher.update(jsonData, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return { encryptedData: encrypted, iv: iv.toString("hex"), authTag };
}

export function decryptData<T>(encrypted: EncryptedData): T {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    SECRET_KEY,
    Buffer.from(encrypted.iv, "hex"),
  );
  decipher.setAuthTag(Buffer.from(encrypted.authTag, "hex"));

  let decrypted = decipher.update(encrypted.encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return JSON.parse(decrypted) as T;
}
