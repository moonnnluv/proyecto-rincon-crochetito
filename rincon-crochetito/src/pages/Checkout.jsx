// src/pages/Checkout.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/cartContext.jsx";

const fmtCLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
});

export default function Checkout() {
  const { items, total, clear } = useCart();
  const nav = useNavigate();

  const [form, setForm] = useState({
    email: "",
    newsletter: true,
    pais: "Chile",
    esEmpresa: false,
    rut: "",
    nombre: "",
    apellidos: "",
    telefono: "",
    direccion: "",
    crearCuenta: false,
    password: "",
  });

  const [loading, setLoading] = useState(false);

  if (!items.length) {
    return (
      <section className="container my-4">
        <h2>Checkout</h2>
        <p>Tu carrito está vacío.</p>
        <button className="btn btn-dark" onClick={() => nav("/productos")}>
          Ir a productos
        </button>
      </section>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email) {
      alert("Debes ingresar un correo electrónico.");
      return;
    }

    try {
      setLoading(true);

      // 1) Registro opcional de usuario (si marcó "crear cuenta")
      if (form.crearCuenta) {
        const resUser = await fetch(
          "http://localhost:8080/api/auth/registro-checkout",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: form.email,
              nombre: form.nombre,
              apellidos: form.apellidos,
              telefono: form.telefono,
              rut: form.rut,
              direccion: form.direccion,
              password: form.password || "Cambiar123", // demo
            }),
          }
        );
        if (!resUser.ok) throw new Error("Error al registrar usuario");
        // const userData = await resUser.json();
      }

      // 2) Crear la boleta (nombres alineados con BoletaRequest del backend)
      const resBoleta = await fetch("http://localhost:8080/api/boletas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          nombre: form.nombre,
          apellidos: form.apellidos,
          rut: form.rut,
          telefono: form.telefono,
          direccion: form.direccion,
          items: items.map((it) => ({
            productoId: it.id,
            cantidad: it.qty,
          })),
        }),
      });

      if (!resBoleta.ok) throw new Error("Error al generar boleta");
      const boleta = await resBoleta.json();

      clear();
      nav("/boleta", { state: { boleta } });
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al procesar la compra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container my-4">
      <div className="row">
        {/* FORMULARIO */}
        <div className="col-12 col-lg-8">
          <h2>Datos de compra</h2>
          <form onSubmit={handleSubmit} className="mt-3">
            <h5>Datos de contacto</h5>
            <div className="mb-3">
              <label className="form-label">E-mail *</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                name="newsletter"
                id="newsletter"
                checked={form.newsletter}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="newsletter">
                Quiero recibir ofertas y novedades por e-mail
              </label>
            </div>

            <h5>Datos de facturación</h5>
            <div className="mb-3">
              <label className="form-label">País</label>
              <select
                name="pais"
                className="form-select"
                value={form.pais}
                onChange={handleChange}
              >
                <option>Chile</option>
              </select>
            </div>

            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                name="esEmpresa"
                id="esEmpresa"
                checked={form.esEmpresa}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="esEmpresa">
                Facturar como empresa/persona jurídica
              </label>
            </div>

            <div className="mb-3">
              <label className="form-label">RUT</label>
              <input
                type="text"
                name="rut"
                className="form-control"
                value={form.rut}
                onChange={handleChange}
                placeholder="11.111.111-1"
              />
            </div>

            <h5>Persona que pagará el pedido</h5>
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                name="nombre"
                className="form-control"
                value={form.nombre}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Apellidos</label>
              <input
                type="text"
                name="apellidos"
                className="form-control"
                value={form.apellidos}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Teléfono</label>
              <input
                type="text"
                name="telefono"
                className="form-control"
                value={form.telefono}
                onChange={handleChange}
              />
            </div>

            <h5>Opciones de cuenta</h5>
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                name="crearCuenta"
                id="crearCuenta"
                checked={form.crearCuenta}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="crearCuenta">
                Crear una cuenta con estos datos
              </label>
            </div>

            {form.crearCuenta && (
              <div className="mb-3">
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  value={form.password}
                  onChange={handleChange}
                  required={form.crearCuenta}
                />
              </div>
            )}

            <button
              type="submit"
              className="btn btn-danger mt-3"
              disabled={loading}
            >
              {loading ? "Procesando..." : "Confirmar compra"}
            </button>
          </form>
        </div>

        {/* RESUMEN CARRITO */}
        <div className="col-12 col-lg-4 mt-4 mt-lg-0">
          <div className="card">
            <div className="card-body">
              <h5>Resumen</h5>
              <ul className="list-group mb-3">
                {items.map((it) => (
                  <li
                    key={it.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <div>{it.nombre}</div>
                      <small className="text-muted">
                        {it.qty} × {fmtCLP.format(it.precio || 0)}
                      </small>
                    </div>
                    <span>
                      {fmtCLP.format((it.qty || 0) * (it.precio || 0))}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="d-flex justify-content-between">
                <strong>Total</strong>
                <strong>{fmtCLP.format(total)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
