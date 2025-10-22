// Servicio de login que intenta 1) endpoint de login del backend,
// y si no existe, 2) busca el usuario por email y valida el hash bcrypt en el front.

import bcrypt from "bcryptjs";

const API = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace(/\/$/, "");

// Si tu backend tiene otro path, pásalo por .env -> VITE_LOGIN_PATH=/mi/login
const LOGIN_PATHS = [
  import.meta.env.VITE_LOGIN_PATH || "/auth/login",
  "/usuarios/login",
  "/login",
];

async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include", // por si tu backend setea cookie de sesión
  });
  if (!res.ok) return null;
  try { return await res.json(); } catch { return {}; }
}

// adapta nombres de campos varios
function adaptUser(raw) {
  if (!raw) return null;
  return {
    id: raw.id ?? raw.userId ?? raw.usuarioId,
    nombre: raw.nombre ?? raw.name ?? raw.fullName ?? "Usuario",
    email: raw.email,
    rol: raw.rol ?? raw.role ?? "CLIENTE",
    estado: raw.estado ?? raw.status ?? "ACTIVO",
    // algunos backends devuelven token aunque no lo usemos
    token: raw.token,
    // a veces viene password hash (para fallback)
    passwordHash: raw.password ?? raw.passwordHash ?? raw.pass ?? raw.clave,
  };
}

/* 1) Intenta login nativo del backend */
export async function loginViaEndpoint(email, password) {
  for (const path of LOGIN_PATHS) {
    try {
      const data = await postJson(`${API}${path}`, { email, password });
      if (!data) continue;
      // algunos back devuelven {user: {...}} o directamente el user
      const u = adaptUser(data.user ?? data);
      if (u) return { ok: true, user: u };
    } catch { /* sigue probando */ }
  }
  return { ok: false };
}

/* 2) Fallback: pide el usuario por email y compara bcrypt en el front */
async function fetchUserByEmail(email) {
  const candidates = [
    `${API}/usuarios?email=${encodeURIComponent(email)}`,
    `${API}/usuarios/search?email=${encodeURIComponent(email)}`,
    `${API}/usuarios/buscar?email=${encodeURIComponent(email)}`,
    `${API}/usuarios`, // y filtra local
  ];

  for (const url of candidates) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const arr = Array.isArray(data) ? data : (Array.isArray(data?.content) ? data.content : [data]);
      const found = arr.find((u) => (u.email || "").toLowerCase() === email.toLowerCase());
      if (found) return adaptUser(found);
    } catch { /* intenta siguiente */ }
  }
  return null;
}

export async function loginWithBackend(email, password) {
  // 1) endpoint nativo
  const ep = await loginViaEndpoint(email, password);
  if (ep.ok) {
    // opcional: podrías validar estado aquí
    if (ep.user.estado && ep.user.estado !== "ACTIVO") {
      return { ok: false, msg: "Usuario inactivo" };
    }
    return ep;
  }

  // 2) fallback: compara bcrypt en el front (requiere que el backend exponga el hash)
  const user = await fetchUserByEmail(email);
  if (!user || !user.passwordHash) {
    return { ok: false, msg: "Credenciales inválidas" };
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return { ok: false, msg: "Credenciales inválidas" };
  if (user.estado && user.estado !== "ACTIVO") return { ok: false, msg: "Usuario inactivo" };

  // por seguridad, no propagamos el hash
  const { passwordHash, ...safeUser } = user;
  return { ok: true, user: safeUser };
}
