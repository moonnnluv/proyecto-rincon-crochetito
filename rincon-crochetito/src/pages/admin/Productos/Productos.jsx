import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listProductos, deleteProducto, setProductoEstado } from "../../../services/api.js";

const IMG_FALLBACK = "/img/no_producto.png"; // debe existir en public/img

function normalizeImg(path) {
  if (!path) return IMG_FALLBACK;
  if (path.startsWith("http") || path.startsWith("data:") || path.startsWith("/")) return path;
  return "/" + path.replace(/^\.?\//, "");
}

// Ayuda: resuelve si el producto está activo, acepte 'estado' (string) o 'activo' (boolean)
function isProductoActivo(p) {
  if (typeof p.activo === "boolean") return p.activo;
  const est = (p.estado ?? "ACTIVO").toString().toUpperCase();
  return est === "ACTIVO" || est === "TRUE" || est === "1";
}

export default function Productos() {
  const [q, setQ] = useState("");
  const [data, setData] = useState({ content: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true; setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await listProductos({ q, size: 50 });
        if (alive) setData(res);
      } finally { if (alive) setLoading(false); }
    }, 300);
    return () => { alive = false; clearTimeout(t); };
  }, [q]);

  async function onToggle(p) {
    const activoAhora = isProductoActivo(p);
    const nuevoEstado = activoAhora ? "INACTIVO" : "ACTIVO"; // usamos PATCH parcial (mejor que PUT para un campo). 
    try {
      await setProductoEstado(p.id, nuevoEstado);
      // refleja en UI ambos modelos (string estado y boolean activo)
      setData(d => ({
        ...d,
        content: d.content.map(x =>
          x.id === p.id ? { ...x, estado: nuevoEstado, activo: nuevoEstado === "ACTIVO" } : x
        )
      }));
    } catch (e) {
      console.error(e);
      alert("No se pudo cambiar el estado del producto.");
    }
  }

  async function onDelete(p) {
    if (!confirm(`¿Eliminar "${p.nombre}"?`)) return;
    await deleteProducto(p.id);
    setData(d => ({ ...d, content: d.content.filter(x => x.id !== p.id) }));
  }

  const rows = useMemo(() => data.content || [], [data]);
  const imgOf = (p) => normalizeImg(p.imagenUrl || p.imagen || IMG_FALLBACK);

  return (
    <section className="admin-wrap">
      <header className="admin-head">
        <h2>Productos</h2>
        <Link className="btn primary" to="/admin/productos/nuevo">+ Nuevo</Link>
      </header>

      <div className="filters">
        <input placeholder="Buscar por nombre..." value={q} onChange={e=>setQ(e.target.value)} />
      </div>

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>#</th><th>Producto</th><th>Precio</th><th>Stock</th><th>Estado</th>
              <th style={{width:210}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6}>Cargando...</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={6}>Sin resultados</td></tr>}
            {rows.map((p, i) => {
              const activo = isProductoActivo(p);
              const estadoLabel = activo ? "ACTIVO" : "INACTIVO";
              return (
                <tr key={p.id}>
                  <td>{i+1}</td>
                  <td className="prod-cell">
                    <img
                      className="thumb"
                      src={imgOf(p)}
                      alt={p.nombre}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.currentTarget.src = IMG_FALLBACK; }}
                    />
                    <div>
                      <div className="strong">{p.nombre}</div>
                      <small className="muted">{(p.descripcion || "").slice(0,90)}</small>
                    </div>
                  </td>
                  <td>${new Intl.NumberFormat("es-CL").format(p.precio ?? 0)}</td>
                  <td>{p.stock ?? 0}</td>
                  <td>
                    <span className={`badge ${ activo ? "ok":"warn"}`}>
                      {estadoLabel}
                    </span>
                  </td>
                  <td className="actions">
                    <Link className="btn" to={`/admin/productos/${p.id}`}>Editar</Link>
                    <button
                      className="btn"
                      onClick={()=>onToggle(p)}
                      aria-label={`${activo ? "Desactivar" : "Activar"} ${p.nombre}`}
                      title={`${activo ? "Desactivar" : "Activar"} producto`}
                    >
                      {activo ? "Desactivar" : "Activar"}
                    </button>
                    <button className="btn danger" onClick={()=>onDelete(p)}>Eliminar</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
