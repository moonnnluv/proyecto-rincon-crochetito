// src/pages/admin/Dashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { dashboardSafe } from "../../services/api.js";

export default function Dashboard() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalBoletas, setTotalBoletas] = useState(0);

  async function load() {
    setLoading(true);
    try {
      // Cargamos info del dashboard + boletas en paralelo
      const [infoData, boletasData] = await Promise.all([
        dashboardSafe(),
        api.get("/boletas").catch((e) => {
          console.error(e);
          return [];
        }),
      ]);

      setInfo(infoData);
      setTotalBoletas(Array.isArray(boletasData) ? boletasData.length : 0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading && !info) return <p>Cargando...</p>;

  return (
    <section className="admin-wrap">
      <h2>Panel administrativo</h2>

      {info?._errors && (info._errors.usuarios || info._errors.productos) && (
        <div className="err" style={{ marginBottom: 12 }}>
          {info._errors.usuarios && (
            <div>⚠️ Usuarios: {info._errors.usuarios}</div>
          )}
          {info._errors.productos && (
            <div>⚠️ Productos: {info._errors.productos}</div>
          )}
          <button className="btn" onClick={load} style={{ marginTop: 8 }}>
            Reintentar
          </button>
        </div>
      )}

      <div className="cards">
        {/* Productos */}
        <div className="card">
          <div className="kpi">{info?.totalProductos ?? 0}</div>
          <div className="kpi-label">Productos en inventario</div>
          <Link className="btn small" to="/admin/productos">
            Ver
          </Link>
        </div>

        {/* Usuarios */}
        <div className="card">
          <div className="kpi">{info?.totalUsuarios ?? 0}</div>
          <div className="kpi-label">Usuarios registrados</div>
          <Link className="btn small" to="/admin/usuarios">
            Ver
          </Link>
        </div>

        {/* Compras realizadas (todas las boletas) */}
        <div className="card">
          <div className="kpi">{totalBoletas}</div>
          <div className="kpi-label">Compras realizadas</div>
          <Link className="btn small" to="/admin/boletas">
            Ver
          </Link>
        </div>

        {/* Stock bajo */}
        <div className="card">
          <div className="kpi">{info?.lowStock?.length ?? 0}</div>
          <div className="kpi-label">Stock &lt; 5</div>
          <a className="btn small" href="#low">
            Ir
          </a>
        </div>
      </div>

      <h3 id="low">Stock bajo</h3>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Producto</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {(!info?.lowStock || info.lowStock.length === 0) && (
              <tr>
                <td colSpan={3}>Todo OK 🚀</td>
              </tr>
            )}
            {info?.lowStock?.map((p, i) => (
              <tr key={p.id}>
                <td>{i + 1}</td>
                <td>{p.nombre}</td>
                <td>{p.stock ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
