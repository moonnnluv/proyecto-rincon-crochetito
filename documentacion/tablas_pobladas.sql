
/* ==========================================================================
   RINCÓN CROCHETITO – UPGRADE A RÚBRICA (DB + SEED, COMPATIBLE 5.7/8.0)
   Idempotente: puedes ejecutarlo varias veces.
   Cubre: Usuarios, Categorías (>=5), Productos (>=15), FK, estado, fechas, imagen URL.
   ========================================================================== */

-- 0) Base de datos
CREATE DATABASE IF NOT EXISTS crochetito
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE crochetito;

-- 1) CATEGORIA: crear si no existe
CREATE TABLE IF NOT EXISTS categoria (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

-- descripcion
SET @sql := (
  SELECT IF(EXISTS(SELECT 1 FROM information_schema.COLUMNS
                   WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='categoria' AND COLUMN_NAME='descripcion'),
            'SELECT "descripcion ya existe"',
            'ALTER TABLE categoria ADD COLUMN descripcion VARCHAR(255) NULL AFTER nombre')
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- estado
SET @sql := (
  SELECT IF(EXISTS(SELECT 1 FROM information_schema.COLUMNS
                   WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='categoria' AND COLUMN_NAME='estado'),
            'SELECT "estado ya existe"',
            'ALTER TABLE categoria ADD COLUMN estado ENUM("ACTIVO","INACTIVO") NOT NULL DEFAULT "ACTIVO" AFTER descripcion')
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- fecha_creacion
SET @sql := (
  SELECT IF(EXISTS(SELECT 1 FROM information_schema.COLUMNS
                   WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='categoria' AND COLUMN_NAME='fecha_creacion'),
            'SELECT "fecha_creacion ya existe"',
            'ALTER TABLE categoria ADD COLUMN fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER estado')
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;


-- 2) USUARIOS: crear si no existe + admin por defecto
CREATE TABLE IF NOT EXISTS usuarios (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email  VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  rol ENUM('CLIENTE','VENDEDOR','SUPERADMIN') NOT NULL DEFAULT 'CLIENTE',
  estado ENUM('ACTIVO','INACTIVO') NOT NULL DEFAULT 'ACTIVO',
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO usuarios (nombre, email, password, rol, estado)
SELECT 'Admin Crochetito', 'admin@crochetito.cl',
       '$2a$10$7EqJtq98hPqEX7fNZaFWoOe7NR/ZRkRl9ZpZ6oNhbbX7sVf4lB.G', 'SUPERADMIN', 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE email='admin@crochetito.cl');


-- 3) PRODUCTO: crear si no existe con lo mínimo y luego completar columnas
CREATE TABLE IF NOT EXISTS producto (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT NULL,
  precio DECIMAL(10,2) NOT NULL,
  imagen VARCHAR(255) NOT NULL DEFAULT '/img/no_producto.png',
  destacado TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB;

-- stock
SET @sql := (
  SELECT IF(EXISTS(SELECT 1 FROM information_schema.COLUMNS
                   WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='producto' AND COLUMN_NAME='stock'),
            'SELECT "stock ya existe"',
            'ALTER TABLE producto ADD COLUMN stock INT NOT NULL DEFAULT 0 AFTER precio')
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- categoria_id
SET @sql := (
  SELECT IF(EXISTS(SELECT 1 FROM information_schema.COLUMNS
                   WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='producto' AND COLUMN_NAME='categoria_id'),
            'SELECT "categoria_id ya existe"',
            'ALTER TABLE producto ADD COLUMN categoria_id BIGINT NULL AFTER destacado')
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- estado
SET @sql := (
  SELECT IF(EXISTS(SELECT 1 FROM information_schema.COLUMNS
                   WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='producto' AND COLUMN_NAME='estado'),
            'SELECT "estado ya existe"',
            'ALTER TABLE producto ADD COLUMN estado ENUM("ACTIVO","INACTIVO") NOT NULL DEFAULT "ACTIVO" AFTER categoria_id')
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- fecha_creacion
SET @sql := (
  SELECT IF(EXISTS(SELECT 1 FROM information_schema.COLUMNS
                   WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='producto' AND COLUMN_NAME='fecha_creacion'),
            'SELECT "fecha_creacion ya existe"',
            'ALTER TABLE producto ADD COLUMN fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER estado')
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Migrar desde 'activo' si existía
SET @has_activo := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='producto' AND COLUMN_NAME='activo'
);
SET @sql := IF(@has_activo > 0,
  'UPDATE producto SET estado = CASE WHEN activo=1 THEN "ACTIVO" ELSE "INACTIVO" END',
  'SELECT "sin columna activo"'
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @sql := IF(@has_activo > 0, 'ALTER TABLE producto DROP COLUMN activo', 'SELECT "nada que dropear"');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Asegurar FK producto.categoria_id -> categoria(id) si no existe
SET @fk_exists := (
  SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'producto'
    AND COLUMN_NAME = 'categoria_id'
    AND REFERENCED_TABLE_NAME = 'categoria'
);
SET @sql := IF(@fk_exists = 0,
  'ALTER TABLE producto ADD CONSTRAINT fk_producto_categoria FOREIGN KEY (categoria_id) REFERENCES categoria(id)',
  'SELECT "FK existente"'
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Completar imagen por defecto si hay nulos o vacíos
UPDATE producto SET imagen = '/img/no_producto.png' WHERE imagen IS NULL OR imagen='';


-- 4) Asegurar al menos 5 categorías (idempotente por nombre)
INSERT INTO categoria (nombre, descripcion, estado)
SELECT 'Accesorios', 'Llavero, porta encendedor, etc.', 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM categoria WHERE nombre='Accesorios');

INSERT INTO categoria (nombre, descripcion, estado)
SELECT 'Ropa', 'Cintillos, gorros, bufandas', 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM categoria WHERE nombre='Ropa');

INSERT INTO categoria (nombre, descripcion, estado)
SELECT 'Deco Hogar', 'Posavasos, manteles, cojines', 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM categoria WHERE nombre='Deco Hogar');

INSERT INTO categoria (nombre, descripcion, estado)
SELECT 'Amigurumis', 'Figuras tejidas', 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM categoria WHERE nombre='Amigurumis');

INSERT INTO categoria (nombre, descripcion, estado)
SELECT 'Ediciones Especiales', 'Packs y sets', 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM categoria WHERE nombre='Ediciones Especiales');


-- 5) Asignar categoria por defecto a productos sin categoría
UPDATE producto
SET categoria_id = (SELECT id FROM categoria WHERE nombre='Accesorios' LIMIT 1)
WHERE categoria_id IS NULL;


-- 6) Semilla de productos (agrega los que falten por nombre, hasta tener >=15)
INSERT INTO producto (nombre, descripcion, precio, stock, imagen, destacado, categoria_id, estado)
SELECT 'Porta Encendedor Honguito', 'Funda en forma de hongo para encendedor o labial, con asa.', 4500, 20, 'https://placehold.co/600x600?text=Honguito', 1, (SELECT id FROM categoria WHERE nombre='Accesorios' LIMIT 1), 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre='Porta Encendedor Honguito');

