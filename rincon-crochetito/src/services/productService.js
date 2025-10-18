// src/services/productService.js
import { api } from "./api";

const norm = p => ({
    id: p.id,
    name: p.nombre,
    description: p.descripcion || "",
    price: p.precio ?? 0,
    image: p.imagen || "/img/no_producto.png",
    featured: p.destacado === true || p.destacado === 1,
});

export async function getProductos() {
    const data = await api("/productos");
    return Array.isArray(data) ? data.map(norm) : [];
}
export async function getProducto(id) {
    const p = await api(`/productos/${id}`);
    return p ? norm(p) : null;
}
