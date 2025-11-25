// src/services/productService.js
import api from "./api";

const PATH = "/productos";

/* -------- Normalización (ES ⇄ EN) -------- */
const fromApi = (p = {}) => ({
  id: p.id,
  name: p.nombre ?? p.name ?? "",
  description: p.descripcion ?? p.description ?? "",
  price: p.precio ?? p.price ?? 0,
  image:
    p.imagenUrl ??
    p.imagen_url ??
    p.imagen ??
    p.imageUrl ??
    p.image ??
    "/img/no_producto.png",
  stock: p.stock ?? 0,
  featured:
    p.destacado ??
    p.esDestacado ??
    p.es_destacado ??
    p.featured ??
    p.isFeatured ??
    false,
  status: p.estado ?? p.status ?? "ACTIVO",
  categoryId: p.categoriaId ?? p.categoryId ?? p.categoria?.id ?? null,
});

const toApi = (x = {}) => ({
  id: x.id,
  nombre: x.name ?? x.nombre,
  descripcion: x.description ?? x.descripcion,
  precio: x.price ?? x.precio,
  imagenUrl: x.image ?? x.imagenUrl ?? x.imagen,
  stock: x.stock,
  destacado: x.featured ?? x.destacado ?? x.esDestacado ?? x.es_destacado,
  estado: x.status ?? x.estado,
  categoriaId: x.categoryId ?? x.categoriaId,
});

/* -------- CRUD + helpers (devuelven SIEMPRE el shape normalizado del detalle) -------- */
export async function getProducto(id) {
  const { data } = await api.get(`${PATH}/${id}`);
  return fromApi(data);
}

export async function getProductos(params = {}) {
  const { data } = await api.get(PATH, { params });
  const list = Array.isArray(data) ? data : (data?.content ?? []);
  return list.map(fromApi);
}

export async function getProductosDestacados() {
  // 1) intenta que el backend filtre por query (?destacado=true)
  try {
    const { data } = await api.get(PATH, { params: { destacado: true } });
    const list = Array.isArray(data) ? data : (data?.content ?? []);
    const mapped = list.map(fromApi);
    if (mapped.length) return mapped;
  } catch (_) {}

  // 2) fallback: trae todo y filtra en cliente (soporta boolean, 1/"1", "true")
  const all = await getProductos();
  return all.filter((p) => {
    const v = p.featured;
    return v === true || v === 1 || String(v).toLowerCase() === "true";
  });
}

export async function crearProducto(payload) {
  const { data } = await api.post(PATH, toApi(payload));
  return fromApi(data);
}

export async function actualizarProducto(id, payload) {
  const { data } = await api.put(`${PATH}/${id}`, toApi(payload));
  return fromApi(data);
}

export async function desactivarProducto(id) {
  const { data } = await api.patch(`${PATH}/${id}/desactivar`);
  return fromApi(data);
}

/* -------- Alias para que todo quede igual que en el detalle y en tus pages -------- */
export {
  getProductos as getProducts,
  getProducto as getProduct,
  crearProducto as createProduct,
  actualizarProducto as updateProduct,
  desactivarProducto as toggleProductStatus,
  getProductosDestacados as getFeaturedProducts,
};
