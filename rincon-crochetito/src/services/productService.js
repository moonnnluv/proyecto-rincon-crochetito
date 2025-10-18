import { api } from "./api";

// adapta JSON del backend -> front
export function normalize(p) {
    return {
        id: p.id ?? p.ID,
        name: p.nombre ?? p.name ?? "Sin nombre",
        price: p.precio ?? p.price ?? 0,
        image: p.imagen ?? p.image ?? "/img/no_producto.png",
        description: p.descripcion ?? p.description ?? "",
        active: p.activo ?? p.active ?? true,
        stock: p.stock ?? 0,
    };
    }

    export async function getProductos() {
    const data = await api("/productos");        // GET /api/v1/productos
    return Array.isArray(data) ? data.map(normalize) : [];
    }

    export async function getProducto(id) {
    const p = await api(`/productos/${id}`);     // GET /api/v1/productos/:id
    return normalize(p);
}
