import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth, routeForRole } from "../context/authContext";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e){
    e.preventDefault();
    setErr("");
    try {
      const u = await login(email, password);
      const to = (loc.state?.from?.pathname) || routeForRole(u.rol);
      nav(to, { replace: true });
    } catch (e) {
      setErr(String(e.message || e));
      alert("Login inválido");
    }
  }

  return (
    <form onSubmit={onSubmit} className="form">
      <h2>Iniciar sesión</h2>
      {err && <div className="err">{err}</div>}
      <label>Email <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
      <label>Contraseña <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} /></label>
      <button className="btn primary" type="submit">Entrar</button>
    </form>
  );
}
