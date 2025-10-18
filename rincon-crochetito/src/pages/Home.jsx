// src/pages/Home.jsx
import { useEffect, useMemo, useState } from "react";
import { getProductos } from "../services/productService";
import ProductCard from "../components/ProductCard.jsx";


export default function Home() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getProductos();
        console.log("productos:", data);
        setProductos(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar productos:", error);
        setLoading(false);
      }
    })();
  }, []);

  // definimos "destacados"
  const destacados = useMemo(
        () => productos.filter(p => p.featured).slice(0, 4),
      [productos]
    );

  if (loading) return <div className="container py-5">Cargando…</div>;

  return (
    <div className="container py-4">
      <h1 className="mb-3">Home 🧶</h1>

      <h3 className="mt-4">Destacados</h3>
      {destacados.length === 0 ? (
        <p className="text-muted">No hay productos destacados por ahora.</p>
      ) : (
        <div className="row g-3">
          {destacados.map((p) => (
            <div className="col-md-3" key={p.id}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
