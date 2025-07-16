-- 8. ÍNDICES PARA MEJORAR PERFORMANCE
CREATE INDEX idx_business_slug ON businesses(business_slug);
CREATE INDEX idx_business_category ON businesses(category_id);
CREATE INDEX idx_business_location ON businesses(province, canton);
CREATE INDEX idx_user_business_user ON user_business(user_id);
CREATE INDEX idx_user_business_business ON user_business(business_id);


-- Función para verificar si un usuario es dueño de un negocio
CREATE OR REPLACE FUNCTION is_business_owner(p_user_id INTEGER, p_business_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_business
        WHERE user_id = p_user_id
        AND business_id = p_business_id
        AND role = 'owner'
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql;

-- Función para obtener todos los negocios de un usuario
CREATE OR REPLACE FUNCTION get_user_businesses(p_user_id INTEGER)
RETURNS TABLE(
    business_id INTEGER,
    business_name VARCHAR,
    business_slug VARCHAR,
    role VARCHAR,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        b.id,
        b.business_name,
        b.business_slug,
        ub.role,
        ub.is_active
    FROM user_business ub
    JOIN businesses b ON b.id = ub.business_id
    WHERE ub.user_id = p_user_id
    ORDER BY ub.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 10. TRIGGER PARA ACTUALIZAR updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_businesses_updated_at
BEFORE UPDATE ON businesses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_social_networks_updated_at
BEFORE UPDATE ON business_social_networks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();