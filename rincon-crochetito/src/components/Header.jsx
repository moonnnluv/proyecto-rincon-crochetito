import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";

export default function Header({ cartCount = 0 }) {
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const role = (user?.rol || "").toUpperCase();
  const navCls = ({ isActive }) => "nav-link" + (isActive ? " active" : "");
  const panelPath = role === "VENDEDOR" ? "/vendedor"
                  : (role === "ADMIN" || role === "SUPERADMIN") ? "/admin"
                  : "/mi-cuenta";
  const handleLogout = () => { logout(); nav("/"); };

  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-dark sticky-top shadow-sm">
      <div className="container align-items-center">
        <div className="nav-3zone w-100">
          <div className="left d-flex align-items-center gap-2">
            <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
              <img src="/img/logo.ico" alt="Rincón Crochetito" width="28" height="28" className="rounded" />
              <span>Rincón Crochetito</span>
            </Link>
            <button className="navbar-toggler d-md-none ms-2" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>

          <div id="mainNav" className="center collapse navbar-collapse justify-content-center">
            <ul className="navbar-nav gap-2 navbar-center">
              <li className="nav-item"><NavLink className={navCls} to="/">Home</NavLink></li>
              <li className="nav-item"><NavLink className={navCls} to="/productos">Productos</NavLink></li>
              <li className="nav-item"><NavLink className={navCls} to="/nosotros">Nosotros</NavLink></li>
              <li className="nav-item"><NavLink className={navCls} to="/blogs">Blogs</NavLink></li>
              <li className="nav-item"><NavLink className={navCls} to="/contacto">Contacto</NavLink></li>

              {/* 🔥 NUEVO: enlace directo a /mis-compras */}
              <li className="nav-item"><NavLink className={navCls} to="/mis-compras">Mis compras</NavLink></li>
            </ul>
          </div>

          <div className="right d-flex align-items-center justify-content-end">
            <ul className="navbar-nav align-items-center gap-2">
              {user && (
                <li className="nav-item d-none d-md-block">
                  <Link className="btn btn-outline-light btn-sm" to={panelPath}>
                    {role === "VENDEDOR" ? "Panel Vendedor"
                    : (role === "ADMIN" || role === "SUPERADMIN") ? "Panel Admin" : "Mi cuenta"}
                  </Link>
                </li>
              )}

              <li className="nav-item">
                <NavLink className="nav-link p-0" to="/carrito" aria-label="Carrito">
                  <span className="position-relative d-inline-block px-2 py-1">
                    <i className="bi bi-cart3 fs-5"></i>
                    {cartCount > 0 && (
                      <span
                        className="position-absolute translate-middle badge rounded-pill bg-danger"
                        style={{ top: "-4px", left: "18px", minWidth: 18, height: 18, lineHeight: "18px", fontSize: ".7rem", padding: 0 }}
                      >
                        {cartCount}
                      </span>
                    )}
                  </span>
                </NavLink>
              </li>

              {!user ? (
                <li className="nav-item dropdown">
                  <button className="btn btn-primary btn-sm dropdown-toggle" data-bs-toggle="dropdown">Ingresar</button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li><Link className="dropdown-item" to="/login">Iniciar sesión</Link></li>
                    <li><Link className="dropdown-item" to="/registro">Registro</Link></li>
                  </ul>
                </li>
              ) : (
                <li className="nav-item dropdown">
                  <button className="nav-link dropdown-toggle bg-transparent border-0" data-bs-toggle="dropdown">
                    <i className="bi bi-person-circle"></i> <span>{user.email}</span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <Link className="dropdown-item" to={panelPath}>
                        {role === "VENDEDOR" ? "Panel Vendedor"
                        : (role === "ADMIN" || role === "SUPERADMIN") ? "Panel Admin" : "Mi cuenta"}
                      </Link>
                    </li>
                    <li><Link className="dropdown-item" to="/pedidos">Mis pedidos</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item" type="button" onClick={handleLogout}>
                        Cerrar sesión
                      </button>
                    </li>
                  </ul>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
