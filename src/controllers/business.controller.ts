import { Request, Response } from "express";
import db from "../config/database";
import Business from "../models/business.model";
import UserBusiness from "../models/userBusiness.model";
import BusinessSocialNetworks from "../models/businessSocialNetworks.model";
import { encryptBusiness, decryptBusiness, decryptBusinessArray } from "../services/business.service";
import { encryptData } from "../utils/cypher";

// Crear un nuevo negocio
export const createBusiness = async (
  req: Request,
  res: Response
): Promise<void> => {
  const transaction = await db.tx(async t => {
    try {
      const { business, socialNetworks, userId } = req.body;

      // Validar campos requeridos
      if (!business || !userId) {
        throw new Error("Datos incompletos");
      }

      // Encriptar datos sensibles del negocio
      const encryptedBusiness = encryptBusiness(business);

      // Insertar el negocio
      const newBusiness = await t.one<Business>(
        `INSERT INTO businesses (
          business_name, business_slug, category_id, phone_number, 
          email, website, address, province, canton, district, 
          latitude, longitude, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
          encryptedBusiness.business_name,
          encryptedBusiness.business_slug,
          encryptedBusiness.category_id,
          encryptedBusiness.phone_number,
          encryptedBusiness.email,
          encryptedBusiness.website,
          encryptedBusiness.address,
          encryptedBusiness.province,
          encryptedBusiness.canton,
          encryptedBusiness.district,
          encryptedBusiness.latitude,
          encryptedBusiness.longitude,
          encryptedBusiness.description
        ]
      );

      // Crear la relación usuario-negocio como owner
      await t.none(
        `INSERT INTO user_business (
          user_id, business_id, role, 
          can_manage_appointments, can_manage_services, 
          can_manage_employees, can_view_reports, can_manage_settings,
          created_by
        ) VALUES ($1, $2, 'owner', true, true, true, true, true, $1)`,
        [userId, newBusiness.id]
      );

      // Si hay redes sociales, insertarlas
      if (socialNetworks) {
        await t.none(
          `INSERT INTO business_social_networks (
            business_id, instagram_url, facebook_url, whatsapp_number,
            tiktok_url, youtube_url, twitter_url, linkedin_url
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            newBusiness.id,
            socialNetworks.instagram_url,
            socialNetworks.facebook_url,
            socialNetworks.whatsapp_number,
            socialNetworks.tiktok_url,
            socialNetworks.youtube_url,
            socialNetworks.twitter_url,
            socialNetworks.linkedin_url
          ]
        );
      }

      // Actualizar el tipo de usuario a business_owner si es necesario
      await t.none(
        `UPDATE user_account 
         SET user_type = 'business_owner' 
         WHERE id = $1 AND user_type = 'customer'`,
        [userId]
      );

      return newBusiness;
    } catch (error) {
      throw error;
    }
  });

  try {
    const decryptedBusiness = decryptBusiness(transaction);
    res.status(201).json({
      success: true,
      message: "Negocio creado exitosamente",
      data: decryptedBusiness
    });
  } catch (error: any) {
    console.error("Error al crear negocio:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Error al crear el negocio"
    });
  }
};


// Obtener todos los negocios de un usuario
export const getUserBusinesses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId);

    const businesses = await db.manyOrNone<any>(
      `SELECT 
        b.*,
        ub.role,
        ub.can_manage_appointments,
        ub.can_manage_services,
        ub.can_manage_employees,
        ub.can_view_reports,
        ub.can_manage_settings,
        bc.name as category_name,
        bc.icon as category_icon
      FROM user_business ub
      JOIN businesses b ON b.id = ub.business_id
      LEFT JOIN business_categories bc ON b.category_id = bc.id
      WHERE ub.user_id = $1 AND ub.is_active = true
      ORDER BY ub.created_at DESC`,
      [userId]
    );

    const decryptedBusinesses = businesses.map(business => ({
      ...decryptBusiness(business),
      role: business.role,
      permissions: {
        can_manage_appointments: business.can_manage_appointments,
        can_manage_services: business.can_manage_services,
        can_manage_employees: business.can_manage_employees,
        can_view_reports: business.can_view_reports,
        can_manage_settings: business.can_manage_settings
      },
      category: {
        name: business.category_name,
        icon: business.category_icon
      }
    }));

    res.status(200).json({
      success: true,
      data: decryptedBusinesses
    });
  } catch (error) {
    console.error("Error al obtener negocios del usuario:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener los negocios"
    });
  }
};

