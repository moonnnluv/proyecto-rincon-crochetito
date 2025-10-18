// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Topbar from "./components/Topbar.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";

import Home from "./pages/Home.jsx";
import Productos from "./pages/Productos.jsx";
import ProductoDetalle from "./pages/ProductoDetalle.jsx";
import CrearProducto from "./pages/CrearProducto.jsx";
import EditarProd from "./pages/EditarProd.jsx";

function NotFound() {
  return (
    <div className="container" style={{ padding: "3rem 0" }}>
      <h2>Página no encontrada</h2>
      <a className="btn btn-outline-dark" href="/">Volver al inicio</a>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Topbar />
      <Header />
      <main style={{ minHeight: "70vh" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/producto/:id" element={<ProductoDetalle />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/admin/crear" element={<CrearProducto />} />
          <Route path="/admin/editar/:id" element={<EditarProd />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
