// src/App.jsx
import { useEffect, useState } from "react";
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

// Admin – Boletas
import BoletasAdmin from "./pages/admin/BoletasAdmin.jsx";

import Boleta from "./pages/Boleta.jsx";
import Checkout from "./pages/Checkout.jsx";
import MisCompras from "./pages/MisCompras.jsx";

import api from "./services/api.js";
import { useAuth } from "./context/authContext.jsx";

const fmtCLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
});

/* ===== Helpers inline ===== */

/** 404 */
function NotFound() {
  return (
    <div className="container my-4">
      <h2>Página no encontrada</h2>
      <Link className="btn btn-outline-dark" to="/">
        Volver al inicio
      </Link>
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

/** Wrapper para Vendedor: exige rol VENDEDOR y aplica también .rc-admin */
function VendedorRoute({ children }) {
  return (
    <ProtectedRoute roles={["VENDEDOR"]}>
      <div className="rc-admin">{children}</div>
    </ProtectedRoute>
  );
}

/** Helper fecha corta */
function formatFecha(fechaIso) {
  if (!fechaIso) return "";
  const d = new Date(fechaIso);
  return d.toLocaleString("es-CL", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

/** Panel de vendedor: mini dashboard de ventas */
function VendedorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBoletas: 0,
    totalHoy: 0,
    totalMonto: 0,
    ultimas: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        // Traemos TODAS las boletas (back ya protegido con JWT)
        const data = await api.get("/boletas");
        const list = Array.isArray(data) ? data : [];

        const hoy = new Date();
        const hoyStr = hoy.toISOString().slice(0, 10); // yyyy-mm-dd

        let totalBoletas = list.length;
        let totalHoy = 0;
        let totalMonto = 0;

        list.forEach((b) => {
          const fecha = b.fecha ? new Date(b.fecha) : null;
          if (fecha) {
            const fStr = fecha.toISOString().slice(0, 10);
            if (fStr === hoyStr) totalHoy++;
          }
          totalMonto += b.total ?? 0;
        });

        // últimas 5 boletas ordenadas por fecha desc
        const ultimas = [...list]
          .sort(
            (a, b) =>
              new Date(b.fecha || 0).getTime() -
              new Date(a.fecha || 0).getTime()
          )
          .slice(0, 5);

        setStats({ totalBoletas, totalHoy, totalMonto, ultimas });
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las estadísticas de ventas.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <section className="admin-wrap">
      <div className="admin-head">
        <div>
          <h2>Panel del vendedor</h2>
          <p className="muted" style={{ margin: 0 }}>
            {user ? (
              <>
                Hola <strong>{user.nombre || user.email}</strong>. Aquí tienes
                un resumen de las ventas de la tienda.
              </>
            ) : (
              <>Resumen de ventas de la tienda.</>
            )}
          </p>
        </div>
      </div>

      {loading && <p>Cargando estadísticas...</p>}
      {error && <div className="err">{error}</div>}

      {!loading && !error && (
        <>
          <div className="cards">
            {/* Compras totales */}
            <div className="card">
              <div className="kpi">{stats.totalBoletas}</div>
              <div className="kpi-label">Compras totales</div>
              <Link className="btn small" to="/admin/boletas">
                Ver todas
              </Link>
            </div>

            {/* Compras de hoy */}
            <div className="card">
              <div className="kpi">{stats.totalHoy}</div>
              <div className="kpi-label">Compras de hoy</div>
              <Link className="btn small" to="/admin/boletas">
                Ver detalle
              </Link>
            </div>

            {/* Total vendido */}
            <div className="card">
              <div className="kpi">{fmtCLP.format(stats.totalMonto)}</div>
              <div className="kpi-label">Total vendido (histórico)</div>
              <Link className="btn small" to="/pedidos">
                Ver pedidos
              </Link>
            </div>
          </div>

          <h3 style={{ marginTop: 8 }}>Últimas compras registradas</h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th className="text-end">Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {stats.ultimas.length === 0 && (
                  <tr>
                    <td colSpan={5}>Aún no hay compras registradas.</td>
                  </tr>
                )}
                {stats.ultimas.map((b, idx) => (
                  <tr key={b.id ?? idx}>
                    <td>{idx + 1}</td>
                    <td>{formatFecha(b.fecha)}</td>
                    <td>{b.clienteNombre || "Invitado"}</td>
                    <td className="text-end">
                      {fmtCLP.format(b.total ?? 0)}
                    </td>
                    <td>
                      {b.id && (
                        <Link className="btn small" to={`/boleta/${b.id}`}>
                          Ver
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="muted" style={{ marginTop: 12 }}>
            Desde este panel puedes revisar todas las compras registradas y el
            detalle de cada boleta. El administrador mantiene la gestión de
            usuarios y configuración general.
          </p>
        </>
      )}
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
              <ProtectedRoute
                roles={["CLIENTE", "VENDEDOR", "ADMIN", "SUPERADMIN"]}
              >
                <MiCuenta />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pedidos"
            element={
              <ProtectedRoute
                roles={["CLIENTE", "VENDEDOR", "ADMIN", "SUPERADMIN"]}
              >
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

          {/* Admin – Boletas (VENDEDOR + ADMIN + SUPERADMIN) */}
          <Route
            path="/admin/boletas"
            element={
              <ProtectedRoute roles={["VENDEDOR", "ADMIN", "SUPERADMIN"]}>
                <div className="rc-admin">
                  <BoletasAdmin />
                </div>
              </ProtectedRoute>
            }
          />

          {/* Compat: rutas antiguas del admin para productos */}
          <Route
            path="/admin/crear"
            element={<Navigate to="/admin/productos/nuevo" replace />}
          />
          <Route path="/admin/editar/:id" element={<RedirectEditar />} />

          {/* Boleta + Checkout + Mis compras */}
          <Route path="/boleta" element={<Boleta />} />
          <Route path="/boleta/:id" element={<Boleta />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/mis-compras" element={<MisCompras />} />

          {/* 404 (SIEMPRE AL FINAL) */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
