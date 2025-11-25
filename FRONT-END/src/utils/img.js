// src/utils/img.js
export const IMG_FALLBACK = "/img/no_producto.png"; // asegúrate de tener este archivo en /public/img

function fromDrive(url, size = 128) {
  // Accepta: /file/d/<ID>/view, ?id=<ID>, open?id=<ID>
  const m1 = url.match(/\/file\/d\/([^/]+)/);
  const m2 = url.match(/[?&]id=([^&]+)/);
  const id = (m1 && m1[1]) || (m2 && m2[1]);
  // El thumbnail SÍ devuelve image/* y no dispara CORB
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w${size}` : url;
}

export function normalizeImg(path, size = 128) {
  if (!path) return IMG_FALLBACK;
  const u = String(path);

  // Google Drive -> forzar thumbnail image/*
  if (u.includes("drive.google.com")) return fromDrive(u, size);

  // Absolutas o data URL
  if (u.startsWith("http") || u.startsWith("data:") || u.startsWith("/")) return u;

  // Rutas relativas ("img/...", "uploads/...", "archivo.jpg") -> absolutas
  return "/" + u.replace(/^\.?\//, "");
}
