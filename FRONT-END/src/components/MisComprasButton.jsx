// src/components/MisComprasButton.jsx
import { Link } from "react-router-dom";

export default function MisComprasButton() {
  return (
    <Link
      to="/mis-compras"
      className="btn btn-outline-light btn-sm ms-2"
      style={{ borderRadius: "999px" }}
    >
      Mis compras
    </Link>
  );
}
