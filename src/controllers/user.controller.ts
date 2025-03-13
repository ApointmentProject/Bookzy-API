import { Request, Response } from "express";
import db from "../config/database";
import User from "../models/user.model";
import {encryptUser, decryptUser} from "../services/user.service";
import {encryptData, comparePassword} from "../utils/cypher";

export const createUser = async (
    req: Request, res: Response
): Promise<void> => {
    try {
        const user: User = req.body;
        if (!user.first_name || !user.last_name || !user.email || !user.phone_number ||
            !user.birthday || !user.id_number || !user.gender || !user.password_hash) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }

        const encryptedUser = await encryptUser(user);

        await db.none(
            "CALL create_user($1, $2, $3, $4, $5, $6, $7, $8)",
            [
                encryptedUser.first_name,
                encryptedUser.last_name,
                encryptedUser.email,
                encryptedUser.phone_number,
                encryptedUser.birthday,
                encryptedUser.id_number,
                encryptedUser.gender,
                encryptedUser.password_hash
            ]
        );

        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// This MUST be changed to getUserByEmail
export const getUserByEmail = async (
    req: Request,
    res: Response): Promise<void> => {
    try {
        const email = req.params.email;

        if (!email) {
            res.status(400).json({ error: "Invalid user email" });
            return;
        }

        // As the email in the db is encrypted, we need to encrypt the email to do the comparison
        const encryptedEmail = encryptData(email);

        const user: User | null = await db.oneOrNone("SELECT * FROM get_user_by_email($1)", [encryptedEmail]);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const decryptedUser: User = decryptUser(user);
        res.json(decryptedUser);

    } catch (error) {
        console.log("Database Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const checkIfUserExists = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({ error: "Invalid email" });
            return;
        }

        // As the email in the db is encrypted, we need to encrypt the email to do the comparison
        const encryptedEmail = encryptData(email);

        const userExists  = await db.oneOrNone<{ check_if_user_exists: boolean }>(
            "SELECT check_if_user_exists($1) AS check_if_user_exists",
            [encryptedEmail]
        );

        if (userExists === null) {
            res.status(404).json({ error: "There was an error with this email" });
        }

        res.json({ userExists: userExists?.check_if_user_exists });

    } catch (error) {
        console.log("Database Error:", error);
    }
}

export const validateUserPassword = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: "Invalid email or password" });
            return;
        }

        const encryptedEmail = encryptData(email);
        const passwordStoraged = await db.oneOrNone<{get_user_password: string}>(
            "SELECT * FROM get_user_password($1)", [encryptedEmail]);

        if (!passwordStoraged) {
            res.status(404).json({ error: "There was an error with this email" });
            return;
        }

        const passwordMatch = await comparePassword(password, passwordStoraged.get_user_password);
        res.json({ passwordMatch: passwordMatch });
    } catch (error) {
        console.log("Database Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}