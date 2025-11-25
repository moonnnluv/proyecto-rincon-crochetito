// js/admin.js
// ============================================================
// Mantenedor simple de productos usando LocalStorage.
// - Clave usada en LocalStorage: "rc_productos"
// - Funciones: leer/guardar, render de tabla, editar, eliminar,
//   manejar submit del formulario y render inicial al cargar.
// ============================================================

// Clave de LocalStorage donde se guardará el arreglo de productos
const LS_KEY = "rc_productos";

// Lee el arreglo de productos desde LocalStorage.
// Si no existe nada, devuelve un arreglo vacío.
function leerProductos() {
  return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
}

// Guarda el arreglo completo de productos en LocalStorage.
function guardarProductos(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

// Pinta la tabla de productos en <tbody> usando los datos de LocalStorage.
function renderTabla() {
  const tbody = document.querySelector("#tablaProductos tbody");
  tbody.innerHTML = "";

  const productos = leerProductos();

  // Recorre cada producto y crea una fila <tr> con sus datos.
  productos.forEach((p, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nombre}</td>
      <td>${p.descripcion}</td>
      <td>$${p.precio}</td>
      <td><img src="${p.imagen}" width="40"></td>
      <td>
        <!-- Botones con handlers inline (mantengo tu enfoque tal cual) -->
        <button onclick="editar(${p.id})">Editar</button>
        <button onclick="eliminar(${p.id})">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Carga un producto al formulario para editarlo.
// Busca por id dentro del arreglo y setea los inputs del form.
function editar(id) {
  const productos = leerProductos();
  const p = productos.find(x => x.id === id);
  if (!p) return; // Si no lo encuentra, no hace nada.

  // Rellena el formulario con los datos del producto seleccionado.
  document.getElementById("idProducto").value = p.id;
  document.getElementById("nombre").value = p.nombre;
  document.getElementById("descripcion").value = p.descripcion;
  document.getElementById("precio").value = p.precio;
  document.getElementById("imagen").value = p.imagen;
}

// Elimina un producto filtrándolo por id y vuelve a renderizar la tabla.
function eliminar(id) {
  let productos = leerProductos();
  productos = productos.filter(p => p.id !== id);
  guardarProductos(productos);
  renderTabla();
}

// Maneja el submit del formulario de producto (crear/editar).
// - Si existe id en el input hidden => edita
// - Si NO existe => crea (usa Date.now() como id)
document.getElementById("formProducto").addEventListener("submit", (e) => {
  e.preventDefault(); // Evita recargar la página

  // Lee valores del formulario
  const id = parseInt(document.getElementById("idProducto").value || Date.now());
  const nombre = document.getElementById("nombre").value.trim();
  const descripcion = document.getElementById("descripcion").value.trim();
  const precio = parseFloat(document.getElementById("precio").value);
  const imagen = document.getElementById("imagen").value.trim();

  // Lee productos actuales de LocalStorage
  let productos = leerProductos();

  // Busca si ya existe un producto con ese id (para decidir entre editar o crear)
  const idx = productos.findIndex(p => p.id === id);

  // Construye el objeto producto (sin validación adicional; mantengo tu lógica)
  const nuevo = { id, nombre, descripcion, precio, imagen };

  if (idx >= 0) {
    // Si existe => reemplaza (editar)
    productos[idx] = nuevo;
  } else {
    // Si no existe => agrega (nuevo)
    productos.push(nuevo);
  }

  // Persiste cambios y refresca la tabla
  guardarProductos(productos);
  renderTabla();

  // Limpia el formulario para dejarlo listo para un nuevo registro
  e.target.reset();
});

// Al cargar el documento, renderiza la tabla con lo que haya en LocalStorage.
window.addEventListener("DOMContentLoaded", renderTabla);
// ============================================================