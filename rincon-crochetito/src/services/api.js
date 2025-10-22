// src/services/api.js

// === Base ===
export const API = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace(/\/$/, "");

function authHeaders() {
  const token = localStorage.getItem("rc_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// fetchJson: respeta FormData (no seteamos Content-Type manual)
// Nota: el navegador agrega el boundary automáticamente en multipart/form-data. :contentReference[oaicite:1]{index=1}
async function fetchJson(path, opts = {}) {
  const isForm = opts.body instanceof FormData;

  const res = await fetch(`${API}${path}`, {
    method: opts.method || "GET",
    credentials: "include", // solo si usas cookies/sesiones; requiere CORS con credenciales. :contentReference[oaicite:2]{index=2}
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      ...authHeaders(),
      ...(opts.headers || {}),
    },
    // no tocamos el body: si es FormData, va tal cual; si es JSON, mándalo ya stringificado desde el caller
    body: opts.body,
  });

  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json")
    ? await res.json().catch(() => ({}))
    : await res.text().catch(() => "");

  if (!res.ok) {
    const msg = typeof data === "string" && data ? data : JSON.stringify(data);
    throw new Error(`${res.status} ${res.statusText}${msg ? ` — ${msg}` : ""}`);
  }
  return data;
}

function normalizePage(data) {
  if (Array.isArray(data)) {
    return { content: data, totalElements: data.length, totalPages: 1, number: 0, size: data.length };
  }
  return data ?? { content: [], totalElements: 0, totalPages: 0, number: 0, size: 0 };
}

/* =========================
   Default export (compat)
   ========================= */
const api = {
  get: (url) => fetchJson(url),
  post: (url, body) =>
    fetchJson(url, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: (url, body) => fetchJson(url, { method: "PUT", body: JSON.stringify(body) }),
  patch: (url, body) => fetchJson(url, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (url) => fetchJson(url, { method: "DELETE" }),
};
export default api;

/* =========================
   USUARIOS (named exports)
   ========================= */
export async function listUsers({ q = "", rol = "", estado = "", page = 0, size = 20 } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (rol) params.set("rol", rol);
  if (estado) params.set("estado", estado);
  params.set("page", page);
  params.set("size", size);
  const data = await fetchJson(`/usuarios?${params.toString()}`);
  return normalizePage(data);
}
export const getUser = (id) => fetchJson(`/usuarios/${id}`);
export const createUser = (u) =>
  fetchJson(`/usuarios`, { method: "POST", body: JSON.stringify({ estado: "ACTIVO", ...u }) });
export const updateUser = (id, u) =>
  fetchJson(`/usuarios/${id}`, { method: "PUT", body: JSON.stringify(u) });
export const deleteUser = (id) => fetchJson(`/usuarios/${id}`, { method: "DELETE" });
export async function setUserEstado(id, estado) {
  try {
    return await fetchJson(`/usuarios/${id}/estado`, {
      method: "PATCH",
      body: JSON.stringify({ estado }),
    });
  } catch {
    const u = await getUser(id);
    return updateUser(id, { ...u, estado });
  }
}
/* =========================
   PRODUCTOS (named exports)
   ========================= */
export async function listProductos({ q = "", categoriaId = "", page = 0, size = 20 } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (categoriaId) params.set("categoriaId", categoriaId);
  params.set("page", page);
  params.set("size", size);
  const data = await fetchJson(`/productos?${params.toString()}`);
  return normalizePage(data);
}

export const getProducto = (id) => fetchJson(`/productos/${id}`);
export const createProducto = (p) =>
  fetchJson(`/productos`, { method: "POST", body: JSON.stringify(p) });
export const updateProducto = (id, p) =>
  fetchJson(`/productos/${id}`, { method: "PUT", body: JSON.stringify(p) });
export const deleteProducto = (id) => fetchJson(`/productos/${id}`, { method: "DELETE" });

// setProductoEstado (con fallback a PUT si PATCH no existe)
export async function setProductoEstado(id, estado) {
  try {
    return await fetchJson(`/productos/${id}/estado`, {
      method: "PATCH",
      body: JSON.stringify({ estado }),
    });
  } catch (e) {
    // fallback mínimo: PUT completo con el campo estado actualizado
    const p = await getProducto(id);
    return updateProducto(id, { ...p, estado });
  }
}

// PATCH stock: acepta { stock } o { delta }, con fallback a PUT
export async function patchProductoStock(id, payload /* {stock} o {delta} */) {
  try {
    return await fetchJson(`/productos/${id}/stock`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  } catch (e) {
    const p = await getProducto(id);
    let nuevo = p.stock ?? 0;
    if (payload?.stock != null) nuevo = Math.max(0, parseInt(payload.stock, 10));
    if (payload?.delta != null) nuevo = Math.max(0, parseInt(nuevo, 10) + parseInt(payload.delta, 10));
    return updateProducto(id, { ...p, stock: nuevo });
  }
}

// Subida de imagen: usar FormData y NO setear Content-Type manualmente.
export const uploadProductoImagen = (id, file, adminId) => {
  const fd = new FormData();
  fd.append("file", file);

  // adminId puede venir del login; si no, intenta desde localStorage
  const _adminId = adminId ?? localStorage.getItem("rc_admin_id") ?? "1";

  return fetchJson(`/productos/${id}/imagen`, {
    method: "POST",
    headers: { "X-ADMIN-ID": String(_adminId) },
    body: fd, // 👈 boundary lo agrega el navegador automáticamente
  });
};


/* =========================
   DASHBOARD
   ========================= */
export async function dashboardSafe() {
  const results = await Promise.allSettled([
    listUsers({ size: 1000 }),
    listProductos({ size: 1000 }),
  ]);

  const usersOk = results[0].status === "fulfilled";
  const prodsOk = results[1].status === "fulfilled";

  const u = usersOk ? results[0].value : { content: [], totalElements: 0 };
  const p = prodsOk ? results[1].value : { content: [], totalElements: 0 };

  const lowStock = (p.content || []).filter((x) => (x.stock ?? 0) < 5);

  return {
    totalUsuarios: u.totalElements ?? (u.content?.length || 0),
    totalProductos: p.totalElements ?? (p.content?.length || 0),
    lowStock,
    _errors: {
      usuarios: usersOk ? null : String(results[0].reason),
      productos: prodsOk ? null : String(results[1].reason),
    },
  };
}

