"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptBusiness = exports.encryptBusiness = void 0;
const cypher_1 = require("../utils/cypher");
const encryptBusiness = (business) => {
    // Validación del email antes de encriptar
    if (!business.email) {
        throw new Error("El campo 'email' es obligatorio en el negocio");
    }
    // Generar slug a partir del nombre del negocio
    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Remover acentos
            .replace(/[^a-z0-9\s-]/g, "") // Remover caracteres especiales
            .trim()
            .replace(/\s+/g, "-") // Reemplazar espacios con guiones
            .replace(/-+/g, "-"); // Remover guiones múltiples
    };
    // Validar y convertir category_id
    const categoryId = parseInt(business.category);
    if (isNaN(categoryId)) {
        throw new Error(`La categoría '${business.category}' no es válida. Debe ser un número.`);
    }
    return {
        business_name: business.businessName,
        business_slug: generateSlug(business.businessName),
        category_id: categoryId,
        phone_number: (0, cypher_1.encryptData)(business.businessPhone),
        email: (0, cypher_1.encryptData)(business.email),
        address: (0, cypher_1.encryptData)(business.exactAddress),
        province: business.province,
        canton: business.canton,
        district: business.district,
        description: business.businessDescription || null,
    };
};
exports.encryptBusiness = encryptBusiness;
const decryptBusiness = (business) => {
    return Object.assign(Object.assign({}, business), { phone_number: (0, cypher_1.decryptData)(business.phone_number), email: (0, cypher_1.decryptData)(business.email), address: (0, cypher_1.decryptData)(business.address) });
};
exports.decryptBusiness = decryptBusiness;
