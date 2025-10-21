import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const { ok, msg } = await login({ email, password: pass });
    setLoading(false);
    if (!ok) return setErr(msg || "Credenciales inválidas");
    nav("/admin"); // o "/"
  };

  return (
    <section className="container py-4" style={{ maxWidth: 420 }}>
      <h3 className="mb-3">Ingresar</h3>
      <form onSubmit={onSubmit} noValidate>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Contraseña</label>
          <input type="password" className="form-control" value={pass} onChange={(e)=>setPass(e.target.value)} required />
        </div>
        {err && <div className="alert alert-danger py-2">{err}</div>}
        <button className="btn btn-dark w-100" disabled={loading}>
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </section>
  );
}
