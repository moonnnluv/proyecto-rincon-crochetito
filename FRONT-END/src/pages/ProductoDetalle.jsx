import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProducto } from "../services/api.js";
import { useCart } from "../context/cartContext.jsx";

const IMG_FALLBACK = "/img/no_producto.png";
const CLP = new Intl.NumberFormat("es-CL");

function normalizeImg(path) {
  if (!path) return IMG_FALLBACK;
  if (path.startsWith("http") || path.startsWith("data:") || path.startsWith("/")) return path;
  return "/" + path.replace(/^\.?\//, "");
}

export default function ProductoDetalle() {
  const { id } = useParams();
  const nav = useNavigate();
  const { items, add } = useCart();

  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState(null); // datos del popup

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getProducto(id)
      .then((raw) => {
        if (!alive) return;
        const precio = raw?.precio ?? raw?.price ?? 0;
        const stock = raw?.stock ?? raw?.cantidad ?? 0;
        const estado =
          raw?.estado ?? (raw?.activo === false ? "INACTIVO" : "ACTIVO");
        const imagen = normalizeImg(
          raw?.imagenUrl || raw?.imagen || raw?.imagen_path
        );
        setP({
          id: raw?.id,
          nombre: raw?.nombre || raw?.titulo || "Producto",
          descripcion: raw?.descripcion || raw?.detalle || "",
          precio,
          stock,
          estado,
          imagen,
        });
      })
      .finally(() => alive && setLoading(false));
    return () => (alive = false);
  }, [id]);

  const disponible = useMemo(
    () => (p?.estado ?? "ACTIVO") === "ACTIVO" && (p?.stock ?? 0) > 0,
    [p]
  );

  // cerrar popup automáticamente después de 3 segundos
  useEffect(() => {
    if (!notif) return;
    const t = setTimeout(() => setNotif(null), 3000);
    return () => clearTimeout(t);
  }, [notif]);

  const handleAgregarAlCarrito = () => {
    if (!p || !disponible) return;

    const stock = p.stock ?? 0;
    const enCarrito = items.find((it) => it.id === p.id);
    const qtyActual = enCarrito?.qty ?? 0;

    // caso: ya alcanzó el stock máximo
    if (qtyActual >= stock) {
      setNotif({
        nombre: p.nombre,
        qty: qtyActual,
        precioUnitario: p.precio ?? 0,
        totalProducto: qtyActual * (p.precio ?? 0),
        tipo: "stock", // 👈 para mostrar mensaje distinto
      });
      return;
    }

    const nuevaQty = Math.min(qtyActual + 1, stock);

    add(
      {
        id: p.id,
        nombre: p.nombre,
        precio: p.precio,
        stock: p.stock, // guardamos stock en el item
        imagen: p.imagen,
      },
      1
    );

    // caso normal: se agregó al carrito
    setNotif({
      nombre: p.nombre,
      qty: nuevaQty,
      precioUnitario: p.precio ?? 0,
      totalProducto: nuevaQty * (p.precio ?? 0),
      tipo: "ok",
    });
  };

  if (loading) {
    return (
      <section className="container">
        <p>Cargando...</p>
      </section>
    );
  }
  if (!p) {
    return (
      <section className="container">
        <p>No se encontró el producto.</p>
        <button className="btn" onClick={() => nav(-1)}>
          Volver
        </button>
      </section>
    );
  }

  return (
    <section className="container">
      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <img
            src={p.imagen || IMG_FALLBACK}
            alt={p.nombre}
            className="img-fluid rounded border"
            onError={(e) => (e.currentTarget.src = IMG_FALLBACK)}
          />
        </div>

        <div className="col-12 col-lg-6">
          <h3>{p.nombre}</h3>
          <div className="mb-2">
            <strong>${CLP.format(p.precio ?? 0)}</strong>
          </div>

          <div className="d-flex gap-2 align-items-center mb-3">
            {(p.estado ?? "ACTIVO") === "ACTIVO" ? (
              <span className="badge bg-success">ACTIVO</span>
            ) : (
              <span className="badge bg-secondary">INACTIVO</span>
            )}
            <span
              className={`badge ${
                (p.stock ?? 0) < 5
                  ? "bg-warning text-dark"
                  : "bg-light text-dark"
              }`}
            >
              {p.stock ?? 0} en stock
            </span>
          </div>

          <p className="text-muted">{p.descripcion}</p>

          <div className="d-flex gap-2 mt-3">
            <button
              className="btn btn-outline-dark"
              onClick={() => nav(-1)}
            >
              Volver
            </button>
            <button
              className="btn btn-primary"
              disabled={!disponible}
              onClick={handleAgregarAlCarrito}
            >
              {disponible ? "Agregar al carrito" : "No disponible"}
            </button>
          </div>
        </div>
      </div>

      {/* MINI CARRITO / TOAST */}
      {notif && (
        <div
          className="position-fixed top-0 end-0 p-3"
          style={{ zIndex: 1080 }}
        >
          <div className="card shadow border-0" style={{ width: "18rem" }}>
            <div className="card-body">
              <button
                type="button"
                className="btn-close float-end"
                onClick={() => setNotif(null)}
              ></button>

              <h6 className="card-title mb-1">{notif.nombre}</h6>
              <small className="text-muted">
                {notif.qty} × ${CLP.format(notif.precioUnitario)}
              </small>

              <p className="mt-2 mb-1 fw-semibold">
                {notif.tipo === "stock"
                  ? "Ya agregaste todo el stock disponible de este producto 👜"
                  : "¡Agregado al carrito!"}
              </p>

              <div className="d-flex justify-content-between align-items-center mt-2">
                <span className="fw-bold">
                  ${CLP.format(notif.totalProducto)}
                </span>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => {
                    setNotif(null);
                    nav("/carrito");
                  }}
                >
                  Ver carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
