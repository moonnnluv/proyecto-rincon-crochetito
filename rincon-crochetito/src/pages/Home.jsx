import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// La base YA incluye /api (ver .env). Ej: VITE_API_BASE_URL=http://localhost:8080/api
const API = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace(/\/$/, "");

// util para tratar "true", 1, true
const isTrue = (v) => v === true || v === 1 || String(v).toLowerCase?.() === "true";

// Normaliza cualquier url de imagen posible y deja fallback
const FALLBACK_IMG = "/img/no_producto.png";
const normalizeImgUrl = (raw) => {
  if (!raw) return FALLBACK_IMG;
  const s = String(raw).trim();

  // absolutas o blobs: déjalas tal cual
  if (/^(https?:|blob:)/i.test(s)) return s;

  // ya absolutas al host (sirve /img/... en public o assets servidos por front)
  if (s.startsWith("/")) return s;

  // rutas relativas típicas del front: "img/...", "assets/..."
  if (s.startsWith("img/") || s.startsWith("assets/")) return `/${s}`;

  // rutas del backend (ej: "uploads/..." o "files/..."): prepéndales la base del API
  if (s.startsWith("uploads/") || s.startsWith("files/")) return `${API}/${s}`;

  // en duda: asume archivo estático del front
  return `/${s}`;
};

// asegúranos que solo vengan destacados + activos + con stock
async function getDestacados() {
  // si tu backend filtra por query param, genial; si no, igual filtramos abajo
  const res = await fetch(`${API}/productos?destacado=true`);
  if (!res.ok) throw new Error("No se pudo cargar destacados");
  let data = await res.json();
  if (!Array.isArray(data)) data = data?.content ?? [];

  return data.filter((p) => {
    const featured = p?.destacado ?? p?.esDestacado ?? p?.es_destacado ?? p?.featured ?? p?.isFeatured;
    const activo = (p?.estado ?? p?.activo ?? "ACTIVO") === "ACTIVO" || p?.activo === true;
    const conStock = (p?.stock ?? 0) > 0;
    return isTrue(featured) && activo && conStock;
  });
}

export default function Home() {
  const [destacados, setDestacados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDestacados()
      .then(setDestacados)
      .catch(() => setDestacados([]))
      .finally(() => setLoading(false));
  }, []);

  const fmt = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" });

  // imágenes del carrusel (desde /public/img)
  const slides = ["/img/header_logo.png", "/img/header_imagenes.png", "/img/header_logo.png", "/img/header_imagenes.png"];

  return (
    <>
      {/* Carrusel solo en Home */}
      <div className="home-hero container-fluid px-0">
        <div id="homeCarousel" className="carousel slide" data-bs-ride="carousel" data-bs-interval="4000">
          <div className="carousel-indicators">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                data-bs-target="#homeCarousel"
                data-bs-slide-to={i}
                className={i === 0 ? "active" : ""}
                aria-current={i === 0 ? "true" : undefined}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

          <div className="carousel-inner">
            {slides.map((src, i) => (
              <div key={i} className={`carousel-item ${i === 0 ? "active" : ""}`}>
                <img src={src} className="d-block w-100" alt={`slide-${i}`} />
              </div>
            ))}
          </div>

          <button className="carousel-control-prev" type="button" data-bs-target="#homeCarousel" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Anterior</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#homeCarousel" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Siguiente</span>
          </button>
        </div>
      </div>

      {/* Destacados */}
      <div className="container home-content">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Destacados</h2>
          <Link to="/productos" className="btn btn-outline-dark">Ver todo</Link>
        </div>

        {loading ? (
          <p className="text-muted">Cargando…</p>
        ) : (
          <div className="row g-4">
            {destacados.length === 0 ? (
              <p className="text-muted">No hay productos destacados por ahora.</p>
            ) : (
              destacados.map((p) => {
                const imgSrc = normalizeImgUrl(p.imagen ?? p.imagenUrl ?? p.urlImagen ?? p.imageUrl ?? p.image);
                return (
                  <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={p.id}>
                    <div className="card h-100">
                      <img
                        src={imgSrc}
                        className="card-img-top"
                        alt={p.nombre}
                        style={{ height: 220, objectFit: "cover" }}
                        onError={(e) => {
                          e.currentTarget.onerror = null; // evita loops
                          e.currentTarget.src = FALLBACK_IMG;
                        }}
                      />
                      <div className="card-body">
                        <h6 className="card-title mb-1">{p.nombre}</h6>
                        <p className="card-text text-muted small">{p.descripcion}</p>
                      </div>
                      <div className="card-footer bg-white d-flex justify-content-between align-items-center">
                        <span className="fw-semibold">{fmt.format(p.precio ?? 0)}</span>
                        <Link to={`/producto/${p.id}`} className="btn btn-sm btn-dark">Ver</Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </>
  );
}
