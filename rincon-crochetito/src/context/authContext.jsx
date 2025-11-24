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
    try {
      return JSON.parse(localStorage.getItem("rc_user")) || null;
    } catch {
      return null;
    }
  });

  // Sincroniza usuario en localStorage + admin_id
  useEffect(() => {
    if (user) {
      localStorage.setItem("rc_user", JSON.stringify(user));
      if (["ADMIN", "SUPERADMIN"].includes((user.rol || "").toUpperCase())) {
        localStorage.setItem("rc_admin_id", String(user.id || 1));
      }
    } else {
      localStorage.removeItem("rc_user");
      localStorage.removeItem("rc_admin_id");
    }
  }, [user]);

  // LOGIN contra backend con JWT
  async function login(email, password) {
    const res = await fetch(`${API}/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error("Credenciales inválidas");
      }
      throw new Error("Error al iniciar sesión");
    }

    const data = await res.json();
    const { token, ...u } = data;

    if (!token) {
      throw new Error("Respuesta de login sin token");
    }

    // Guardamos token para que api.js lo mande en Authorization: Bearer xxx
    localStorage.setItem("rc_token", token);
    setUser(u);
    return u; // para redirigir según rol
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("rc_token");
  }

  const value = useMemo(() => ({ user, setUser, login, logout }), [user]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  // Siempre devuelve objeto (gracias a defaultAuth), nunca null
  return useContext(AuthCtx);
}
