import { createContext, useContext, useEffect, useState } from "react";
import { loginWithBackend } from "../services/authService.js";

const AuthCtx = createContext(null);
const LS_KEY = "rc_session";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) setUser(JSON.parse(raw));
  }, []);

  // ahora es ASÍNCRONO porque llama al backend
  async function login({ email, password }) {
    const res = await loginWithBackend(email, password);
    if (!res.ok) return { ok: false, msg: res.msg || "Credenciales inválidas" };
    localStorage.setItem(LS_KEY, JSON.stringify(res.user));
    setUser(res.user);
    return { ok: true };
  }

  function logout() {
    localStorage.removeItem(LS_KEY);
    setUser(null);
  }

  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
