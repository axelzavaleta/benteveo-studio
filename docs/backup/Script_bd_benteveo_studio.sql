

DROP DATABASE IF EXISTS benteveo_studio_db;
CREATE DATABASE benteveo_studio_db;

-- TABLAS AUXILIARES

CREATE TABLE ubicacion (
    ubicacion_id SERIAL PRIMARY KEY,
    ubicacion_calle VARCHAR(255) NOT NULL,
    ubicacion_numero VARCHAR(20),
    ubicacion_piso VARCHAR(10),
    ubicacion_depto VARCHAR(10),
    ubicacion_barrio VARCHAR(100),
    ubicacion_ciudad VARCHAR(100) NOT NULL,
    ubicacion_provincia VARCHAR(100) NOT NULL,
    ubicacion_codigo_postal VARCHAR(20),
    ubicacion_latitud DECIMAL(10, 8),
    ubicacion_longitud DECIMAL(11, 8),
    ubicacion_google_id VARCHAR(255),
    ubicacion_creado_fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ubicacion_actualizado_fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE etiquetas (
    etiqueta_id SERIAL PRIMARY KEY,
    etiqueta_nombre TEXT NOT NULL UNIQUE,
    etiqueta_descripcion TEXT,
    etiqueta_creado_fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    etiqueta_actualizado_fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE medio_de_pago (
    medio_de_pago_id SERIAL PRIMARY KEY,
    medio_de_pago_nombre TEXT NOT NULL UNIQUE
);

CREATE TABLE condicion_iva (
    condicion_iva_id SERIAL PRIMARY KEY,
    condicion_iva_nombre VARCHAR(100) NOT NULL UNIQUE,
    condicion_iva_codigo VARCHAR(10),
    condicion_iva_discrimina_iva BOOLEAN DEFAULT false,
    condicion_iva_creado_fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE estado_orden (
    estado_orden_id SERIAL PRIMARY KEY,
    estado_orden_nombre VARCHAR(50) NOT NULL UNIQUE,
    estado_orden_descripcion TEXT,
    estado_orden_creado_fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rol_usuario (
    rol_usuario_id SERIAL PRIMARY KEY,
    rol_usuario_nombre VARCHAR(50) NOT NULL UNIQUE,
    rol_usuario_descripcion TEXT,
    rol_usuario_permisos JSONB,
    rol_usuario_creado_fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE estado_usuario (
    estado_usuario_id SERIAL PRIMARY KEY,
    estado_usuario_nombre VARCHAR(50) NOT NULL UNIQUE,
    estado_usuario_descripcion TEXT,
    estado_usuario_creado_fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ENTIDADES PRINCIPALES

CREATE TABLE empresa (
    empresa_id SERIAL PRIMARY KEY,
    empresa_razon_social TEXT NOT NULL,
    empresa_cuit TEXT NOT NULL UNIQUE,
    empresa_condicion_iva_id INT NOT NULL REFERENCES condicion_iva(condicion_iva_id),
    empresa_ubicacion_id INT REFERENCES ubicacion(ubicacion_id) ON DELETE SET NULL,
    empresa_telefono TEXT,
    empresa_email TEXT,
    empresa_web TEXT,
    empresa_logo_url TEXT,
    empresa_activo BOOLEAN DEFAULT true,
    empresa_creado_fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    empresa_actualizado_fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cliente (
    cliente_id SERIAL PRIMARY KEY,
    cliente_nombre TEXT NOT NULL,
    cliente_email TEXT UNIQUE NOT NULL,
    cliente_telefono TEXT,
    cliente_cuit TEXT,
    cliente_dni TEXT,
    cliente_condicion_iva_id INT REFERENCES condicion_iva(condicion_iva_id),
    cliente_ubicacion_id INT REFERENCES ubicacion(ubicacion_id) ON DELETE SET NULL,
    cliente_activo BOOLEAN DEFAULT true,
    cliente_creado_fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cliente_actualizado_fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuario (
    usuario_id SERIAL PRIMARY KEY,
    usuario_nombre TEXT NOT NULL,
    usuario_email TEXT UNIQUE NOT NULL,
    usuario_pass TEXT NOT NULL,
    usuario_estado_id INT NOT NULL REFERENCES estado_usuario(estado_usuario_id),
    usuario_rol_id INT NOT NULL REFERENCES rol_usuario(rol_usuario_id),
    usuario_ubicacion_id INT REFERENCES ubicacion(ubicacion_id) ON DELETE SET NULL,
    usuario_telefono TEXT,
    usuario_avatar_url TEXT,
    usuario_ultimo_login TIMESTAMP WITH TIME ZONE,
    usuario_creado_fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    usuario_actualizado_fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE producto (
    producto_id SERIAL PRIMARY KEY,
    producto_nombre TEXT NOT NULL,
    producto_descripcion TEXT,
    producto_tipo VARCHAR(50) NOT NULL DEFAULT 'digital',
    producto_formato VARCHAR(100),
    producto_tamano_mb NUMERIC(10,2),
    producto_url_descarga TEXT,
    producto_licencia VARCHAR(1000),
    producto_fecha_creacion DATE DEFAULT CURRENT_DATE,
    producto_imagen_url TEXT,
    producto_descuento FLOAT DEFAULT 0 CHECK (producto_descuento BETWEEN 0 AND 100),
    producto_precio NUMERIC(12, 2) NOT NULL CHECK (producto_precio >= 0),
    producto_moneda CHAR(3) DEFAULT 'ARS',
    producto_etiqueta_id INT NOT NULL REFERENCES etiquetas(etiqueta_id) ON DELETE CASCADE,
    producto_activo BOOLEAN DEFAULT true,
    producto_creado_fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    producto_actualizado_fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- FACTURACIÓN

CREATE TABLE factura (
    factura_id SERIAL PRIMARY KEY,
    factura_tipo VARCHAR(1) NOT NULL,
    factura_numero TEXT NOT NULL,
    factura_punto_venta INT NOT NULL,
    factura_fecha_emision TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    factura_fecha_vencimiento TIMESTAMP,
    factura_empresa_id INT NOT NULL REFERENCES empresa(empresa_id) ON DELETE CASCADE,
    factura_cliente_id INT NOT NULL REFERENCES cliente(cliente_id) ON DELETE CASCADE,
    factura_orden_id INT REFERENCES orden(orden_id),
    factura_condicion_pago TEXT NOT NULL,
    factura_moneda CHAR(3) DEFAULT 'ARS',
    factura_cotizacion NUMERIC(10,4) DEFAULT 1,
    factura_subtotal NUMERIC(12,2) NOT NULL,
    factura_descuento NUMERIC(12,2) DEFAULT 0,
    factura_neto_gravado NUMERIC(12,2) NOT NULL,
    factura_iva_monto NUMERIC(12,2) DEFAULT 0,
    factura_percepciones NUMERIC(12,2) DEFAULT 0,
    factura_total NUMERIC(12,2) NOT NULL,
    factura_cae VARCHAR(14),
    factura_cae_vencimiento DATE,
    factura_afip_respuesta JSONB,
    factura_qr_data TEXT,
    factura_pdf_url TEXT,
    factura_creado_fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    factura_actualizado_fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE factura_a (
    factura_a_id SERIAL PRIMARY KEY,
    factura_a_factura_id INT NOT NULL UNIQUE REFERENCES factura(factura_id) ON DELETE CASCADE,
    factura_a_cliente_dni TEXT NOT NULL,
    factura_a_cliente_nombre TEXT NOT NULL,
    factura_a_cliente_direccion TEXT,
    factura_a_cliente_condicion_iva VARCHAR(100) NOT NULL,
    factura_a_iva_discriminado NUMERIC(12,2) NOT NULL,
    factura_a_percepciones NUMERIC(12,2) DEFAULT 0,
    factura_a_observaciones TEXT,
    factura_a_creado_fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE factura_b (
    factura_b_id SERIAL PRIMARY KEY,
    factura_b_factura_id INT NOT NULL UNIQUE REFERENCES factura(factura_id) ON DELETE CASCADE,
    factura_b_cliente_dni TEXT NOT NULL,
    factura_b_cliente_nombre TEXT NOT NULL,
    factura_b_cliente_direccion TEXT,
    factura_b_cliente_condicion_iva VARCHAR(100),
    factura_b_iva_incluido NUMERIC(12,2) NOT NULL,
    factura_b_descuento NUMERIC(12,2) DEFAULT 0,
    factura_b_observaciones TEXT,
    factura_b_creado_fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE detalle_factura (
    detalle_factura_id SERIAL PRIMARY KEY,
    detalle_factura_factura_id INT NOT NULL REFERENCES factura(factura_id) ON DELETE CASCADE,
    detalle_factura_descripcion TEXT NOT NULL,
    detalle_factura_cantidad INT NOT NULL CHECK (detalle_factura_cantidad > 0),
    detalle_factura_precio_unitario NUMERIC(12,2) NOT NULL CHECK (detalle_factura_precio_unitario >= 0),
    detalle_factura_subtotal NUMERIC(12,2) GENERATED ALWAYS AS (detalle_factura_cantidad * detalle_factura_precio_unitario) STORED,
    detalle_factura_creado_fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pago (
    pago_id SERIAL PRIMARY KEY,
    pago_factura_id INT NOT NULL REFERENCES factura(factura_id) ON DELETE CASCADE,
    pago_medio_de_pago_id INT NOT NULL REFERENCES medio_de_pago(medio_de_pago_id) ON DELETE CASCADE,
    pago_monto NUMERIC(12, 2) NOT NULL CHECK (pago_monto >= 0),
    pago_fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    pago_descripcion TEXT,
    pago_creado_fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ÓRDENES Y DETALLES

CREATE TABLE orden (
    orden_id SERIAL PRIMARY KEY,
    orden_usuario_id INT REFERENCES usuario(usuario_id) ON DELETE SET NULL,
    orden_cliente_id INT REFERENCES cliente(cliente_id) ON DELETE SET NULL,
    orden_fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    orden_estado_id INT NOT NULL REFERENCES estado_orden(estado_orden_id),
    orden_subtotal NUMERIC(12,2),
    orden_descuento NUMERIC(12,2) DEFAULT 0,
    orden_total NUMERIC(12,2),
    orden_descripcion TEXT,
    orden_creado_fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    orden_actualizado_fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE detalle_orden (
    detalle_orden_id SERIAL PRIMARY KEY,
    detalle_orden_orden_id INT NOT NULL REFERENCES orden(orden_id) ON DELETE CASCADE,
    detalle_orden_producto_id INT REFERENCES producto(producto_id) ON DELETE SET NULL,
    detalle_orden_descripcion TEXT,
    detalle_orden_cantidad INT NOT NULL CHECK (detalle_orden_cantidad > 0),
    detalle_orden_precio_unitario NUMERIC(12, 2) NOT NULL CHECK (detalle_orden_precio_unitario >= 0),
    detalle_orden_subtotal NUMERIC(12, 2) GENERATED ALWAYS AS (detalle_orden_cantidad * detalle_orden_precio_unitario) STORED,
    detalle_orden_creado_fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RESEÑAS Y CALIFICACIONES

CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    review_texto TEXT NOT NULL,
    review_fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    review_usuario_id INT NOT NULL REFERENCES usuario(usuario_id) ON DELETE CASCADE,
    review_producto_id INT NOT NULL REFERENCES producto(producto_id) ON DELETE CASCADE,
    review_activo BOOLEAN DEFAULT true,
    review_creado_fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    review_actualizado_fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE calificaciones_productos (
    calificacion_producto_id SERIAL PRIMARY KEY,
    calificacion_producto_valor FLOAT NOT NULL CHECK (calificacion_producto_valor BETWEEN 1 AND 5),
    calificacion_producto_producto_id INT NOT NULL REFERENCES producto(producto_id) ON DELETE CASCADE,
    calificacion_producto_usuario_id INT NOT NULL REFERENCES usuario(usuario_id) ON DELETE CASCADE,
    calificacion_producto_fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_calificacion_producto_usuario UNIQUE (calificacion_producto_producto_id, calificacion_producto_usuario_id)
);

CREATE TABLE calificaciones_reviews (
    calificacion_review_id SERIAL PRIMARY KEY,
    calificacion_review_valor FLOAT NOT NULL CHECK (calificacion_review_valor BETWEEN 1 AND 5),
    calificacion_review_review_id INT NOT NULL REFERENCES reviews(review_id) ON DELETE CASCADE,
    calificacion_review_usuario_id INT NOT NULL REFERENCES usuario(usuario_id) ON DELETE CASCADE,
    calificacion_review_fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_calificacion_review_usuario UNIQUE (calificacion_review_review_id, calificacion_review_usuario_id)
);

-- ÍNDICES PARA OPTIMIZACIÓN (TALVEZ LOS USEMOS ES BUENA PRACTICA PARA QUE BUSQUE DIRECTO LA ID Y NO RECCORA TODOS LOS ID)

CREATE INDEX idx_factura_cliente ON factura(factura_cliente_id);
CREATE INDEX idx_factura_empresa ON factura(factura_empresa_id);
CREATE INDEX idx_factura_fecha ON factura(factura_fecha_emision);
CREATE INDEX idx_detalle_factura_factura ON detalle_factura(detalle_factura_factura_id);
CREATE INDEX idx_orden_cliente ON orden(orden_cliente_id);
CREATE INDEX idx_orden_usuario ON orden(orden_usuario_id);
CREATE INDEX idx_orden_estado ON orden(orden_estado_id);
CREATE INDEX idx_producto_etiqueta ON producto(producto_etiqueta_id);
CREATE INDEX idx_reviews_producto ON reviews(review_producto_id);
CREATE INDEX idx_reviews_usuario ON reviews(review_usuario_id);

