-- Tabla para guardar cotizaciones
CREATE TABLE IF NOT EXISTS cotizaciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cliente_nombre VARCHAR(255) NOT NULL,
  cliente_email VARCHAR(255),
  cliente_telefono VARCHAR(20),
  cliente_empresa VARCHAR(255),
  servicios JSON NOT NULL,
  monto_total DECIMAL(10,2),
  notas TEXT,
  estado ENUM('pendiente', 'enviada', 'aceptada') DEFAULT 'pendiente',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  pdf_url VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS servicios_catalogo (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  categoria VARCHAR(100),
  precio_base DECIMAL(10,2),
  descripcion TEXT,
  activo BOOLEAN DEFAULT 1
);

-- Insertar servicios de ejemplo
INSERT INTO servicios_catalogo (nombre, categoria, precio_base, descripcion) VALUES
('Diseño Web', 'web', 1500, 'Diseño responsive de sitio web'),
('Desarrollo Web Fullstack', 'web', 3500, 'Desarrollo completo con HTML/CSS/JS/PHP'),
('E-commerce', 'tienda', 5000, 'Tienda online con carrito de compras'),
('SEO y Marketing Digital', 'marketing', 2000, 'Posicionamiento en buscadores'),
('Mantenimiento Mensual', 'soporte', 500, 'Soporte y actualizaciones mensuales'),
('Consultoría Digital', 'consultoría', 800, 'Asesoramiento estratégico digital');
