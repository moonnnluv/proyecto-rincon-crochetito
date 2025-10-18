import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProducto } from "../services/productService.js";

export default function ProductoDetalle() {
    const { id } = useParams();
    const [p, setP] = useState(null);
    const [err, setErr] = useState("");

    useEffect(() => {
        (async () => {
        try { setP(await getProducto(id)); }
        catch { setErr("No se pudo cargar el producto."); }
        })();
    }, [id]);

    if (err) return <div className="container py-4">{err}</div>;
    if (!p) return <div className="container py-4">Cargando…</div>;

    return (
        <section className="container py-4">
        <div className="row g-4">
            <div className="col-12 col-md-6">
            <img src={p.image || "/img/no_producto.png"} alt={p.name} className="img-fluid rounded" />
            </div>
            <div className="col-12 col-md-6">
            <h2>{p.name}</h2>
            <p className="fs-4 fw-bold">${p.price?.toLocaleString?.() ?? p.price}</p>
            <p>{p.description}</p>
            <div className="d-flex gap-2 mt-3">
                <Link to="/productos" className="btn btn-outline-dark">Volver</Link>
                <button className="btn btn-dark" onClick={() => alert("Añadido (pendiente carrito)")}>Añadir al carrito</button>
            </div>
            </div>
        </div>
        </section>
    );
}
