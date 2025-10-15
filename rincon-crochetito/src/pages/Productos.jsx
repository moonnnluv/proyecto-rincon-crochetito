import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard.jsx";

function normalize(p) {
    return {
        id: p.id ?? p.codigo ?? p.ID,
        name: p.name ?? p.nombre ?? "Sin nombre",
        price: p.price ?? p.precio ?? 0,
        image: p.image ?? p.imagen ?? "/img/no_producto.png",
        description: p.description ?? p.descripcion ?? "",
        featured: p.featured ?? p.destacado ?? false,
    };
    }

    export default function Productos() {
    const [data, setData] = useState([]);
    const [q, setQ] = useState("");

    useEffect(() => {
        fetch("/json/productos.json")
        .then(r => r.json())
        .then(arr => setData(arr.map(normalize)))
        .catch(() => setData([]));
    }, []);

    const filtered = data.filter(p =>
        p.name.toLowerCase().includes(q.toLowerCase())
    );

    return (
        <section className="container py-4">
        <h2 className="mb-3">Productos</h2>
        <input
            className="form-control mb-4"
            placeholder="Buscar…"
            value={q}
            onChange={e => setQ(e.target.value)}
            style={{ maxWidth: 420 }}
        />
        <div className="row g-4">
            {filtered.map(p => <ProductCard key={p.id} p={p} />)}
            {filtered.length === 0 && <p>No hay resultados.</p>}
        </div>
        </section>
    );
}
