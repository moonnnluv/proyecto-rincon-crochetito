# Rincón Crochetito 🧶 – Proyecto Fullstack

Aplicación web para la tienda online **Rincón Crochetito**, desarrollada como parte de la Experiencia 3 de Desarrollo Fullstack.

El sistema está dividido en:

- **Backend** (API REST con Spring Boot + JWT)
- **Frontend** (SPA en React con Vite)

Este README explica cómo instalar, configurar y ejecutar ambos componentes, además de resumir el uso de JWT, el manejo de boletas y las pruebas automatizadas.

---

## 🧩 Tecnologías principales

**Backend**

- Java 17+
- Spring Boot
- Spring Web, Spring Data JPA, Spring Security
- JWT (autenticación)
- Hibernate / JPA
- Base de datos relacional (MySQL u otra, según `application.properties`)
- Swagger / OpenAPI

**Frontend**

- React 18
- Vite
- React Router DOM
- Context API (`AuthContext`, `CartContext`)
- Fetch API centralizada en `src/services/api.js`
- Vitest + React Testing Library

---

## 📁 Estructura del proyecto

```txt
BACK-END/                # API REST Spring Boot (EA3) - proyecto en BACK-END/crochet
FRONT-END/               # Frontend React + Vite (EA3)
EA1-EA2/FRONT-END-HTML/  # Frontend antiguo en HTML (EA1–EA2)
documentacion/           # ERS, testing, PDFs
README.md

```

---

# 🛠 Backend – API REST (Spring Boot)

## ✅ Requisitos

- Java 17+
- Maven 3.x
- Motor de base de datos configurado (MySQL recomendado)

## ⚙️ Configuración

1. Ir a la carpeta del backend:

```bash
cd backend
```

2. Configurar `src/main/resources/application.properties` (ejemplo):

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/rincon_crochetito
spring.datasource.username=tu_usuario
spring.datasource.password=tu_password

spring.jpa.hibernate.ddl-auto=update

# JWT
app.jwt.secret=TU_SECRET_SEGURO_AQUI
app.jwt.expiration=3600000   # 1 hora en milisegundos
```

3. (Opcional) Ejecutar scripts SQL con tablas y datos de prueba si los tienes en archivos separados.

## ▶️ Ejecutar backend

```bash
mvn spring-boot:run
```

Por defecto quedará disponible en:

```text
http://localhost:8080
```

### Endpoints principales (ejemplos)

- Autenticación:
  - `POST /api/v1/auth/login`
- Usuarios:
  - `GET /api/usuarios`
  - `POST /api/usuarios`
- Productos:
  - `GET /api/productos`
  - `POST /api/productos`
- Boletas:
  - `GET /api/boletas`
  - `POST /api/boletas`

### Swagger / OpenAPI

Si está habilitado springdoc-openapi:

- `http://localhost:8080/swagger-ui/index.html`
- `http://localhost:8080/v3/api-docs`

---

## 🧪 Tests – Backend

Desde la carpeta `backend`:

```bash
mvn test
```

Se incluyen, entre otros:

- `CrochetApplicationTests`  
  Verifica que el contexto de Spring levanta correctamente.

- Tests de servicios:
  - `UserServicesTest`
  - `ProductoServicesImplTest`
  - `BoletaServiceImplTest`

- Test de autenticación:
  - `AuthRestControllerTest`
    - `200` + token y datos con credenciales válidas.
    - `401` cuando la contraseña es incorrecta.
    - `401` cuando el usuario no existe.
    - `400` cuando el email no cumple la validación.

Con esto se cubre la lógica de negocio básica y el flujo de login con JWT.

---

# 💻 Frontend – React (Vite)

## ✅ Requisitos

- Node.js 18+
- npm (o pnpm / yarn, si lo prefieres)

## ⚙️ Configuración

1. Ir a la carpeta del frontend:

```bash
cd frontend
```

2. Instalar dependencias:

```bash
npm install
```

3. Crear `.env.local` con la URL del backend:

```env
# Desarrollo local: backend en localhost:8080
VITE_API_BASE_URL=http://localhost:8080/api
```

> En producción, si el front se sirve desde el mismo dominio del back:
>
> ```env
> VITE_API_BASE_URL=/api
> ```

## ▶️ Ejecutar frontend

