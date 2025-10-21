// src/services/api.js
const API = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace(/\/$/, "");

// Opcional: token si luego usas JWT
function authHeaders() {
    const token = localStorage.getItem("rc_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
    }

    async function fetchJson(path, opts = {}) {
    const isForm = opts.body instanceof FormData;
    const res = await fetch(`${API}${path}`, {
        method: opts.method || "GET",
        credentials: "include", // importante para cookies de sesión
        headers: {
        ...(isForm ? {} : { "Content-Type": "application/json" }),
        ...authHeaders(),
        ...(opts.headers || {}),
        },
        body: isForm ? opts.body : opts.body,
    });

    const ct = res.headers.get("content-type") || "";
    const data = ct.includes("application/json")
        ? await res.json().catch(() => ({}))
        : await res.text().catch(() => "");

    if (!res.ok) {
        const msg = typeof data === "string" && data ? data : JSON.stringify(data);
        throw new Error(`${res.status} ${res.statusText} - ${msg}`);
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
    Export default (compat)
    =========================
    Permite usar: api.get('/usuarios'), api.post('/usuarios', {...}), etc.
    Así no revienta el código antiguo que importaba `default`.
    */
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
    USUARIOS (exports con nombre)
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
    export const createUser = (u) => fetchJson(`/usuarios`, { method: "POST", body: JSON.stringify({ estado: "ACTIVO", ...u }) });
    export const updateUser = (id, u) => fetchJson(`/usuarios/${id}`, { method: "PUT", body: JSON.stringify(u) });
    export const deleteUser = (id) => fetchJson(`/usuarios/${id}`, { method: "DELETE" });
    export async function setUserEstado(id, estado) {
    try {
        return await fetchJson(`/usuarios/${id}/estado`, { method: "PATCH", body: JSON.stringify({ estado }) });
    } catch {
        const u = await getUser(id);
        return updateUser(id, { ...u, estado });
    }
    }

    /* =========================
    PRODUCTOS (exports con nombre)
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
    export const createProducto = (p) => fetchJson(`/productos`, { method: "POST", body: JSON.stringify(p) });
    export const updateProducto = (id, p) => fetchJson(`/productos/${id}`, { method: "PUT", body: JSON.stringify(p) });
    export const deleteProducto = (id) => fetchJson(`/productos/${id}`, { method: "DELETE" });
    export const setProductoEstado = (id, estado) => fetchJson(`/productos/${id}/estado`, { method: "PATCH", body: JSON.stringify({ estado }) });
    export const uploadProductoImagen = (id, file) => {
    const fd = new FormData();
    fd.append("file", file);
    return fetchJson(`/productos/${id}/imagen`, { method: "POST", body: fd });
    };

    /* =========================
    DASHBOARD
    ========================= */
    export async function dashboardBasic() {
    const [u, p] = await Promise.all([listUsers({ size: 1000 }), listProductos({ size: 1000 })]);
    const lowStock = (p.content || []).filter(x => (x.stock ?? 0) < 5);
    return {
        totalUsuarios: u.totalElements ?? (u.content?.length || 0),
        totalProductos: p.totalElements ?? (p.content?.length || 0),
        lowStock,
    };
}

// --- al final de src/services/api.js ---

export async function dashboardSafe() {
  const results = await Promise.allSettled([
    listUsers({ size: 1000 }),
    listProductos({ size: 1000 }),
  ]);

  const usersOk = results[0].status === "fulfilled";
  const prodsOk = results[1].status === "fulfilled";

  const u = usersOk ? results[0].value : { content: [], totalElements: 0 };
  const p = prodsOk ? results[1].value : { content: [], totalElements: 0 };

  const lowStock = (p.content || []).filter(x => (x.stock ?? 0) < 5);

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

// src/services/api.js (solo pega/actualiza estas funciones)

async function tryJson(path, opts) {
  // pequeño wrapper con el mismo fetchJson que ya tienes
  return fetchJson(path, opts);
}

// --------- PRODUCTOS ----------
export async function listProductos({ q = "", categoriaId = "", page = 0, size = 20 } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (categoriaId) params.set("categoriaId", categoriaId);
  params.set("page", page); params.set("size", size);
  try {
    return normalizePage(await tryJson(`/productos?${params.toString()}`));
  } catch (e) {
    return normalizePage(await tryJson(`/producto?${params.toString()}`));
  }
}

export async function getProducto(id) {
  try { return await tryJson(`/productos/${id}`); }
  catch { return await tryJson(`/producto/${id}`); }
}

export async function createProducto(p) {
  try { return await tryJson(`/productos`, { method: "POST", body: JSON.stringify(p) }); }
  catch { return await tryJson(`/producto`,  { method: "POST", body: JSON.stringify(p) }); }
}

export async function updateProducto(id, p) {
  try { return await tryJson(`/productos/${id}`, { method: "PUT", body: JSON.stringify(p) }); }
  catch { return await tryJson(`/producto/${id}`,  { method: "PUT", body: JSON.stringify(p) }); }
}

export async function deleteProducto(id) {
  try { return await tryJson(`/productos/${id}`, { method: "DELETE" }); }
  catch { return await tryJson(`/producto/${id}`,  { method: "DELETE" }); }
}

export async function setProductoEstado(id, estado) {
  try { return await tryJson(`/productos/${id}/estado`, { method: "PATCH", body: JSON.stringify({ estado }) }); }
  catch {
    // si tu backend no tiene PATCH estado, hacemos PUT completo como fallback
    const p = await getProducto(id);
    return updateProducto(id, { ...p, estado });
  }
}

export async function uploadProductoImagen(id, file) {
  const fd = new FormData(); fd.append("file", file);
  try { return await tryJson(`/productos/${id}/imagen`, { method: "POST", body: fd }); }
  catch { return await tryJson(`/producto/${id}/imagen`,  { method: "POST", body: fd }); }
}

