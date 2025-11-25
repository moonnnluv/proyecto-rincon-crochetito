import { useState } from "react";

export default function Registro() {
  const [v, setV] = useState({ nombre:"", email:"", pass:"", pass2:"" });
  const onChange = (e)=> setV(s=>({ ...s, [e.target.name]: e.target.value }));

  const onSubmit = (e)=>{
    e.preventDefault();
    if (v.pass !== v.pass2) return alert("Las contraseñas no coinciden");
    alert("Registro pronto :)");
  };

  return (
    <section className="container py-4" style={{ maxWidth: 520 }}>
      <h3 className="mb-3">Crear cuenta</h3>
      <form className="row g-3" onSubmit={onSubmit} noValidate>
        <div className="col-12">
          <label className="form-label">Nombre</label>
          <input name="nombre" className="form-control" value={v.nombre} onChange={onChange} required />
        </div>
        <div className="col-12">
          <label className="form-label">Email</label>
          <input type="email" name="email" className="form-control" value={v.email} onChange={onChange} required />
        </div>
        <div className="col-md-6">
          <label className="form-label">Contraseña</label>
          <input type="password" name="pass" className="form-control" value={v.pass} onChange={onChange} required />
        </div>
        <div className="col-md-6">
          <label className="form-label">Repetir contraseña</label>
          <input type="password" name="pass2" className="form-control" value={v.pass2} onChange={onChange} required />
        </div>
        <div className="col-12 d-flex gap-2">
          <button className="btn btn-dark">Registrarme</button>
        </div>
      </form>
    </section>
  );
}
