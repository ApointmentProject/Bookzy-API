"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBusinessCategories = exports.updateBusiness = exports.getBusinessBySlug = exports.getUserBusinesses = exports.createBusiness = void 0;
const database_1 = __importDefault(require("../config/database"));
const business_service_1 = require("../services/business.service");
const cypher_1 = require("../utils/cypher");
const cypher_2 = require("../utils/cypher");
// Crear un nuevo negocio
const createBusiness = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const result = yield database_1.default.tx((t) => __awaiter(void 0, void 0, void 0, function* () {
            let userId;
            if (mode === "new-user") {
                // Validar campos requeridos para nuevo usuario
                if (!user.firstName || !user.lastName || !user.email || !user.phone ||
                    !user.dateOfBirth || !user.idNumber || !user.gender || !user.password) {
                    throw new Error("Datos de usuario incompletos");
                }
                const encryptedEmail = (0, cypher_1.encryptData)(user.email);
                const encryptedPhone = (0, cypher_1.encryptData)(user.phone);
                const hashedPassword = yield (0, cypher_2.hashPassword)(user.password);
                const newUser = yield t.one(`INSERT INTO user_account 
           (first_name, last_name, email, phone_number, birthday, id_number, gender, password_hash)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id`, [
                    user.firstName,
                    user.lastName,
                    encryptedEmail,
                    encryptedPhone,
                    user.dateOfBirth,
                    user.idNumber,
                    user.gender,
                    hashedPassword,
                ]);
                userId = newUser.id;
            }
            else if (mode === "existing-user") {
                const encryptedEmail = (0, cypher_1.encryptData)(user.email);
                const existing = yield t.oneOrNone(`SELECT id, password_hash FROM user_account WHERE email = $1`, [encryptedEmail]);
                if (!existing) {
                    throw new Error("Usuario no encontrado");
                }
                const match = yield (0, cypher_2.comparePassword)(user.password, existing.password_hash);
                if (!match) {
                    throw new Error("Contraseña incorrecta");
                }
                userId = existing.id;
            }
            else {
                throw new Error("Modo inválido");
            }
            const encryptedBusiness = (0, business_service_1.encryptBusiness)(business);
            const newBusiness = yield t.one(`INSERT INTO businesses (
          business_name, business_slug, category_id, phone_number, 
          email, address, province, canton, district, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`, [
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
            ]);
            yield t.none(`INSERT INTO user_business (user_id, business_id, role, created_by)
         VALUES ($1, $2, 'owner', $1)`, [userId, newBusiness.id]);
            if (business.socialMedia && (business.socialMedia.instagram || business.socialMedia.facebook || business.socialMedia.whatsapp)) {
                yield t.none(`INSERT INTO business_social_networks (
            business_id, instagram_url, facebook_url, whatsapp_url
          ) VALUES ($1, $2, $3, $4)`, [
                    newBusiness.id,
                    business.socialMedia.instagram || null,
                    business.socialMedia.facebook || null,
                    business.socialMedia.whatsapp || null,
                ]);
            }
            return { newBusiness, userId };
        }));
        const decrypted = (0, business_service_1.decryptBusiness)(result.newBusiness);
        res.status(201).json({
            success: true,
            message: "Negocio creado exitosamente",
            data: {
                business: decrypted,
                userId: result.userId,
            }
        });
    }
    catch (error) {
        console.error("Error al crear negocio:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Error interno del servidor",
            message: error.message
        });
    }
});
exports.createBusiness = createBusiness;
// Obtener negocios de un usuario
const getUserBusinesses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = parseInt(req.params.userId);
        const businesses = yield database_1.default.manyOrNone(`SELECT 
        b.*, ub.role, 
        bc.name as category_name, bc.icon as category_icon
      FROM user_business ub
      JOIN businesses b ON b.id = ub.business_id
      LEFT JOIN business_categories bc ON b.category_id = bc.id
      WHERE ub.user_id = $1 AND ub.is_active = true
      ORDER BY ub.created_at DESC`, [userId]);
        const result = businesses.map((b) => (Object.assign(Object.assign({}, (0, business_service_1.decryptBusiness)(b)), { role: b.role, category: {
                name: b.category_name,
                icon: b.category_icon,
            } })));
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        console.error("Error al obtener negocios:", error);
        res.status(500).json({ success: false, error: "Error al obtener negocios" });
    }
});
exports.getUserBusinesses = getUserBusinesses;
// Obtener negocio por slug
const getBusinessBySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        const business = yield database_1.default.oneOrNone(`SELECT b.*, bc.name as category_name, bc.icon as category_icon, 
              sn.instagram_url, sn.facebook_url, sn.whatsapp_url,
              sn.tiktok_url, sn.youtube_url, sn.twitter_url,
              sn.linkedin_url, sn.website_url
       FROM businesses b
       LEFT JOIN business_categories bc ON b.category_id = bc.id
       LEFT JOIN business_social_networks sn ON b.id = sn.business_id
       WHERE b.business_slug = $1 AND b.is_active = true`, [slug]);
        if (!business) {
            res.status(404).json({ success: false, error: "Negocio no encontrado" });
            return;
        }
        const result = Object.assign(Object.assign({}, (0, business_service_1.decryptBusiness)(business)), { category: {
                name: business.category_name,
                icon: business.category_icon
            }, socialNetworks: {
                instagram_url: business.instagram_url,
                facebook_url: business.facebook_url,
                whatsapp_url: business.whatsapp_url,
                tiktok_url: business.tiktok_url,
                youtube_url: business.youtube_url,
                twitter_url: business.twitter_url,
                linkedin_url: business.linkedin_url,
                website_url: business.website_url
            } });
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        console.error("Error al obtener negocio:", error);
        res.status(500).json({ success: false, error: "Error al obtener el negocio" });
    }
});
exports.getBusinessBySlug = getBusinessBySlug;
// Actualizar negocio
const updateBusiness = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { businessId } = req.params;
        const { business, socialNetworks, userId } = req.body;
        const isOwner = yield database_1.default.oneOrNone("SELECT 1 FROM user_business WHERE user_id = $1 AND business_id = $2 AND role = 'owner' AND is_active = true", [userId, businessId]);
        if (!isOwner) {
            res.status(403).json({ success: false, error: "No tienes permisos para editar este negocio" });
            return;
        }
        const encrypted = (0, business_service_1.encryptBusiness)(business);
        yield database_1.default.none(`UPDATE businesses SET
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
      WHERE id = $1`, [
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
        ]);
        if (socialNetworks) {
            yield database_1.default.none(`INSERT INTO business_social_networks (
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
          updated_at = CURRENT_TIMESTAMP`, [
                businessId,
                socialNetworks.instagram_url || null,
                socialNetworks.facebook_url || null,
                socialNetworks.whatsapp_url || null,
                socialNetworks.tiktok_url || null,
                socialNetworks.youtube_url || null,
                socialNetworks.twitter_url || null,
                socialNetworks.linkedin_url || null,
                socialNetworks.website_url || null
            ]);
        }
        res.status(200).json({ success: true, message: "Negocio actualizado correctamente" });
    }
    catch (error) {
        console.error("Error al actualizar negocio:", error);
        res.status(500).json({ success: false, error: "Error interno del servidor" });
    }
});
exports.updateBusiness = updateBusiness;
// Obtener categorías
const getBusinessCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield database_1.default.manyOrNone("SELECT * FROM business_categories ORDER BY name");
        res.status(200).json({ success: true, data: categories });
    }
    catch (error) {
        console.error("Error al obtener categorías:", error);
        res.status(500).json({ success: false, error: "Error al obtener las categorías" });
    }
});
exports.getBusinessCategories = getBusinessCategories;
