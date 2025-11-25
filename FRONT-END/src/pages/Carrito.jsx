import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/cartContext.jsx";

const fmt = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
});

export default function Carrito() {
  const { items, remove, clear, total, updateQty } = useCart();
  const navigate = useNavigate();

  // toast de stock
  const [notif, setNotif] = useState(null);

  // autocierre de toast
  useEffect(() => {
    if (!notif) return;
    const t = setTimeout(() => setNotif(null), 3000);
    return () => clearTimeout(t);
  }, [notif]);

  if (!items.length) {
    return (
      <div className="container">
        <h2>Carrito</h2>
        <p>No tienes productos en el carrito.</p>
        <Link className="btn btn-dark" to="/productos">
          Ir a productos
        </Link>
      </div>
    );
  }

  const handleDecrease = (it) => {
    const nueva = (it.qty || 1) - 1;
    if (nueva <= 0) {
      remove(it.id);
    } else {
      updateQty(it.id, nueva);
    }
  };

  const handleIncrease = (it) => {
    const stock = it.stock ?? Infinity;
    const nueva = (it.qty || 1) + 1;

    if (nueva > stock) {
      setNotif({
        nombre: it.nombre,
        qty: it.qty,
        precioUnitario: it.precio || 0,
        totalProducto: (it.precio || 0) * (it.qty || 0),
        tipo: "stock",
      });
      return;
    }

    updateQty(it.id, nueva);
  };

  return (
    <div className="container">
      <h2>Carrito</h2>
      <ul className="list-group mb-3">
        {items.map((it) => (
          <li
            key={it.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div className="d-flex flex-column">
              <span>{it.nombre}</span>
              <small className="text-muted">Stock: {it.stock ?? "—"}</small>
            </div>

            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => handleDecrease(it)}
              >
                −
              </button>
              <span>{it.qty}</span>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => handleIncrease(it)}
              >
                +
              </button>
            </div>

            <span>{fmt.format((it.precio || 0) * (it.qty || 0))}</span>

            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => remove(it.id)}
            >
              Quitar
            </button>
          </li>
        ))}
      </ul>

      <div className="d-flex gap-2 align-items-center">
        <strong>Total: {fmt.format(total)}</strong>
        <button className="btn btn-outline-secondary" onClick={clear}>
          Vaciar
        </button>
        <button
          className="btn btn-dark"
          onClick={() => navigate("/checkout")}
        >
          Comprar
        </button>
      </div>

      {/* TOAST / AVISO DE STOCK */}
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
                {notif.qty} × {fmt.format(notif.precioUnitario)}
              </small>

              <p className="mt-2 mb-1 fw-semibold">
                No hay más stock disponible de este producto.
              </p>

              <div className="d-flex justify-content-between align-items-center mt-2">
                <span className="fw-bold">
                  {fmt.format(notif.totalProducto)}
                </span>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => setNotif(null)}
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
