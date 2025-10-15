import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function normalize(p) {
    return {
        id: p.id ?? p.codigo ?? p.ID,
        name: p.name ?? p.nombre ?? "Sin nombre",
        price: p.price ?? p.precio ?? 0,
        image: p.image ?? p.imagen ?? "/img/no_producto.png",
        description: p.description ?? p.descripcion ?? "",
    };
    }

    export default function ProductoDetalle() {
    const { id } = useParams();
    const [p, setP] = useState(null);

    useEffect(() => {
        fetch("/json/productos.json")
        .then(r => r.json())
        .then(arr => {
            const item = arr.map(normalize).find(x => String(x.id) === String(id));
            setP(item || null);
        })
        .catch(() => setP(null));
    }, [id]);

    if (!p) return <div className="container py-4">Cargando…</div>;

    return (
        <section className="container py-4">
        <div className="row g-4 align-items-start">
            <div className="col-12 col-md-6">
            <img src={p.image} alt={p.name} className="img-fluid rounded" />
            </div>
            <div className="col-12 col-md-6">
            <h2>{p.name}</h2>
            <p className="fs-4 fw-bold">${p.price?.toLocaleString?.() ?? p.price}</p>
            <p>{p.description}</p>
            <div className="d-flex gap-2 mt-3">
                <Link to="/productos" className="btn btn-outline-dark">Volver</Link>
                <button className="btn btn-dark" onClick={() => alert("Añadido (pendiente carrito)")}>
                Añadir al carrito
                </button>
            </div>
            </div>
        </div>
        </section>
    );
}
