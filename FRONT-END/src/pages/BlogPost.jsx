import { useParams, Link } from "react-router-dom";

const content = {
  "como-cuidar-tus-tejidos": {
    titulo: "Cómo cuidar tus tejidos",
    imagen: "/img/blog_1.jpg",
    cuerpo: [
      "Lava a mano con agua fría y jabón suave.",
      "No retorcer: presiona suavemente para quitar el exceso de agua.",
      "Seca en horizontal sobre una toalla para mantener la forma."
    ],
    fecha: "2025-05-01"
  },
  "elige-tu-lana-ideal": {
    titulo: "Elige tu lana ideal",
    imagen: "/img/blog_2.jpg",
    cuerpo: [
      "La lana gruesa (bulky) es perfecta para gorros y bufandas.",
      "El algodón es fresco y ideal para primavera/verano.",
      "Revisa siempre el cuidado indicado por el fabricante."
    ],
    fecha: "2025-05-10"
  },
  "guia-de-tallas-en-crochet": {
    titulo: "Guía de tallas en crochet",
    imagen: "/img/blog_3.jpg",
    cuerpo: [
      "Para gorros, mide perímetro de cabeza y resta 2–3 cm para elasticidad.",
      "Para cintillos, considera ancho y contorno para un ajuste cómodo.",
      "Siempre teje una muestra para asegurar densidad."
    ],
    fecha: "2025-05-20"
  }
};

export default function BlogPost(){
  const { slug } = useParams();
  const post = content[slug];

  if(!post){
    return (
      <div className="container py-4">
        <p className="text-muted">Entrada no encontrada.</p>
        <Link to="/blogs" className="btn btn-outline-dark">Volver</Link>
      </div>
    );
  }

  return (
    <section className="container py-4">
      <div className="mb-3">
        <Link to="/blogs" className="btn btn-outline-dark btn-sm">← Volver</Link>
      </div>
      <h2 className="mb-1">{post.titulo}</h2>
      <small className="text-muted d-block mb-3">
        {new Date(post.fecha).toLocaleDateString("es-CL")}
      </small>

      <img
        src={post.imagen}
        alt={post.titulo}
        className="img-fluid rounded mb-3"
        style={{maxHeight:400, objectFit:"cover"}}
        onError={(e)=>{e.currentTarget.src="/img/no_producto.png";}}
      />

      {post.cuerpo.map((p,i)=><p key={i} className="text-muted">{p}</p>)}
    </section>
  );
}
