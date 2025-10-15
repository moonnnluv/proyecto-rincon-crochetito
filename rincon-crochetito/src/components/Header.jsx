import { NavLink, Link } from "react-router-dom";

export default function Header({ user = null, cartCount = 0 }) {
    return (
        <nav className="navbar navbar-expand-md navbar-dark bg-dark sticky-top shadow-sm">
        <div className="container align-items-center">
            {/* Marca */}
            <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
            <img src="/img/logo.ico" alt="Rincón Crochetito" width="28" height="28" className="rounded" />
            <span>Rincón Crochetito</span>
            </Link>

            {/* Toggler */}
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav"
            aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
            </button>

            {/* Menú */}
            <div className="collapse navbar-collapse justify-content-center" id="mainNav">
            {/* Links al centro */}
            <ul className="navbar-nav gap-2 navbar-center">
                <li className="nav-item"><NavLink className="nav-link" to="/">Home</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/productos">Productos</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/nosotros">Nosotros</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/blog">Blogs</NavLink></li>
                <li className="nav-item"><NavLink className="nav-link" to="/contacto">Contacto</NavLink></li>
            </ul>

            {/* Acciones derecha */}
            <ul className="navbar-nav align-items-center gap-2 ms-auto">
                {/* Carrito */}
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

                {/* Ingresar / Usuario */}
                {!user ? (
                <li className="nav-item dropdown">
                    <button className="btn btn-primary btn-sm dropdown-toggle" data-bs-toggle="dropdown">
                    Ingresar
                    </button>
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
                    <li><Link className="dropdown-item" to="/mi-cuenta">Mi cuenta</Link></li>
                    <li><Link className="dropdown-item" to="/pedidos">Mis pedidos</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item" type="button">Cerrar sesión</button></li>
                    </ul>
                </li>
                )}
            </ul>
            </div>
        </div>
        </nav>
    );
}
