// src/App.jsx
import { Routes, Route, Link, Navigate } from "react-router-dom";

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

// Admin – Usuarios (tu estructura actual)
import Usuarios from "./pages/admin/Usuarios/Usuarios.jsx";
import UsuarioForm from "./pages/admin/Usuarios/UsuarioForm.jsx";

// Admin – Nuevos módulos
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminProductos from "./pages/admin/Productos/Productos.jsx";
import AdminProductoForm from "./pages/admin/Productos/ProductoForm.jsx";

function NotFound() {
  return (
    <div className="container">
      <h2>Página no encontrada</h2>
      <Link className="btn btn-outline-dark" to="/">Volver al inicio</Link>
    </div>
  );
}

/** Wrapper para aislar estilos del Admin (clase .rc-admin) */
function AdminRoute({ children }) {
  return (
    <ProtectedRoute>
      <div className="rc-admin">
        {children}
      </div>
    </ProtectedRoute>
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

          {/* Cuenta (protegidas) */}
          <Route
            path="/mi-cuenta"
            element={
              <ProtectedRoute>
                <MiCuenta />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pedidos"
            element={
              <ProtectedRoute>
                <Pedidos />
              </ProtectedRoute>
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
          <Route path="/admin/editar/:id" element={<Navigate to="/admin/productos/:id" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