INSERT INTO producto (nombre, descripcion, precio, stock, imagen, destacado, categoria_id, estado)
SELECT 'Cintillo Malla', 'Cintillo tejido en punto malla, cómodo.', 6000, 15, 'https://placehold.co/600x600?text=Cintillo', 1, (SELECT id FROM categoria WHERE nombre='Ropa' LIMIT 1), 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre='Cintillo Malla');

INSERT INTO producto (nombre, descripcion, precio, stock, imagen, destacado, categoria_id, estado)
SELECT 'Posavasos Rosas (x4)', 'Set de 4 posavasos tonos rosados.', 7000, 18, 'https://placehold.co/600x600?text=Posavasos', 0, (SELECT id FROM categoria WHERE nombre='Deco Hogar' LIMIT 1), 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre='Posavasos Rosas (x4)');

INSERT INTO producto (nombre, descripcion, precio, stock, imagen, destacado, categoria_id, estado)
SELECT 'Gorro Chunky', 'Gorro invierno lana bulky.', 8500, 10, 'https://placehold.co/600x600?text=Gorro', 0, (SELECT id FROM categoria WHERE nombre='Ropa' LIMIT 1), 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre='Gorro Chunky');

INSERT INTO producto (nombre, descripcion, precio, stock, imagen, destacado, categoria_id, estado)
SELECT 'Bufanda Clásica', 'Bufanda larga y suave.', 12000, 8, 'https://placehold.co/600x600?text=Bufanda', 0, (SELECT id FROM categoria WHERE nombre='Ropa' LIMIT 1), 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre='Bufanda Clásica');

