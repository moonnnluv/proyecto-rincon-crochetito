import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listProductos, deleteProducto, setProductoEstado } from "../../../services/api.js";

const IMG_FALLBACK = "/img/no_producto.png";

function normalizeImg(path) {
  if (!path) return IMG_FALLBACK;
  if (path.startsWith("http") || path.startsWith("data:") || path.startsWith("/")) return path;
  return "/" + path.replace(/^\.?\//, "");
}
function isProductoActivo(p) {
  if (typeof p.activo === "boolean") return p.activo;
  const est = (p.estado ?? "ACTIVO").toString().toUpperCase();
  return est === "ACTIVO" || est === "TRUE" || est === "1";
}

export default function Productos() {
  const [q, setQ] = useState("");
  const [onlyLow, setOnlyLow] = useState(false);
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
    const nuevo = isProductoActivo(p) ? "INACTIVO" : "ACTIVO";
    await setProductoEstado(p.id, nuevo);
    setData(d => ({
      ...d,
      content: d.content.map(x => x.id === p.id ? { ...x, estado: nuevo, activo: nuevo==="ACTIVO" } : x)
    }));
  }
  async function onDelete(p) {
    if (!confirm(`¿Eliminar "${p.nombre}"?`)) return;
    await deleteProducto(p.id);
    setData(d => ({ ...d, content: d.content.filter(x => x.id !== p.id) }));
  }

  const rows = useMemo(() => {
    let r = data.content || [];
    if (onlyLow) r = r.filter(p => (p.stock ?? 0) < 5);
    return r;
  }, [data, onlyLow]);

  const imgOf = (p) => normalizeImg(p.imagenUrl || p.imagen || IMG_FALLBACK);

  return (
    <section className="admin-wrap">
      <header className="admin-head">
        <h2 id="titulo-tabla">Productos</h2>
        <div className="admin-head-actions">
          {/* ← Botón Dashboard */}
          <Link className="btn ghost" to="/admin" aria-label="Volver al dashboard">← Dashboard</Link>
          <Link className="btn primary" to="/admin/productos/nuevo">+ Nuevo</Link>
        </div>
      </header>

      <div className="filters">
        <input
          placeholder="Buscar por nombre..."
          value={q}
          onChange={e=>setQ(e.target.value)}
          aria-label="Buscar producto por nombre"
        />
        <label className="chk">
          <input type="checkbox" checked={onlyLow} onChange={e=>setOnlyLow(e.target.checked)} />
          Mostrar solo stock &lt; 5
        </label>
      </div>

      <div className="table-responsive" aria-labelledby="titulo-tabla">
        <table className="table products">
          <thead>
            <tr>
              <th className="col-idx">#</th>
              <th className="col-title">Producto</th>
              <th className="col-price">Precio</th>
              <th className="col-stock">Stock</th>
              <th className="col-status">Estado</th>
              <th className="col-actions">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {loading && <tr><td colSpan={6}>Cargando...</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={6}>Sin resultados</td></tr>}

            {rows.map((p, i) => {
              const activo = isProductoActivo(p);
              const low = (p.stock ?? 0) < 5;
              return (
                <tr key={p.id} className={low ? "row-low" : ""}>
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
                  <td className="num">
                    ${new Intl.NumberFormat("es-CL").format(p.precio ?? 0)}
                  </td>
                  <td className="stock-cell">
                    <span className="mono">{p.stock ?? 0}</span>
                    {low && <span className="badge warn ml8" aria-label="Stock bajo (menos de 5)">Bajo</span>}
                  </td>
                  <td>
                    <span className={`badge ${activo ? "ok":"warn"}`}>{activo ? "ACTIVO" : "INACTIVO"}</span>
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
