import { Link } from "react-router-dom";

export default function ProductCard({ p }) {
    return (
        <div className="col-12 col-sm-6 col-md-4 col-lg-3">
        <div className="card h-100 shadow-sm">
            <Link to={`/producto/${p.id}`} className="text-decoration-none">
            <img
                src={p.image || "/img/no_producto.png"}
                className="card-img-top"
                alt={p.name}
                style={{ height: 220, objectFit: "cover" }}
            />
            </Link>
            <div className="card-body d-flex flex-column">
            <h5 className="card-title">{p.name}</h5>
            <p className="card-text text-muted mb-3">{p.description?.slice(0, 80) || " "}</p>
            <div className="mt-auto d-flex justify-content-between align-items-center">
                <span className="fw-bold">${(p.price ?? 0).toLocaleString?.() ?? p.price}</span>
                <Link to={`/producto/${p.id}`} className="btn btn-outline-dark btn-sm">Ver</Link>
            </div>
            </div>
        </div>
        </div>
    );
}
