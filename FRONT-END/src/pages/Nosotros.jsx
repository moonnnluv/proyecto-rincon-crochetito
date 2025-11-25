export default function Nosotros() {
  return (
    <section className="container py-4">
      <div className="mb-4 text-center">
        <h2 className="mb-1">Nosotros</h2>
        <p className="text-muted">Hecho a mano con amor: Rincón Crochetito</p>
      </div>

      <div className="row g-4 align-items-center">
        <div className="col-12 col-md-6">
          <img
            src="/img/nosotros_foto_temporal.png"
            alt="Nosotros"
            className="img-fluid rounded"
            onError={(e)=>{e.currentTarget.src="/img/header_imagenes.png";}}
          />
        </div>
        <div className="col-12 col-md-6">
          <h4 className="mb-2">Nuestra historia</h4>
          <p className="text-muted">
            Somos un pequeño emprendimiento dedicado al tejido a crochet y a crear productos
            personalizados. Cuidamos los detalles, los materiales y cada puntada.
          </p>
          <h5 className="mt-3">Qué nos mueve</h5>
          <ul className="text-muted mb-0">
            <li>Diseño artesanal y sostenible</li>
            <li>Pedidos personalizados</li>
            <li>Calidez en la atención</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
