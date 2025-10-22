
# Rincón Crochetito

E‑commerce simple para productos tejidos a crochet. Proyecto académico con **frontend en React (Vite)** y **backend en Spring Boot**. Incluye catálogo, carrito, autenticación básica de usuarios (sin JWT en esta etapa), y un módulo administrativo para gestionar productos.

---

## 📌 Descripción del proyecto

- **Catálogo público** con destacados, detalle de producto y carrito.
- **Autenticación simple** por email/contraseña (en BD), con roles `ADMIN` y `CLIENTE`.
- **Administración**: CRUD de productos (crear, editar, cambiar stock, activar/inhabilitar), y CRUD de usuarios (opcional según entrega).
- **Control de stock** y visibilidad por `estado` (`ACTIVO`/`INACTIVO`).
- **API REST** expuesta desde `/api/**`. Documentable con Swagger / Postman.

> Nota: En esta entrega **no** hay JWT. El `login` retorna datos básicos del usuario validado y el front mantiene sesión en memoria/localStorage.

---

## 🧰 Tecnologías utilizadas

**Frontend**

- React 18 + Vite
- React Router
- Context API (`AuthProvider`, `CartProvider`)
- Fetch API
- CSS/Tailwind (según rama)

**Backend**

- Java 17+, Spring Boot 3+
- Spring Web, Spring Data JPA, Spring Security (solo para `PasswordEncoder`)
- Bean Validation (Jakarta Validation)
- Base de datos: MySQL/MariaDB
- (Opcional) springdoc-openapi para Swagger UI

**DevOps / Otros**

- Maven
- .env para variables del front (Vite)
- `application.properties` para el backend

---

## 📦 Estructura (sugerida)

```
root/
├─ backend/
│  ├─ src/main/java/com/crochet/crochet/...
│  ├─ src/main/resources/
│  │  ├─ application.properties
│  │  └─ data.sql                 # seed de productos (opcional)
│  └─ pom.xml
│
├─ frontend/
│  ├─ src/
│  │  ├─ context/ (AuthProvider, CartProvider)
│  │  ├─ pages/ (Home, ProductoDetalle, Admin/*)
│  │  └─ components/
│  ├─ .env.local                  # VITE_API_BASE_URL
│  ├─ index.html
│  └─ package.json
│
└─ docs/
   ├─ postman/RinconCrochetito.postman_collection.json (opcional)
   └─ swagger/ (si haces export)
```

---

## ⚙️ Requisitos previos

- Node.js 18+ y npm
- JDK 17+
- Maven 3.9+
- MySQL/MariaDB en local (usuario con permisos de crear/esquema)

---

## 🔐 Variables y configuración

### Backend — `application.properties`

Ejemplo mínimo:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/crochetito?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=tu_password
spring.jpa.hibernate.ddl-auto=update   # para dev: create, update, none
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# (Opcional) Swagger con springdoc
# springdoc.api-docs.enabled=true
# springdoc.swagger-ui.enabled=true
```

### Frontend — `.env.local`

> Importante: la base **ya incluye** `/api`.

```bash
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## 🧪 Datos de prueba (seed)

### Productos — `backend/src/main/resources/data.sql` (opcional)

> Si usas `spring.jpa.hibernate.ddl-auto=create` o `update`, al levantar la app se ejecutará `data.sql` (si existe).

```sql
INSERT INTO producto (id, nombre, descripcion, precio, imagen, stock, estado, destacado, fecha_creacion)
VALUES
  (1,'Porta Encendedor/Labial Honguito','Funda a crochet en forma de hongo para encendedor o labial, con asa para colgar.',4500,'img/no_producto.png',12,'ACTIVO',true, NOW()),
  (2,'Cintillo Malla','Cintillo tejido en punto malla, cómodo y estiloso.',6000,'img/no_producto.png',8,'ACTIVO',true, NOW()),
  (3,'Posavasos Rosas','Set de posavasos tejidos en tonos rosados, 4 unidades.',7000,'img/no_producto.png',15,'ACTIVO',true, NOW());
```

### Usuarios — crear vía API (recomendado)

Como el backend encripta contraseñas con `PasswordEncoder`, crea usuarios mediante el endpoint de usuarios para evitar tener que calcular hashes en el seed SQL. Ejemplos (desde terminal):

```bash
# ADMIN
curl -X POST http://localhost:8080/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Admin",
    "email": "admin@crochetito.cl",
    "password": "Admin123*",
    "rol": "ADMIN",
    "estado": "ACTIVO"
  }'

# CLIENTE
curl -X POST http://localhost:8080/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Cliente Demo",
    "email": "cliente@crochetito.cl",
    "password": "User123*",
    "rol": "CLIENTE",
    "estado": "ACTIVO"
  }'
```

> Si tu servicio no expone `POST /api/usuarios`, puedes temporalmente insertar con `{noop}contraseña` y un `DelegatingPasswordEncoder`, o generar un hash BCrypt y cargarlo en SQL.

---

## ▶️ Instrucciones de instalación y ejecución

### 1) Backend

```bash
cd backend
mvn clean spring-boot:run
```

- La API quedará en: `http://localhost:8080/api`
- Si activaste Swagger (springdoc), UI en: `http://localhost:8080/swagger-ui/index.html`

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

- Front en: `http://localhost:5173`
- El front leerá `VITE_API_BASE_URL` y hará peticiones a `/api`.

---

## 🔑 Credenciales de prueba

