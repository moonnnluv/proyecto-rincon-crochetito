import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, routeForRole } from "../context/authContext.jsx";

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      const u = await login(email, password);
      nav(routeForRole(u?.rol), { replace: true });
    } catch (ex) {
      setErr(ex.message || "Error de login");
      alert(ex.message || "Error de login");
    }
  }

  return (
    <div className="container" style={{ maxWidth: 480 }}>
      <h2>Iniciar sesión</h2>
      {err && <div className="alert alert-danger">{err}</div>}
      <form onSubmit={onSubmit}>
        <div className="mb-2">
          <label className="form-label" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            className="form-control"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="login-password">
            Contraseña
          </label>
          <input
            id="login-password"
            className="form-control"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-primary">Entrar</button>
      </form>
    </div>
  );
}
