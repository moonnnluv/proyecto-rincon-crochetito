// src/context/authContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { API } from "../services/api.js";

// Helper: decodificar payload del JWT para ver "exp"
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

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

  // 🕒 Al montar: si el token está vencido, limpiamos sesión
  useEffect(() => {
    const token = localStorage.getItem("rc_token");
    if (!token) return;

    const payload = parseJwt(token);
    if (payload?.exp) {
      const nowSeconds = Date.now() / 1000;
      if (payload.exp < nowSeconds) {
        // Token expirado → limpiamos todo
        setUser(null);
        localStorage.removeItem("rc_token");
        localStorage.removeItem("rc_user");
        localStorage.removeItem("rc_admin_id");
      }
    }
  }, []);

  // Sincroniza usuario en localStorage + admin_id
  useEffect(() => {
    if (user) {
      localStorage.setItem("rc_user", JSON.stringify(user));
      if (["ADMIN", "SUPERADMIN"].includes((user.rol || "").toUpperCase())) {
        localStorage.setItem("rc_admin_id", String(user.id || 1));
      } else {
        localStorage.removeItem("rc_admin_id");
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
    // rc_user y rc_admin_id se limpian en el useEffect de arriba
  }

  const value = useMemo(() => ({ user, setUser, login, logout }), [user]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  // Siempre devuelve objeto (gracias a defaultAuth), nunca null
  return useContext(AuthCtx);
}
