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
 'Empleado con permisos básicos'),
('receptionist',
 '{"appointments": true, "services": false, "employees": false, "reports": false, "settings": false}'::jsonb,
 'Recepcionista para gestión de citas');

-- 7. INSERTAR CATEGORÍAS PREDEFINIDAS
INSERT INTO business_categories (name, description, icon) VALUES
('Barbería', 'Servicios de corte de cabello y barbería', 'scissors'),
('Salón de Belleza', 'Servicios de belleza y estética', 'sparkles'),
('Dentista', 'Servicios odontológicos', 'tooth'),
('Médico', 'Servicios médicos generales', 'stethoscope'),
('Veterinaria', 'Servicios veterinarios', 'paw'),
('Spa', 'Servicios de relajación y spa', 'spa'),
('Gimnasio', 'Centro de entrenamiento físico', 'dumbbell'),
('Mecánico', 'Servicios automotrices', 'wrench'),
('Abogado', 'Servicios legales', 'scale'),
('Contador', 'Servicios contables', 'calculator'),
('Fotógrafo', 'Servicios de fotografía', 'camera'),
('Otros', 'Otros servicios', 'briefcase');
