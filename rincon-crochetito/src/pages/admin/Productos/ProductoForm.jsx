import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createProducto,
  getProducto,
  updateProducto,
  uploadProductoImagen,
} from "../../../services/api.js";

export default function AdminProductoForm() {
  const { id } = useParams();
  const editing = !!id && id !== "nuevo";
  const nav = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    estado: "ACTIVO",
    destacado: false,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    if (editing) {
      getProducto(id).then((p) =>
        setForm({
          nombre: p?.nombre ?? "",
          descripcion: p?.descripcion ?? "",
          precio: p?.precio ?? "",
          stock: p?.stock ?? "",
          estado: p?.estado ?? "ACTIVO",
          destacado: !!p?.destacado,
        })
      );
    }
  }, [editing, id]);

  function validate() {
    const e = {};
    if (!form.nombre?.trim()) e.nombre = "Requerido";
    const precioNum = Number(form.precio);
    const stockNum = Number(form.stock);
    if (!(precioNum > 0)) e.precio = "Precio > 0";
    if (!(stockNum >= 0)) e.stock = "Stock ≥ 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // elimina claves vacías para no gatillar validaciones del backend
  function clean(obj) {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== "" && v !== null && v !== undefined) out[k] = v;
    }
    return out;
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    setServerError("");
    if (!validate()) return;

    const payload = clean({
      nombre: form.nombre.trim(),
      descripcion: (form.descripcion || "").trim(),
      precio: Number(form.precio),
      stock: Number(form.stock),
      estado: form.estado || "ACTIVO",
      destacado: !!form.destacado,
    });

    setSubmitting(true);
    try {
      let savedId = id;

      if (editing) {
        await updateProducto(id, payload);
      } else {
        const saved = await createProducto(payload);
        savedId = saved?.id ?? saved?.data?.id ?? savedId; // soporta 201 sin body
      }

      // Subir imagen si corresponde
      const file = fileRef.current?.files?.[0];
      if (file && savedId) {
        const res = await uploadProductoImagen(savedId, file);
        // si el backend devuelve imagenUrl, la persistimos
        if (res?.imagenUrl) {
          try { await updateProducto(savedId, { imagenUrl: res.imagenUrl }); } catch {}
        }
      }

      nav("/admin/productos");
    } catch (err) {
      const msg = err?.message || "Error desconocido al guardar";
      setServerError(msg);
      alert("Error: " + msg);
      console.error("[ProductoForm] save error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="admin-wrap">
      <h2>{editing ? "Editar producto" : "Nuevo producto"}</h2>

      {serverError && <div className="err" style={{ marginBottom: 8 }}>{serverError}</div>}

      <form className="form" onSubmit={onSubmit} noValidate>
        <label>Nombre
          <input
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />
          {errors.nombre && <small className="err">{errors.nombre}</small>}
        </label>

        <label>Descripción
          <textarea
            rows={4}
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          />
        </label>

        <div className="grid-2">
          <label>Precio ($)
            <input
              type="number"
              min={0}
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
            />
            {errors.precio && <small className="err">{errors.precio}</small>}
          </label>

          <label>Stock
            <input
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
            {errors.stock && <small className="err">{errors.stock}</small>}
          </label>
        </div>

        <label>Imagen (opcional)
          <input type="file" accept="image/*" ref={fileRef} />
        </label>

        <label className="check">
          <input
            type="checkbox"
            checked={!!form.destacado}
            onChange={(e) => setForm({ ...form, destacado: e.target.checked })}
          />
          <span>Destacado</span>
        </label>

        <div className="form-actions">
          <button className="btn" type="button" onClick={() => nav(-1)} disabled={submitting}>
            Cancelar
          </button>
          <button className="btn primary" type="submit" disabled={submitting}>
            {submitting ? "Guardando..." : (editing ? "Guardar" : "Crear")}
          </button>
        </div>
      </form>
    </section>
  );
}
