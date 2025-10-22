import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { API } from "../services/api.js";

// A dónde redirigir según rol
export function routeForRole(rol) {
  const r = (rol || "").toUpperCase();
  if (r === "SUPERADMIN" || r === "ADMIN") return "/admin";
  if (r === "VENDEDOR" || r === "SELLER") return "/vendedor";
  return "/mi-cuenta";
}

// Contexto con valores NO nulos (evita crashes al destructurar)
const defaultAuth = {
  user: null,
  setUser: () => {},
  login: async () => null,
  logout: () => {},
};
const AuthCtx = createContext(defaultAuth);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("rc_user")) || null; }
    catch { return null; }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("rc_user", JSON.stringify(user));
      // ayuda para endpoints que piden adminId en cabecera
      if (["ADMIN", "SUPERADMIN"].includes((user.rol || "").toUpperCase())) {
        localStorage.setItem("rc_admin_id", String(user.id || 1));
      }
    } else {
      localStorage.removeItem("rc_user");
      localStorage.removeItem("rc_admin_id");
    }
  }, [user]);

  async function login(email, password) {
    const res = await fetch(`${API}/usuarios/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Credenciales inválidas");
    const u = await res.json();
    setUser(u);
    return u; // devuelvo usuario para redirigir por rol
  }

  function logout() { setUser(null); }

  const value = useMemo(() => ({ user, setUser, login, logout }), [user]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  // Siempre devuelve objeto (gracias a defaultAuth), nunca null
  return useContext(AuthCtx);
}
