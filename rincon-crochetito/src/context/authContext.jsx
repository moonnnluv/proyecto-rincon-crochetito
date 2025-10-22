import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const AuthCtx = createContext(null);
const LS_KEY = "rc_user";

export function routeForRole(rol) {
  switch ((rol || "").toUpperCase()) {
    case "SUPERADMIN":
    case "ADMIN": return "/admin";
    case "VENDEDOR": return "/vendedor";
    default: return "/cuenta";
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // hidratar desde localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY); // persiste entre recargas. :contentReference[oaicite:1]{index=1}
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const login = async (email, password) => {
    const u = await api.post("/usuarios/login", { email, password }); // usa endpoint real
    setUser(u);
    localStorage.setItem(LS_KEY, JSON.stringify(u));                  // Web Storage API. :contentReference[oaicite:2]{index=2}
    return u;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(LS_KEY);
  };

  const hasRole = (...roles) => roles.map(r=>r.toUpperCase()).includes((user?.rol||"").toUpperCase());

  const value = useMemo(() => ({ user, login, logout, hasRole, routeForRole }), [user]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
