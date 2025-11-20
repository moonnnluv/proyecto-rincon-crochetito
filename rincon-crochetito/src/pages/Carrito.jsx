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

  // modal compra
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");
  const [purchaseError, setPurchaseError] = useState("");
  const [loadingCompra, setLoadingCompra] = useState(false);

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

  // muestra el modal de compra (siempre pedimos elegir sesión / invitado)
  const handleComprarClick = () => {
    setPurchaseError("");
    setShowGuestModal(true);
  };

  // llamada real al backend para generar la boleta
  const crearBoleta = async (correoInvitado) => {
    try {
      setLoadingCompra(true);
      setPurchaseError("");

      const token = localStorage.getItem("token"); // si tienes JWT
      const resp = await fetch("http://localhost:8080/api/boletas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          // 🔴 AJUSTA ESTO A TU DTO DE BOLETA
          email: correoInvitado || null, // o "correoCliente"
          items: items.map((it) => ({
            productoId: it.id,           // idProducto
            cantidad: it.qty,            // qty
            precioUnitario: it.precio,   // opcional si tu back lo calcula
          })),
          total, // si tu back lo calcula, puedes omitirlo
        }),
      });

      if (!resp.ok) {
        throw new Error("No se pudo procesar la compra.");
      }

      const boleta = await resp.json();

      clear(); // vaciamos carrito
      setShowGuestModal(false);
      setGuestEmail("");

      // vamos a la página de boleta
      navigate("/boleta", { state: { boleta } });
    } catch (err) {
      console.error(err);
      setPurchaseError(err.message || "Error al procesar la compra.");
    } finally {
      setLoadingCompra(false);
    }
  };

  const handleConfirmarInvitado = async () => {
    if (!guestEmail || !guestEmail.includes("@")) {
      setPurchaseError("Ingresa un correo electrónico válido para continuar.");
      return;
    }
    await crearBoleta(guestEmail);
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
          onClick={handleComprarClick}
          disabled={loadingCompra}
        >
          {loadingCompra ? "Procesando..." : "Comprar"}
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

      {/* MODAL COMPRA: login o invitado */}
      {showGuestModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1090 }}
        >
          <div className="card shadow" style={{ width: "100%", maxWidth: 420 }}>
            <div className="card-body">
              <button
                className="btn-close float-end"
                onClick={() => setShowGuestModal(false)}
              ></button>

              <h5 className="card-title mb-2">Completar compra</h5>
              <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                Puedes iniciar sesión o comprar como invitado ingresando tu
                correo electrónico para asociar la boleta.
              </p>

              <div className="mb-3">
                <label className="form-label">Correo electrónico</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="tucorreo@ejemplo.cl"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                />
              </div>

              {purchaseError && (
                <div className="text-danger small mb-2">
                  {purchaseError}
                </div>
              )}

              <div className="d-flex justify-content-between gap-2 mt-2">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setShowGuestModal(false);
                    navigate("/login");
                  }}
                >
                  Iniciar sesión
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleConfirmarInvitado}
                  disabled={loadingCompra}
                >
                  {loadingCompra
                    ? "Procesando..."
                    : "Comprar como invitado"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