```bash
npm run dev
```

Por defecto, Vite levanta en:

```text
http://localhost:5173
```

El frontend se comunica con el backend usando `VITE_API_BASE_URL` y envía el JWT en el header:

```http
Authorization: Bearer <token>
```

---

## 🔐 Autenticación, roles y rutas protegidas

### Flujo de login

1. El usuario ingresa email y contraseña en `/login`.
2. El frontend hace `POST` a `POST /api/v1/auth/login`.
3. El backend valida credenciales con Spring Security + BCrypt y responde con:

```json
{
  "token": "JWT_AQUI",
  "id": 1,
  "nombre": "Admin Crochetito",
  "email": "admin@crochetito.cl",
  "rol": "SUPERADMIN",
  "estado": "ACTIVO"
}
```

4. El frontend guarda en `localStorage`:
   - `rc_token` → JWT
   - `rc_user` → datos del usuario
   - `rc_admin_id` → para roles `ADMIN` / `SUPERADMIN`

5. Las llamadas protegidas usan el header `Authorization: Bearer <token>`.

### Manejo de expiración del token

- Al montar la app, el `AuthContext` decodifica el JWT:
  - Si está expirado, limpia sesión (`rc_token`, `rc_user`, `rc_admin_id`).
- En `api.js`, si el backend responde `401` o `403`:
  - Se limpian los datos de sesión.
  - Se redirige al usuario a `/login`.

### Roles principales

- `CLIENTE`
- `VENDEDOR`
- `ADMIN`
- `SUPERADMIN`

Las rutas se protegen con `ProtectedRoute`, por ejemplo:

- `/admin` (Admin / Superadmin)
- `/admin/usuarios`, `/admin/productos`, `/admin/boletas`
- `/vendedor` (Vendedor)
- `/mi-cuenta`, `/pedidos` (Cliente autenticado)

---

## 🧺 Carrito, boletas y dashboard

- **Carrito de compras**
  - Manejado por `CartContext`.
  - Se guarda en `localStorage` (`rc_cart`) para persistir entre recargas.
- **Checkout + emisión de boleta**
  - Desde el carrito se realiza el checkout.
  - El frontend llama al backend para crear la boleta (y opcionalmente crear usuario desde el checkout).
- **Historial de compras**
  - Cliente: puede ver sus boletas y detalle.
  - Admin: ve todas las boletas en el panel.
- **Dashboard Admin**
  - Gestión de usuarios (altas/bajas/cambios de estado).
  - Gestión de productos (creación, edición, stock, imagen).
  - Visualización de compras y productos con stock bajo.

---

## 🧪 Tests – Frontend

Desde `frontend`:

```bash
npm run test
# o
npm run test:ui
```

Se incluyen pruebas con **Vitest** y **React Testing Library** para:

- `authContext`:
  - Login exitoso (token, usuario, `rc_admin_id`).
  - Login 401 (credenciales inválidas).
  - Logout (limpia `localStorage`).
  - Token expirado al montar.
- `cartContext`:
  - Agregar / actualizar / eliminar productos, cálculo de totales.
- `ProtectedRoute`:
  - Redirecciones según autenticación y rol.
- Componentes y páginas:
  - `Header`, `Productos`, `Login`, `Checkout`, etc.

---

## 🔑 Credenciales de prueba

> Rellena con los usuarios reales que tengas en la BD.

| Rol         | Email                        | Contraseña  |
|------------|------------------------------|-------------|
| SUPERADMIN | `admin@crochetito.cl`        | `12345678`  |
| ADMIN      | `admin2@crochetito.cl`       | `12345678`  |
| VENDEDOR   | `alonso@crochetito.cl`     | `12345678`  |
| CLIENTE    | `test@gmail.com`      | `Test123456`  |


---

## 📎 Notas finales

- Este README reemplaza versiones anteriores que tenían contenido de error al intentar cargar desde GitHub.
- Ajusta nombres de carpetas, URL del repositorio y credenciales de prueba según tu entorno real.

---

## 👩‍💻 Autora

Proyecto desarrollado por [Alejandra Reyes](https://github.com/moonnnluv) como parte de la Experiencia 3 de Desarrollo Fullstack II – Duoc UC.  
Marca y contenido: **Rincón Crochetito 🧶**
