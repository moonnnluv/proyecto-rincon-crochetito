// src/App.jsx
import { Routes, Route, Link, Navigate, useParams } from "react-router-dom";

import Topbar from "./components/Topbar.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";

import Home from "./pages/Home.jsx";
import Productos from "./pages/Productos.jsx";
import ProductoDetalle from "./pages/ProductoDetalle.jsx";
import CrearProducto from "./pages/CrearProducto.jsx";
import EditarProd from "./pages/EditarProd.jsx";

import Nosotros from "./pages/Nosotros.jsx";
import Blogs from "./pages/Blogs.jsx";
import BlogPost from "./pages/BlogPost.jsx";

import Carrito from "./pages/Carrito.jsx";
import Contacto from "./pages/Contacto/Contacto.jsx";

import Login from "./pages/Login.jsx";
import Registro from "./pages/Registro.jsx";
import MiCuenta from "./pages/MiCuenta.jsx";
import Pedidos from "./pages/Pedidos.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Admin – Usuarios
import Usuarios from "./pages/admin/Usuarios/Usuarios.jsx";
import UsuarioForm from "./pages/admin/Usuarios/UsuarioForm.jsx";

// Admin – Productos
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminProductos from "./pages/admin/Productos/Productos.jsx";
import AdminProductoForm from "./pages/admin/Productos/ProductoForm.jsx";
import Boleta from "./pages/Boleta.jsx";

/* ===== Helpers inline ===== */

/** 404 */
function NotFound() {
  return (
    <div className="container">
      <h2>Página no encontrada</h2>
      <Link className="btn btn-outline-dark" to="/">Volver al inicio</Link>
    </div>
  );
}

/** Redirección dinámica /admin/editar/:id -> /admin/productos/:id */
function RedirectEditar() {
  const { id } = useParams();
  return <Navigate to={`/admin/productos/${id}`} replace />;
}

/** Wrapper para Admin: exige rol ADMIN/SUPERADMIN y aplica .rc-admin */
function AdminRoute({ children }) {
  return (
    <ProtectedRoute roles={["SUPERADMIN", "ADMIN"]}>
      <div className="rc-admin">{children}</div>
    </ProtectedRoute>
  );
}

/** Wrapper para Vendedor: exige rol VENDEDOR */
function VendedorRoute({ children }) {
  return <ProtectedRoute roles={["VENDEDOR"]}>{children}</ProtectedRoute>;
}

/** Panel de vendedor placeholder (reemplázalo por tu componente real) */
function VendedorDashboard() {
  return (
    <section className="container">
      <h2>Panel del Vendedor</h2>
      <p>Acá va el dashboard del vendedor (pedidos, catálogo propio, etc.).</p>
    </section>
  );
}

export default function App() {
  return (
    <div className="app">
      <Topbar />
      <Header />

      <main className="main container-fluid px-3 py-4">
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/producto/:id" element={<ProductoDetalle />} />
          <Route path="/nosotros" element={<Nosotros />} />

          {/* Blog (con alias /blog -> /blogs) */}
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blog" element={<Navigate to="/blogs" replace />} />
          <Route path="/blog/:slug" element={<BlogPost />} />

          {/* Contacto (alias /contact -> /contacto) */}
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/contact" element={<Navigate to="/contacto" replace />} />

          {/* Carrito */}
          <Route path="/carrito" element={<Carrito />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Cuenta (protegidas – cualquier rol logueado) */}
          <Route
            path="/mi-cuenta"
            element={
              <ProtectedRoute roles={["CLIENTE", "VENDEDOR", "ADMIN", "SUPERADMIN"]}>
                <MiCuenta />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pedidos"
            element={
              <ProtectedRoute roles={["CLIENTE", "VENDEDOR", "ADMIN", "SUPERADMIN"]}>
                <Pedidos />
              </ProtectedRoute>
            }
          />

          {/* Vendedor */}
          <Route
            path="/vendedor"
            element={
              <VendedorRoute>
                <VendedorDashboard />
              </VendedorRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Admin – Usuarios */}
          <Route
            path="/admin/usuarios"
            element={
              <AdminRoute>
                <Usuarios />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/usuarios/nuevo"
            element={
              <AdminRoute>
                <UsuarioForm />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/usuarios/:id"
            element={
              <AdminRoute>
                <UsuarioForm />
              </AdminRoute>
            }
          />

          {/* Admin – Productos */}
          <Route
            path="/admin/productos"
            element={
              <AdminRoute>
                <AdminProductos />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/productos/nuevo"
            element={
              <AdminRoute>
                <AdminProductoForm />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/productos/:id"
            element={
              <AdminRoute>
                <AdminProductoForm />
              </AdminRoute>
            }
          />

          {/* Compat: rutas antiguas del admin para productos */}
          <Route path="/admin/crear" element={<Navigate to="/admin/productos/nuevo" replace />} />
          <Route path="/admin/editar/:id" element={<RedirectEditar />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />

          <Route path="/boleta" element={<Boleta />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
