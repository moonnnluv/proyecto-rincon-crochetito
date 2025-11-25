import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createUser, getUser, updateUser } from "../../../services/api.js";

const ROLES = ["SUPERADMIN", "ADMIN", "VENDEDOR", "CLIENTE"]; // incluye SUPERADMIN

// Regla fuerte opcional: 8+ con mayúscula, minúscula y número
const PW_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function UsuarioForm() {
  const { id } = useParams();
  const editing = !!id && id !== "nuevo";
  const nav = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    rol: "CLIENTE",
    password: "",
    estado: "ACTIVO",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (editing) {
      getUser(id).then((u) => {
        setForm({
          nombre: u?.nombre ?? "",
          email: u?.email ?? "",
          rol: (u?.rol ?? "CLIENTE").toUpperCase(),
          password: "",
          estado: u?.estado ?? "ACTIVO",
        });
      });
    }
  }, [editing, id]);

  function validate() {
    const e = {};
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email || "");
    if (!form.nombre?.trim()) e.nombre = "Requerido";
    if (!emailOk) e.email = "Email inválido";
    if (!form.rol) e.rol = "Seleccione un rol";

    if (!editing) {
      const pw = (form.password || "").trim();
      if (pw.length < 8) e.password = "Mínimo 8 caracteres";
      // si quieres forzar política fuerte, destapa esta línea:
      if (!PW_REGEX.test(pw)) e.password = "Debe incluir mayúscula, minúscula y número (mín. 8)";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    setServerError("");
    if (!validate()) return;

    const basePayload = {
      nombre: form.nombre.trim(),
      email: form.email.trim().toLowerCase(),
      rol: (form.rol || "CLIENTE").toUpperCase(),
      estado: form.estado || "ACTIVO",
    };

    setSubmitting(true);
    try {
      if (editing) {
        await updateUser(id, basePayload);
      } else {
        await createUser({
          ...basePayload,
          password: form.password, // el backend espera "password"
        });
      }
      nav("/admin/usuarios");
    } catch (err) {
      const msg = err?.message || "Error desconocido";
      setServerError(msg);
      alert("Error: " + msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="admin-wrap">
      <h2>{editing ? "Editar usuario" : "Nuevo usuario"}</h2>

      {serverError && (
        <div className="err" style={{ marginBottom: 8 }}>
          {serverError}
        </div>
      )}

      <form className="form" onSubmit={onSubmit} noValidate>
        <label>Nombre
          <input
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
            autoComplete="name"
            aria-invalid={!!errors.nombre}
          />
          {errors.nombre && <small className="err">{errors.nombre}</small>}
        </label>

        <label>Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            autoComplete="email"
            aria-invalid={!!errors.email}
          />
          {errors.email && <small className="err">{errors.email}</small>}
        </label>

        <label>Rol
          <select
            value={form.rol}
            onChange={(e) => setForm({ ...form, rol: e.target.value })}
            required
            aria-invalid={!!errors.rol}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {errors.rol && <small className="err">{errors.rol}</small>}
        </label>

        {!editing && (
          <label>Contraseña
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
              required
              minLength={8}                          /* validación nativa */ 
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$"  /* opcional fuerte */
              title="Mínimo 8 caracteres con mayúscula, minúscula y número"
              aria-invalid={!!errors.password}
            />
            {errors.password && <small className="err">{errors.password}</small>}
          </label>
        )}

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
