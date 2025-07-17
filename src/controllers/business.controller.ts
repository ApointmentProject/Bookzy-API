// src/controllers/business.controller.ts
import { Request, Response } from "express";
import db from "../config/database";
import Business from "../models/business/business.model";
import { encryptBusiness, decryptBusiness } from "../services/business.service";
import { encryptData } from "../utils/cypher";
import { hashPassword, comparePassword } from "../utils/cypher";

// Crear un nuevo negocio
export const createBusiness = async (req: Request, res: Response): Promise<void> => {
  try {
    const { business, user, mode } = req.body;

    if (!business || !user || !mode) {
      res.status(400).json({ success: false, error: "Datos incompletos" });
      return;
    }

    // Validar que el email esté presente
    if (!business.email) {
      res.status(400).json({ success: false, error: "El email del negocio es obligatorio" });
      return;
    }

    const result = await db.tx(async (t) => {
      let userId: number;

      if (mode === "new-user") {
        // Validar campos requeridos para nuevo usuario
        if (!user.firstName || !user.lastName || !user.email || !user.phone || 
            !user.dateOfBirth || !user.idNumber || !user.gender || !user.password) {
          throw new Error("Datos de usuario incompletos");
        }

        const encryptedEmail = encryptData(user.email);
        const encryptedPhone = encryptData(user.phone);
        const hashedPassword = await hashPassword(user.password);

        const newUser = await t.one(
          `INSERT INTO user_account 
           (first_name, last_name, email, phone_number, birthday, id_number, gender, password_hash)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id`,
          [
            user.firstName,
            user.lastName,
            encryptedEmail,
            encryptedPhone,
            user.dateOfBirth,
            user.idNumber,
            user.gender,
            hashedPassword,
          ]
        );

        userId = newUser.id;
      } else if (mode === "existing-user") {
        const encryptedEmail = encryptData(user.email);

        const existing = await t.oneOrNone(
          `SELECT id, password_hash FROM user_account WHERE email = $1`,
          [encryptedEmail]
        );

        if (!existing) {
          throw new Error("Usuario no encontrado");
        }

        const match = await comparePassword(user.password, existing.password_hash);
        if (!match) {
          throw new Error("Contraseña incorrecta");
        }

        userId = existing.id;
      } else {
        throw new Error("Modo inválido");
      }

      const encryptedBusiness = encryptBusiness(business);

      const newBusiness = await t.one(
        `INSERT INTO businesses (
          business_name, business_slug, category_id, phone_number, 
          email, address, province, canton, district, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          encryptedBusiness.business_name,
          encryptedBusiness.business_slug,
          encryptedBusiness.category_id,
          encryptedBusiness.phone_number,
          encryptedBusiness.email,
          encryptedBusiness.address,
          encryptedBusiness.province,
          encryptedBusiness.canton,
          encryptedBusiness.district,
          encryptedBusiness.description
        ]
      );

      await t.none(
        `INSERT INTO user_business (user_id, business_id, role, created_by)
         VALUES ($1, $2, 'owner', $1)`,
        [userId, newBusiness.id]
      );

      if (business.socialMedia && (business.socialMedia.instagram || business.socialMedia.facebook || business.socialMedia.whatsapp)) {
        await t.none(
          `INSERT INTO business_social_networks (
            business_id, instagram_url, facebook_url, whatsapp_url
          ) VALUES ($1, $2, $3, $4)`,
          [
            newBusiness.id,
            business.socialMedia.instagram || null,
            business.socialMedia.facebook || null,
            business.socialMedia.whatsapp || null,
          ]
        );
      }

      return { newBusiness, userId };
    });

    const decrypted = decryptBusiness(result.newBusiness);

    res.status(201).json({
      success: true,
      message: "Negocio creado exitosamente",
      data: {
        business: decrypted,
        userId: result.userId,
      }
    });
  } catch (error: any) {
    console.error("Error al crear negocio:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Error interno del servidor",
      message: error.message 
    });
  }
};


// Obtener negocios de un usuario
export const getUserBusinesses = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId);

    const businesses = await db.manyOrNone(
      `SELECT 
        b.*, ub.role, 
        bc.name as category_name, bc.icon as category_icon
      FROM user_business ub
      JOIN businesses b ON b.id = ub.business_id
      LEFT JOIN business_categories bc ON b.category_id = bc.id
      WHERE ub.user_id = $1 AND ub.is_active = true
      ORDER BY ub.created_at DESC`,
      [userId]
    );

    const result = businesses.map((b: any) => ({
      ...decryptBusiness(b),
      role: b.role,
      category: {
        name: b.category_name,
        icon: b.category_icon,
      },
    }));

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error al obtener negocios:", error);
    res.status(500).json({ success: false, error: "Error al obtener negocios" });
  }
};

// Obtener negocio por slug
export const getBusinessBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const business = await db.oneOrNone(
      `SELECT b.*, bc.name as category_name, bc.icon as category_icon, 
              sn.instagram_url, sn.facebook_url, sn.whatsapp_url,
              sn.tiktok_url, sn.youtube_url, sn.twitter_url,
              sn.linkedin_url, sn.website_url
       FROM businesses b
       LEFT JOIN business_categories bc ON b.category_id = bc.id
       LEFT JOIN business_social_networks sn ON b.id = sn.business_id
       WHERE b.business_slug = $1 AND b.is_active = true`,
      [slug]
    );

    if (!business) {
      res.status(404).json({ success: false, error: "Negocio no encontrado" });
      return;
    }

    const result = {
      ...decryptBusiness(business),
      category: {
        name: business.category_name,
        icon: business.category_icon
      },
      socialNetworks: {
        instagram_url: business.instagram_url,
        facebook_url: business.facebook_url,
        whatsapp_url: business.whatsapp_url,
        tiktok_url: business.tiktok_url,
        youtube_url: business.youtube_url,
        twitter_url: business.twitter_url,
        linkedin_url: business.linkedin_url,
        website_url: business.website_url
      }
    };

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error al obtener negocio:", error);
    res.status(500).json({ success: false, error: "Error al obtener el negocio" });
  }
};

// Actualizar negocio
export const updateBusiness = async (req: Request, res: Response): Promise<void> => {
  try {
    const { businessId } = req.params;
    const { business, socialNetworks, userId } = req.body;

    const isOwner = await db.oneOrNone(
      "SELECT 1 FROM user_business WHERE user_id = $1 AND business_id = $2 AND role = 'owner' AND is_active = true",
      [userId, businessId]
    );

    if (!isOwner) {
      res.status(403).json({ success: false, error: "No tienes permisos para editar este negocio" });
      return;
    }

    const encrypted = encryptBusiness(business);

    await db.none(
      `UPDATE businesses SET
        business_name = $2,
        category_id = $3,
        phone_number = $4,
        email = $5,
        address = $6,
        province = $7,
        canton = $8,
        district = $9,
        description = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1`,
      [
        businessId,
        encrypted.business_name,
        encrypted.category_id,
        encrypted.phone_number,
        encrypted.email,
        encrypted.address,
        encrypted.province,
        encrypted.canton,
        encrypted.district,
        encrypted.description || null
      ]
    );

    if (socialNetworks) {
      await db.none(
        `INSERT INTO business_social_networks (
          business_id, instagram_url, facebook_url, whatsapp_url,
          tiktok_url, youtube_url, twitter_url, linkedin_url, website_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (business_id) DO UPDATE SET
          instagram_url = $2,
          facebook_url = $3,
          whatsapp_url = $4,
          tiktok_url = $5,
          youtube_url = $6,
          twitter_url = $7,
          linkedin_url = $8,
          website_url = $9,
          updated_at = CURRENT_TIMESTAMP`,
        [
          businessId,
          socialNetworks.instagram_url || null,
          socialNetworks.facebook_url || null,
          socialNetworks.whatsapp_url || null,
          socialNetworks.tiktok_url || null,
          socialNetworks.youtube_url || null,
          socialNetworks.twitter_url || null,
          socialNetworks.linkedin_url || null,
          socialNetworks.website_url || null
        ]
      );
    }

    res.status(200).json({ success: true, message: "Negocio actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar negocio:", error);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
};

// Obtener categorías
export const getBusinessCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await db.manyOrNone("SELECT * FROM business_categories ORDER BY name");
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res.status(500).json({ success: false, error: "Error al obtener las categorías" });
  }
};