Puedes usar las siguientes **credenciales de demo** (coinciden con las de tus capturas). Asegúrate de **crear estos usuarios vía API** para que el backend guarde la contraseña en **bcrypt**.

- **ADMIN**\
  Email: `admin@crochetito.cl`\
  Clave: `12345678`

- **CLIENTE**\
  Email: `alonso@crochetito.cl`\
  Clave: `12345678`

- **CLIENTE**\
  Email: `emilia@gmail.com`\
  Clave: `12345678`

- **CLIENTE**\
  Email: `test@gmail.com`\
  Clave: `Test123456`

> Si ya tenías creadas las credenciales anteriores del ejemplo (`admin@crochetito.cl / Admin123*`, `cliente@crochetito.cl / User123*`), también sirven mientras existan en BD.

**Creación rápida (curl):**

```bash
# ADMIN
curl -X POST http://localhost:8080/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Admin",
    "email": "admin@crochetito.cl",
    "password": "12345678",
    "rol": "ADMIN",
    "estado": "ACTIVO"
  }'

# CLIENTES
curl -X POST http://localhost:8080/api/usuarios -H "Content-Type: application/json" -d '{
  "nombre": "Alonso",
  "email": "alonso@crochetito.cl",
  "password": "12345678",
  "rol": "CLIENTE",
  "estado": "ACTIVO"
}'

curl -X POST http://localhost:8080/api/usuarios -H "Content-Type: application/json" -d '{
  "nombre": "Emilia",
  "email": "emilia@gmail.com",
  "password": "12345678",
  "rol": "CLIENTE",
  "estado": "ACTIVO"
}'

curl -X POST http://localhost:8080/api/usuarios -H "Content-Type: application/json" -d '{
  "nombre": "Usuario Test",
  "email": "test@gmail.com",
  "password": "Test123456",
  "rol": "CLIENTE",
  "estado": "ACTIVO"
}'
```

> **Tip:** si el login falla en el front con estas claves, es porque el usuario no está creado en BD o la contraseña no está encriptada. Crea el usuario vía API para que el servicio la encripte.

---

## 🛣️ Endpoints principales (resumen) (resumen)

### Auth

- `POST /api/auth/login`
  - **Body**: `{ "email": "...", "password": "..." }`
  - **200**: `UsuarioDTO { id, nombre, email, rol, estado }`
  - **401**: credenciales inválidas
  - **403**: usuario inactivo

### Productos

- `GET /api/productos?destacado=true` → lista de destacados (sólo activos con stock)
- `GET /api/productos/{id}` → detalle
- `POST /api/productos` (ADMIN) → crea
- `PUT /api/productos/{id}` (ADMIN) → edita
- `PATCH /api/productos/{id}/stock?cantidad=...` (ADMIN) → cambia stock
- `PATCH /api/productos/{id}/estado?valor=INACTIVO|ACTIVO` (ADMIN) → inhabilita/activa
- `DELETE /api/productos/{id}` (ADMIN) → elimina

### Usuarios (opcional para esta entrega)

- `GET /api/usuarios` (ADMIN)
- `POST /api/usuarios` (ADMIN)
- `PUT /api/usuarios/{id}` (ADMIN)
- `PATCH /api/usuarios/{id}/estado` (ADMIN)

> Los paths pueden variar según tu implementación. Ajusta este cuadro a tu controlador real.

---

## 🧾 Documentación de API

### Opción A: Swagger (recomendado)

1. Agrega al `pom.xml` del backend:
   ```xml
   <dependency>
     <groupId>org.springdoc</groupId>
     <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
     <version>2.5.0</version>
   </dependency>
   ```
2. Levanta el backend y abre: `http://localhost:8080/swagger-ui/index.html`
3. Exporta la especificación si necesitas adjuntarla en `docs/swagger/`.

### Opción B: Postman Collection

1. Importa la colección de ejemplo `docs/postman/RinconCrochetito.postman_collection.json` (incluye variables `baseUrl` y ejemplos de `login` y `productos`).
2. Ajusta `baseUrl` a `http://localhost:8080/api`.

> Puedes generar la colección automáticamente desde Swagger con extensiones de Postman o guardarla manualmente.

---

## 🧭 Frontend: notas de uso

- El front asume `VITE_API_BASE_URL` **incluye** `/api` y normaliza la URL sin `/` final.
- `Home` carga destacados desde `GET /productos?destacado=true`, filtra `ACTIVO` y `stock>0`.
- `AuthProvider` guarda el `UsuarioDTO` al iniciar sesión y controla las vistas admin.
- `CartProvider` permite agregar/quitar productos y calcular totales.

---

## 🧯 Troubleshooting

- **El front no carga / no llega a la API** → Revisa `VITE_API_BASE_URL` y CORS en backend.
- **Login falla pero el usuario existe** → Verifica que la contraseña esté **bcrypt** en BD o crea el usuario por API (el servicio encripta automáticamente).
- ``** no corre** → Asegúrate del `ddl-auto` y que la tabla existe. En dev usa `update` o `create`.
- **Stock/estado no actualiza** → Confirma que el endpoint sea `PATCH`/`PUT` correcto y que el front use la ruta real.

---

## ✅ Checklist para la entrega

-

---

## 📄 Licencia

Proyecto académico — uso educativo.

---

## 👩🏻‍💻 Autores

- Equipo **Rincón Crochetito** — Duoc UC (2025)

