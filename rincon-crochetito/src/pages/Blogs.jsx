import { Link } from "react-router-dom";

const posts = [
  {
    slug: "como-cuidar-tus-tejidos",
    titulo: "Cómo cuidar tus tejidos",
    resumen: "Consejos simples para lavar y guardar tus prendas a crochet.",
    imagen: "/img/header_logo.png",
    fecha: "2025-05-01",
  },
  {
    slug: "elige-tu-lana-ideal",
    titulo: "Elige tu lana ideal",
    resumen: "Tipos de lana, grosores y usos según temporada.",
    imagen: "/img/header_logo.png",
    fecha: "2025-05-10",
  },
  {
    slug: "guia-de-tallas-en-crochet",
    titulo: "Guía de tallas en crochet",
    resumen: "Cómo estimar medidas para gorros, cintillos y más.",
    imagen: "/img/header_logo.png",
    fecha: "2025-05-20",
  },
];

export default function Blogs(){
  return (
    <section className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Blogs</h2>
      </div>

      <div className="row g-4">
        {posts.map(p => (
          <div className="col-12 col-sm-6 col-lg-4" key={p.slug}>
            <div className="card h-100">
              <img
                src={p.imagen}
                alt={p.titulo}
                className="card-img-top"
                style={{height:200, objectFit:"cover"}}
                onError={(e)=>{e.currentTarget.src="/img/no_producto.png";}}
              />
              <div className="card-body">
                <small className="text-muted d-block mb-1">
                  {new Date(p.fecha).toLocaleDateString("es-CL")}
                </small>
                <h6 className="card-title">{p.titulo}</h6>
                <p className="card-text text-muted small">{p.resumen}</p>
              </div>
              <div className="card-footer bg-white">
                <Link to={`/blog/${p.slug}`} className="btn btn-sm btn-dark">Leer más</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
