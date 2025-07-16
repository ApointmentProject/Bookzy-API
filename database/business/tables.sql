-- 2. TABLAS DE EMPRESA
CREATE TABLE business_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE businesses (
    id SERIAL PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    business_slug VARCHAR(255) UNIQUE NOT NULL,
    category_id INTEGER REFERENCES business_categories(id),

    -- Información de contacto
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    website VARCHAR(255),

    -- Ubicación
    address TEXT NOT NULL,
    province VARCHAR(100) NOT NULL,
    canton VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,

    -- Coordenadas (útil para mapas en el futuro)
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

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

    -- Permisos específicos para este usuario en este negocio
    can_manage_appointments BOOLEAN DEFAULT false,
    can_manage_services BOOLEAN DEFAULT false,
    can_manage_employees BOOLEAN DEFAULT false,
    can_view_reports BOOLEAN DEFAULT false,
    can_manage_settings BOOLEAN DEFAULT false,

    -- Tracking
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES user_account(id),

    -- Un usuario no puede tener múltiples roles en el mismo negocio
    UNIQUE(user_id, business_id)
);

-- 4. REDES SOCIALES (mantenemos tu estructura)
CREATE TABLE business_social_networks (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,

    -- URLs de redes sociales
    instagram_url VARCHAR(255),
    facebook_url VARCHAR(255),
    whatsapp_number VARCHAR(20), -- Cambié a number para ser más específico
    tiktok_url VARCHAR(255),
    youtube_url VARCHAR(255),
    twitter_url VARCHAR(255),
    linkedin_url VARCHAR(255),

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