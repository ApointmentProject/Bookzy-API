import { Request, Response } from "express";
import db from "../config/database";
import User from "../models/user.model";
import { encryptUser, decryptUser } from "../services/user.service";
import { encryptData, comparePassword } from "../utils/cypher";

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
            res.status(400).json({ 
                success: false,
                error: "Email es requerido" 
            });
            return;
        }

        const encryptedEmail = encryptData(email);
        const user: User | null = await db.oneOrNone("SELECT * FROM get_user_by_email($1)", [encryptedEmail]);
        
        if (!user) {
            res.status(404).json({ 
                success: false,
                message: "Usuario no encontrado" 
            });
            return;
        }

        const decryptedUser: User = decryptUser(user);
        
        res.status(200).json({
            success: true,
            data: {
                uid: decryptedUser.uid || '',
                profilePic: decryptedUser.profile_pic || '',
                email: email,
                firstName: decryptedUser.first_name,
                lastName: decryptedUser.last_name,
            }
        });

    } catch (error) {
        console.error("Error en getUserByEmail:", error);
        res.status(500).json({ 
            success: false,
            error: "Error interno del servidor" 
        });
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

        const userExists = await db.oneOrNone<{ check_if_user_exists: boolean }>(
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
        console.log("Email encriptado:", encryptedEmail);
        const passwordStoraged = await db.oneOrNone<{ get_user_password: string }>(
            "SELECT * FROM get_user_password($1)", [encryptedEmail]);

        console.log(passwordStoraged);
        if (!passwordStoraged?.get_user_password) {
            res.status(404).json({ error: "The email entered does not exist" });
            return;
        }

        const passwordMatch = await comparePassword(password, passwordStoraged.get_user_password);
        res.json({ passwordMatch: passwordMatch });
    } catch (error) {
        console.log("Database Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const deleteUserData = async (req: Request, res: Response): Promise<void> => {
    try {
        // Se extrae el user_id de los parámetros de la ruta y se convierte a número.
        const userId = Number(req.params.user_id);

        if (!userId || isNaN(userId)) {
            res.status(400).json({ error: "Invalid user id" });
            return;
        }

        // Se intenta eliminar el usuario y se devuelve el usuario eliminado para confirmar la acción.
        const deletedUser: User | null = await db.oneOrNone(
            "DELETE FROM user_account WHERE id = $1 RETURNING *",
            [userId]
        );

        if (!deletedUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json({
            status: "success",
            confirmation: `La solicitud de eliminación para el usuario ${userId} se ha procesado correctamente.`,
            deletedUser,
        });
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


export const linkFirebaseUid = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, uid, profilePic } = req.body;

    if (!email || !uid) {
      res.status(400).json({ 
        success: false,
        error: "Email y UID son obligatorios" 
      });
      return;
    }

    const encryptedEmail = encryptData(email);

    // Verificar si el usuario existe
    const userExists = await db.oneOrNone(
      "SELECT id, uid FROM user_account WHERE email = $1",
      [encryptedEmail]
    );

    if (!userExists) {
      res.status(404).json({ 
        success: false,
        error: "Usuario no encontrado" 
      });
      return;
    }

    // Verificar si el UID ya está en uso por otro usuario
    const uidExists = await db.oneOrNone(
      "SELECT id FROM user_account WHERE uid = $1 AND email != $2",
      [uid, encryptedEmail]
    );

    if (uidExists) {
      res.status(409).json({ 
        success: false,
        error: "Este UID de Firebase ya está vinculado a otro usuario" 
      });
      return;
    }

    // Actualizar el usuario con el UID de Firebase
    const updateResult = await db.result(
      "UPDATE user_account SET uid = $1, profile_pic = $2 WHERE email = $3",
      [uid, profilePic || null, encryptedEmail]
    );

    if (updateResult.rowCount === 0) {
      res.status(500).json({
        success: false,
        error: "No se pudo actualizar el usuario"
      });
      return;
    }

    // Obtener los datos actualizados
    const updatedUser = await db.oneOrNone(
      "SELECT uid, profile_pic FROM user_account WHERE email = $1",
      [encryptedEmail]
    );

    res.status(200).json({ 
      success: true,
      message: "Firebase UID vinculado exitosamente",
      data: {
        uid: updatedUser?.uid || '',
        profilePic: updatedUser?.profile_pic || '',
        email: email
      }
    });

  } catch (error) {
    console.error("Error al vincular UID:", error);
    res.status(500).json({ 
      success: false,
      error: "Error interno del servidor" 
    });
  }
};