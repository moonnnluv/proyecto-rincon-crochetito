// src/pages/Carrito.jsx
import { Link } from "react-router-dom";
import { useCart } from "../context/cartContext.jsx";

export default function Carrito() {
  const { items, remove, clear, total } = useCart();
  const fmt = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" });

  if (!items.length) {
    return (
      <div className="container">
        <h2>Carrito</h2>
        <p>No tienes productos en el carrito.</p>
        <Link className="btn btn-dark" to="/productos">Ir a productos</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Carrito</h2>
      <ul className="list-group mb-3">
        {items.map(it => (
          <li key={it.id} className="list-group-item d-flex justify-content-between align-items-center">
            <span>{it.nombre} × {it.qty}</span>
            <span>{fmt.format((it.precio||0) * (it.qty||0))}</span>
            <button className="btn btn-sm btn-outline-danger" onClick={() => remove(it.id)}>Quitar</button>
          </li>
        ))}
      </ul>
      <div className="d-flex gap-2 align-items-center">
        <strong>Total: {fmt.format(total)}</strong>
        <button className="btn btn-outline-secondary" onClick={clear}>Vaciar</button>
        <button className="btn btn-dark" disabled>Comprar (pronto)</button>
      </div>
    </div>
  );
}
