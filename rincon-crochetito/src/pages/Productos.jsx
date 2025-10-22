// src/pages/Productos.jsx (pública)
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listProductos } from "../services/api.js";

const IMG_FALLBACK = "/img/no_producto.png";
const fmt = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" });

function imgOf(p) {
  const path = p.imagenUrl || p.imagen || p.imagenPath || "";
  if (!path) return IMG_FALLBACK;
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return "/" + path.replace(/^\.?\//, "");
}

export default function ProductosPublic() {
  const [q, setQ] = useState("");
  const [data, setData] = useState({ content: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true; setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await listProductos({ q, size: 50 });
        if (!alive) return;
        // normaliza page o array
        setData(Array.isArray(res) ? { content: res } : res);
      } finally { if (alive) setLoading(false); }
    }, 250);
    return () => { alive = false; clearTimeout(t); };
  }, [q]);

  const rows = useMemo(() => data?.content || [], [data]);

  return (
    <div className="container">
      <h2>Productos</h2>
      <input
        className="form-control mb-3"
        placeholder="Buscar..."
        value={q}
        onChange={(e)=>setQ(e.target.value)}
      />

      {loading && <p>Cargando...</p>}
      {!loading && rows.length === 0 && <p>No hay resultados.</p>}

      <div className="row g-3">
        {rows.map(p => (
          <div key={p.id} className="col-12 col-sm-6 col-md-4">
            <div className="card h-100">
              <img className="card-img-top" src={imgOf(p)} alt={p.nombre} onError={e=>e.currentTarget.src=IMG_FALLBACK} />
              <div className="card-body d-grid gap-2">
                <h5 className="card-title m-0">{p.nombre}</h5>
                <small className="text-muted">{(p.descripcion||"").slice(0,90)}</small>
                <div className="d-flex justify-content-between align-items-center mt-auto">
                  <strong>{fmt.format(p.precio||0)}</strong>
                  <Link className="btn btn-outline-dark btn-sm" to={`/producto/${p.id}`}>Ver</Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
