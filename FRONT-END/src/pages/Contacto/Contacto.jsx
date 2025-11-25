export default function Contacto() {
  return (
    <section className="container py-4" style={{maxWidth: 720}}>
      <h2 className="mb-3">Contacto</h2>
      <p className="text-muted">¿Tienes un pedido personalizado o dudas? Escríbenos ✨</p>

      <form className="row g-3" onSubmit={(e)=>e.preventDefault()}>
        <div className="col-md-6">
          <label className="form-label">Nombre</label>
          <input className="form-control" required />
        </div>
        <div className="col-md-6">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" required />
        </div>
        <div className="col-12">
          <label className="form-label">Mensaje</label>
          <textarea className="form-control" rows={5} required />
        </div>
        <div className="col-12 d-flex gap-2">
          <button className="btn btn-dark" type="submit" disabled>Enviar (pronto)</button>
          <a className="btn btn-outline-dark" href="mailto:contacto@crochetito.cl">Enviar por correo</a>
        </div>
      </form>
    </section>
  );
}
