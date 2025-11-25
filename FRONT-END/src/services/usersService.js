const API = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace(/\/$/, "");
const BASE = `${API}/usuarios`;
const LS_KEY = "rc_users";

/* helpers */
const readLS = () => {
  const raw = localStorage.getItem(LS_KEY);
  const arr = raw ? JSON.parse(raw) : [];
  return Array.isArray(arr) ? arr : [];
};
const writeLS = (arr) => localStorage.setItem(LS_KEY, JSON.stringify(arr));
const tryFetch = async (url, opts) => {
  try {
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch {
    return null;
  }
};

/* CRUD + helpers */
export async function listUsers({ q = "", rol = "", estado = "" } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (rol) params.set("rol", rol);
  if (estado) params.set("estado", estado);

  const data = await tryFetch(`${BASE}${params.toString() ? `?${params}` : ""}`);
  if (Array.isArray(data)) return data;

  // Fallback local
  let list = readLS();
  if (!list.length) {
    list = [
      { id: 1, nombre: "Admin", email: "admin@rc.cl", rol: "ADMIN", estado: "ACTIVO", creado: "2025-01-01" },
      { id: 2, nombre: "Vendedora", email: "venta@rc.cl", rol: "VENDEDOR", estado: "ACTIVO", creado: "2025-01-02" },
      { id: 3, nombre: "Cliente Demo", email: "cliente@rc.cl", rol: "CLIENTE", estado: "INACTIVO", creado: "2025-01-03" },
    ];
    writeLS(list);
  }

  const norm = (s="") => s.toString().toLowerCase().trim();
  return list.filter(u =>
    (!q || norm(u.nombre).includes(norm(q)) || norm(u.email).includes(norm(q))) &&
    (!rol || u.rol === rol) &&
    (!estado || u.estado === estado)
  );
}

export async function getUser(id) {
  const data = await tryFetch(`${BASE}/${id}`);
  if (data) return data;
  return readLS().find(u => String(u.id) === String(id));
}

export async function createUser(u) {
  const data = await tryFetch(BASE, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(u)
  });
  if (data) return data;

  const list = readLS();
  const id = Math.max(0, ...list.map(x => x.id || 0)) + 1;
  const nuevo = { id, estado: "ACTIVO", creado: new Date().toISOString().slice(0,10), ...u };
  writeLS([...list, nuevo]);
  return nuevo;
}

export async function updateUser(id, u) {
  const data = await tryFetch(`${BASE}/${id}`, {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(u)
  });
  if (data) return data;

  const list = readLS().map(x => String(x.id) === String(id) ? { ...x, ...u } : x);
  writeLS(list);
  return list.find(x => String(x.id) === String(id));
}

export async function toggleEstadoUser(id) {
  const user = await getUser(id);
  const nuevoEstado = (user?.estado ?? "ACTIVO") === "ACTIVO" ? "INACTIVO" : "ACTIVO";
  return updateUser(id, { estado: nuevoEstado });
}

export async function deleteUser(id) {
  // Si el backend soporta DELETE:
  const data = await tryFetch(`${BASE}/${id}`, { method: "DELETE" });
  if (data) return data;

  // Fallback: borrado duro en LS
  const list = readLS().filter(x => String(x.id) !== String(id));
  writeLS(list);
  return { ok: true };
}
