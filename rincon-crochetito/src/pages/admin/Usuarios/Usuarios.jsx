import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listUsers, deleteUser, setUserEstado } from "../../../services/api.js";


const ROLES = ["ADMIN", "VENDEDOR", "CLIENTE"];
const ESTADOS = ["ACTIVO", "INACTIVO"];

export default function Usuarios() {
  const [q, setQ] = useState("");
  const [rol, setRol] = useState("");
  const [estado, setEstado] = useState("");
  const [data, setData] = useState({ content: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await listUsers({ q, rol, estado, size: 50 });
        if (alive) setData(res);
      } finally { if (alive) setLoading(false); }
    }, 300); // debounce
    return () => { alive = false; clearTimeout(t); };
  }, [q, rol, estado]);

  async function onToggle(u) {
    const nuevo = (u.estado ?? "ACTIVO") === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    await setUserEstado(u.id, nuevo);
    setData(d => ({ ...d, content: d.content.map(x => x.id === u.id ? { ...x, estado: nuevo } : x) }));
  }
  async function onDelete(u) {
    if (!confirm(`¿Eliminar usuario "${u.nombre}"? Esta acción no se puede deshacer.`)) return;
    await deleteUser(u.id);
    setData(d => ({ ...d, content: d.content.filter(x => x.id !== u.id) }));
  }

  const rows = useMemo(() => data.content || [], [data]);

  return (
    <section className="admin-wrap">
      <header className="admin-head">
        <h2>Usuarios</h2>
        <Link className="btn primary" to="/admin/usuarios/nuevo">+ Nuevo</Link>
      </header>

      <div className="filters">
        <input placeholder="Buscar por nombre o email..." value={q} onChange={e=>setQ(e.target.value)} />
        <select value={rol} onChange={e=>setRol(e.target.value)}>
          <option value="">Rol (todos)</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={estado} onChange={e=>setEstado(e.target.value)}>
          <option value="">Estado (todos)</option>
          {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="table-responsive">
        <table className="table">
          <thead><tr>
            <th>#</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th style={{width:180}}>Acciones</th>
          </tr></thead>
          <tbody>
            {loading && <tr><td colSpan={6}>Cargando...</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={6}>Sin resultados</td></tr>}
            {rows.map((u, i) => (
              <tr key={u.id}>
                <td>{i+1}</td>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td><span className="badge">{u.rol ?? "CLIENTE"}</span></td>
                <td><span className={`badge ${ (u.estado ?? "ACTIVO")==="ACTIVO" ? "ok":"warn"}`}>{u.estado ?? "ACTIVO"}</span></td>
                <td className="actions">
                  <Link className="btn" to={`/admin/usuarios/${u.id}`}>Editar</Link>
                  <button className="btn" onClick={()=>onToggle(u)}>{(u.estado ?? "ACTIVO")==="ACTIVO" ? "Inactivar":"Activar"}</button>
                  <button className="btn danger" onClick={()=>onDelete(u)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
