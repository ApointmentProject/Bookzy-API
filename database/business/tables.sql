-- 2. TABLAS DE EMPRESA
CREATE TABLE business_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE businesses (
    id SERIAL PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    business_slug VARCHAR(255),
    category_id INTEGER REFERENCES business_categories(id),

    -- Información de contacto
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,

    -- Ubicación
    address TEXT NOT NULL,
    province VARCHAR(100) NOT NULL,
    canton VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,

    -- Información del negocio
    description TEXT,

    -- Estado y fechas
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA DE RELACIÓN USUARIO-NEGOCIO (NUEVA Y CRUCIAL)
CREATE TABLE user_business (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES user_account(id) ON DELETE CASCADE,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'manager', 'employee', 'receptionist')),

    -- Tracking
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES user_account(id)

);

-- 4. REDES SOCIALES (mantenemos tu estructura)
CREATE TABLE business_social_networks (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,

    -- URLs de redes sociales
    instagram_url VARCHAR(255),
    facebook_url VARCHAR(255),
    whatsapp_url VARCHAR(20),
    tiktok_url VARCHAR(255),
    youtube_url VARCHAR(255),
    twitter_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    website_url VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(business_id)
);

-- 5. TABLA DE CONFIGURACIÓN DE PERMISOS POR ROL
CREATE TABLE role_permissions (
    id SERIAL PRIMARY KEY,
    role VARCHAR(50) NOT NULL UNIQUE,
    permissions JSONB NOT NULL DEFAULT '{}',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE businesses
    ALTER COLUMN phone_number TYPE VARCHAR(255),
    ALTER COLUMN email TYPE VARCHAR(255),
    ALTER COLUMN address TYPE VARCHAR(500);

ALTER TABLE user_account
    ALTER COLUMN email TYPE VARCHAR(255),
    ALTER COLUMN phone_number TYPE VARCHAR(255);

ALTER TABLE business_social_networks
    ALTER COLUMN whatsapp_url TYPE VARCHAR(255);