INSERT INTO producto (nombre, descripcion, precio, stock, imagen, destacado, categoria_id, estado)
SELECT 'Amigurumi Zorro', 'Zorrito tierno hecho a mano.', 15000, 6, 'https://placehold.co/600x600?text=Zorro', 0, (SELECT id FROM categoria WHERE nombre='Amigurumis' LIMIT 1), 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre='Amigurumi Zorro');

INSERT INTO producto (nombre, descripcion, precio, stock, imagen, destacado, categoria_id, estado)
SELECT 'Amigurumi Gatito', 'Gatito gris con bufanda.', 15000, 5, 'https://placehold.co/600x600?text=Gatito', 0, (SELECT id FROM categoria WHERE nombre='Amigurumis' LIMIT 1), 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre='Amigurumi Gatito');

INSERT INTO producto (nombre, descripcion, precio, stock, imagen, destacado, categoria_id, estado)
SELECT 'Mantelito Círculos', 'Centro de mesa tejido.', 13000, 7, 'https://placehold.co/600x600?text=Mantel', 0, (SELECT id FROM categoria WHERE nombre='Deco Hogar' LIMIT 1), 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre='Mantelito Círculos');

INSERT INTO producto (nombre, descripcion, precio, stock, imagen, destacado, categoria_id, estado)
SELECT 'Set Hogar Pastel', 'Pack deco en tonos pastel.', 22000, 3, 'https://placehold.co/600x600?text=Set+Hogar', 0, (SELECT id FROM categoria WHERE nombre='Ediciones Especiales' LIMIT 1), 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre='Set Hogar Pastel');

INSERT INTO producto (nombre, descripcion, precio, stock, imagen, destacado, categoria_id, estado)
SELECT 'Llavero Flor', 'Flor de cinco pétalos.', 3000, 30, 'https://placehold.co/600x600?text=Llavero', 0, (SELECT id FROM categoria WHERE nombre='Accesorios' LIMIT 1), 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre='Llavero Flor');

INSERT INTO producto (nombre, descripcion, precio, stock, imagen, destacado, categoria_id, estado)
SELECT 'Porta Audífonos', 'Mini bolso para audífonos.', 5000, 12, 'https://placehold.co/600x600?text=Mini+Bolso', 0, (SELECT id FROM categoria WHERE nombre='Accesorios' LIMIT 1), 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre='Porta Audífonos');

INSERT INTO producto (nombre, descripcion, precio, stock, imagen, destacado, categoria_id, estado)
SELECT 'Cojín Granny', 'Cojín con cuadrados granny.', 18000, 4, 'https://placehold.co/600x600?text=Cojin', 0, (SELECT id FROM categoria WHERE nombre='Deco Hogar' LIMIT 1), 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre='Cojín Granny');

INSERT INTO producto (nombre, descripcion, precio, stock, imagen, destacado, categoria_id, estado)
SELECT 'Cinta Pelo Twist', 'Cinta con nudo twist.', 5500, 14, 'https://placehold.co/600x600?text=Cinta', 0, (SELECT id FROM categoria WHERE nombre='Ropa' LIMIT 1), 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre='Cinta Pelo Twist');

INSERT INTO producto (nombre, descripcion, precio, stock, imagen, destacado, categoria_id, estado)
SELECT 'Amigurumi Osito', 'Osito café con chaleco.', 17000, 5, 'https://placehold.co/600x600?text=Osito', 0, (SELECT id FROM categoria WHERE nombre='Amigurumis' LIMIT 1), 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre='Amigurumi Osito');

INSERT INTO producto (nombre, descripcion, precio, stock, imagen, destacado, categoria_id, estado)
SELECT 'Set Bazar Rosado', 'Posavasos + mini flor.', 16000, 9, 'https://placehold.co/600x600?text=Set', 0, (SELECT id FROM categoria WHERE nombre='Ediciones Especiales' LIMIT 1), 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre='Set Bazar Rosado');


-- 7) Verificaciones
SELECT 'Total categorias' AS tipo, COUNT(*) AS total FROM categoria
UNION ALL
SELECT 'Total productos' AS tipo, COUNT(*) AS total FROM producto
UNION ALL
SELECT 'Total usuarios' AS tipo, COUNT(*) AS total FROM usuarios;
