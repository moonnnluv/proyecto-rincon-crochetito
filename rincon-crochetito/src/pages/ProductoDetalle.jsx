import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProducto } from "../services/productService.js";

const API = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace(/\/$/, "");
const FALLBACK_IMG = "/img/no_producto.png";

const normalizeImgUrl = (raw) => {
  if (!raw) return FALLBACK_IMG;
  const s = String(raw).trim();
  if (/^(https?:|blob:)/i.test(s)) return s;     // absolutas/blobs
  if (s.startsWith("/")) return s;               // absolutas al host
  if (s.startsWith("img/") || s.startsWith("assets/")) return `/${s}`; // estáticos del front
  if (s.startsWith("uploads/") || s.startsWith("files/")) return `${API}/${s}`; // backend
  return `/${s}`; // por defecto, asume estático
};

const adapt = (x) => ({
  id: x?.id ?? x?.productoId,
  nombre: x?.nombre ?? x?.name ?? x?.titulo ?? "Producto",
  descripcion: x?.descripcion ?? x?.description ?? "",
  precio: Number(x?.precio ?? x?.price ?? 0),
  imagen: x?.imagen ?? x?.imagenUrl ?? x?.urlImagen ?? x?.imageUrl ?? x?.image ?? null,
  stock: x?.stock ?? x?.quantity ?? 0,
  estado: x?.estado ?? (x?.activo === false ? "INACTIVO" : "ACTIVO"),
});

export default function ProductoDetalle() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const raw = await getProducto(id);
        setP(adapt(raw));
      } catch {
        setErr("No se pudo cargar el producto.");
      }
    })();
  }, [id]);

  if (err) return <div className="container py-4">{err}</div>;
  if (!p) return <div className="container py-4">Cargando…</div>;

  const fmt = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" });
  const imgSrc = normalizeImgUrl(p.imagen);
  const agotado = (p.stock ?? 0) <= 0 || p.estado === "INACTIVO";

  return (
    <section className="container py-4 producto-detalle">
      <div className="row g-4">
        <div className="col-12 col-md-6">
          <img
            src={imgSrc}
            alt={p.nombre}
            className="img-fluid rounded shadow-sm"
            style={{ width: "100%", height: 360, objectFit: "cover", background: "#f3f4f6" }}
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
            loading="lazy"
          />
        </div>
        <div className="col-12 col-md-6">
          <h2 className="mb-2">{p.nombre}</h2>
          <p className="fs-4 fw-bold mb-2">{fmt.format(p.precio)}</p>
          <p className="text-muted">{p.descripcion}</p>

          {agotado && <span className="badge bg-secondary me-2">Sin stock</span>}

          <div className="d-flex gap-2 mt-3">
            <Link to="/productos" className="btn btn-outline-dark">Volver</Link>
            <button className="btn btn-dark" disabled={agotado}
              onClick={() => alert("Añadido (pendiente carrito)")}>
              {agotado ? "No disponible" : "Añadir al carrito"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
