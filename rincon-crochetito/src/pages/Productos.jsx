import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard.jsx";
import { getProductos } from "../services/productService.js";

export default function Productos() {
    const [data, setData] = useState([]);
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        (async () => {
        try {
            const arr = await getProductos();
            setData(arr);
        } catch (e) {
            setErr("No se pudo conectar al backend.");
        } finally {
            setLoading(false);
        }
        })();
    }, []);

    const filtered = data.filter(p => (p.name || "").toLowerCase().includes(q.toLowerCase()));

    return (
        <section className="container py-4">
        <h2 className="mb-3">Productos</h2>
        {err && <div className="alert alert-warning">{err}</div>}
        <input
            className="form-control mb-4"
            placeholder="Buscar…"
            value={q}
            onChange={e => setQ(e.target.value)}
            style={{ maxWidth: 420 }}
        />
        {loading ? <p>Cargando…</p> : (
            <div className="row g-4">
            {filtered.map(p => <ProductCard key={p.id} p={p} />)}
            {!err && filtered.length === 0 && <p>No hay resultados.</p>}
            </div>
        )}
        </section>
    );
}
