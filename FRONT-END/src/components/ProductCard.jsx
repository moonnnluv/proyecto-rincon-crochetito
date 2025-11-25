import { Link } from "react-router-dom";

const fmtCLP = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
});

export default function ProductCard({ p }) {
    const imgAlt = p?.name ? `Foto de ${p.name}` : "Producto";

    return (
        <div className="col-12 col-sm-6 col-md-4 col-lg-3">
        <div className="card h-100 shadow-sm">
            <div className="position-relative">
            {p?.featured && (
                <span className="badge text-bg-warning position-absolute m-2">Destacado</span>
            )}

            <Link to={`/producto/${p.id}`} className="text-decoration-none d-block">
                <img
                src={p.image || "/img/no_producto.png"}
                alt={imgAlt}
                className="card-img-top"
                loading="lazy"
                width={800}           // hints para el navegador (no se recorta)
                height={600}
                style={{ height: 220, objectFit: "cover" }}
                onError={(e) => {
                    // evita loop si el placeholder también falla
                    if (e.currentTarget.src.endsWith("/img/no_producto.png")) return;
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/img/no_producto.png";
                }}
                />
            </Link>
            </div>

            <div className="card-body d-flex flex-column">
            <h6 className="card-title mb-1">{p.name}</h6>

            {/* truncado a 3 líneas, sin cortar brutalmente con slice */}
            <p
                className="card-text text-muted mb-3"
                style={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                minHeight: 54, // mantiene alto similar entre cards
                }}
                title={p.description}
            >
                {p.description || " "}
            </p>

            <div className="mt-auto d-flex justify-content-between align-items-center">
                <span className="fw-bold">
                {typeof p.price === "number"
                    ? fmtCLP.format(p.price)
                    : fmtCLP.format(Number(p.price || 0))}
                </span>
                <Link to={`/producto/${p.id}`} className="btn btn-outline-dark btn-sm">
                Ver
                </Link>
            </div>
            </div>
        </div>
        </div>
    );
}