// Obtener un negocio por slug
export const getBusinessBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

    const business = await db.oneOrNone<any>(
      `SELECT 
        b.*,
        bc.name as category_name,
        bc.icon as category_icon,
        bsn.instagram_url,
        bsn.facebook_url,
        bsn.whatsapp_number,
        bsn.tiktok_url,
        bsn.youtube_url,
        bsn.twitter_url,
        bsn.linkedin_url
      FROM businesses b
      LEFT JOIN business_categories bc ON b.category_id = bc.id
      LEFT JOIN business_social_networks bsn ON b.id = bsn.business_id
      WHERE b.business_slug = $1 AND b.is_active = true`,
      [slug]
    );

    if (!business) {
      res.status(404).json({
        success: false,
        error: "Negocio no encontrado"
      });
      return;
    }

    const decryptedBusiness = {
      ...decryptBusiness(business),
      category: {
        name: business.category_name,
        icon: business.category_icon
      },
      socialNetworks: {
        instagram_url: business.instagram_url,
        facebook_url: business.facebook_url,
        whatsapp_number: business.whatsapp_number,
        tiktok_url: business.tiktok_url,
        youtube_url: business.youtube_url,
        twitter_url: business.twitter_url,
        linkedin_url: business.linkedin_url
      }
    };

    res.status(200).json({
      success: true,
      data: decryptedBusiness
    });
  } catch (error) {
    console.error("Error al obtener negocio:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener el negocio"
    });
  }
};

// Actualizar un negocio
export const updateBusiness = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { businessId } = req.params;
    const { business, socialNetworks, userId } = req.body;

    // Verificar que el usuario sea owner del negocio
    const isOwner = await db.oneOrNone(
      "SELECT * FROM user_business WHERE user_id = $1 AND business_id = $2 AND role = 'owner' AND is_active = true",
      [userId, businessId]
    );

    if (!isOwner) {
      res.status(403).json({
        success: false,
        error: "No tienes permisos para actualizar este negocio"
      });
      return;
    }

    const encryptedBusiness = encryptBusiness(business);

    // Actualizar el negocio
    await db.none(
      `UPDATE businesses SET
        business_name = $2,
        category_id = $3,
        phone_number = $4,
        email = $5,
        website = $6,
        address = $7,
        province = $8,
        canton = $9,
        district = $10,
        description = $11,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1`,
      [
        businessId,
        encryptedBusiness.business_name,
        encryptedBusiness.category_id,
        encryptedBusiness.phone_number,
        encryptedBusiness.email,
        encryptedBusiness.website,
        encryptedBusiness.address,
        encryptedBusiness.province,
        encryptedBusiness.canton,
        encryptedBusiness.district,
        encryptedBusiness.description
      ]
    );

    // Actualizar redes sociales si se proporcionan
    if (socialNetworks) {
      await db.none(
        `INSERT INTO business_social_networks (
          business_id, instagram_url, facebook_url, whatsapp_number,
          tiktok_url, youtube_url, twitter_url, linkedin_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (business_id) DO UPDATE SET
          instagram_url = $2,
          facebook_url = $3,
          whatsapp_number = $4,
          tiktok_url = $5,
          youtube_url = $6,
          twitter_url = $7,
          linkedin_url = $8,
          updated_at = CURRENT_TIMESTAMP`,
        [
          businessId,
          socialNetworks.instagram_url,
          socialNetworks.facebook_url,
          socialNetworks.whatsapp_number,
          socialNetworks.tiktok_url,
          socialNetworks.youtube_url,
          socialNetworks.twitter_url,
          socialNetworks.linkedin_url
        ]
      );
    }

    res.status(200).json({
      success: true,
      message: "Negocio actualizado exitosamente"
    });
  } catch (error) {
    console.error("Error al actualizar negocio:", error);
    res.status(500).json({
      success: false,
      error: "Error al actualizar el negocio"
    });
  }
};

// Obtener categorías de negocios
export const getBusinessCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const categories = await db.manyOrNone(
      "SELECT * FROM business_categories WHERE is_active = true ORDER BY name"
    );

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener las categorías"
    });
  }
};