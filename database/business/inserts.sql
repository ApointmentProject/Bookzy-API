-- 6. INSERTAR ROLES Y PERMISOS PREDEFINIDOS
INSERT INTO role_permissions (role, permissions, description) VALUES
('owner',
 '{"all": true}'::jsonb,
 'Dueño del negocio con todos los permisos'),
('manager',
 '{"appointments": true, "services": true, "employees": true, "reports": true, "settings": false}'::jsonb,
 'Gerente con permisos administrativos'),
('employee',
 '{"appointments": true, "services": false, "employees": false, "reports": false, "settings": false}'::jsonb,
 'Empleado con permisos básicos');

INSERT INTO business_categories (id, name, description, icon) VALUES
(1, 'Restaurante', 'Establecimientos de comida y bebida', 'restaurant'),
(2, 'Comercio Minorista', 'Tiendas y comercios al por menor', 'store'),
(3, 'Servicios Profesionales', 'Servicios de consultoría y profesionales', 'briefcase'),
(4, 'Tecnología', 'Empresas de tecnología y software', 'computer'),
(5, 'Salud y Bienestar', 'Clínicas, hospitales y servicios de salud', 'heart'),
(6, 'Educación', 'Escuelas, universidades y centros educativos', 'academic-cap'),
(7, 'Turismo y Hotelería', 'Hoteles, hostales y servicios turísticos', 'office-building'),
(8, 'Automotriz', 'Talleres, concesionarios y servicios automotrices', 'truck'),
(9, 'Construcción', 'Empresas constructoras y servicios relacionados', 'home'),
(10, 'Belleza y Cuidado Personal', 'Salones de belleza, barberías, spas', 'sparkles'),
(11, 'Entretenimiento', 'Cines, teatros, centros de entretenimiento', 'music-note'),
(12, 'Alimentos y Bebidas', 'Productores y distribuidores de alimentos', 'cake'),
(13, 'Inmobiliaria', 'Agencias inmobiliarias y bienes raíces', 'home'),
(14, 'Servicios Financieros', 'Bancos, cooperativas y servicios financieros', 'currency-dollar'),
(15, 'Arte y Cultura', 'Galerías, museos y centros culturales', 'color-swatch'),
(16, 'Deportes', 'Gimnasios, centros deportivos y relacionados', 'lightning-bolt'),
(17, 'Moda y Accesorios', 'Tiendas de ropa, calzado y accesorios', 'shopping-bag'),
(18, 'Hogar y Decoración', 'Muebles, decoración y artículos para el hogar', 'cube'),
(19, 'Mascotas', 'Veterinarias, tiendas de mascotas y servicios', 'heart'),
(20, 'Otros', 'Otras categorías no especificadas', 'dots-horizontal')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon;

-- Asegura que la secuencia esté sincronizada
SELECT setval('business_categories_id_seq', (SELECT MAX(id) FROM business_categories));
