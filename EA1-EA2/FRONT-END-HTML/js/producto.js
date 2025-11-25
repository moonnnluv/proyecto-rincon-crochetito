// js/producto.js
// ============================================================
// Listado de productos (productos.html) + "Destacados" (home.html)
// - Carga catálogo desde URL (JSON server o archivo JSON)
// - Renderiza cards y permite buscar/ordenar (productos.html)
// - Renderiza 3 destacados (home.html)
// - Botón "Agregar" que guarda en LocalStorage (rc_cart)
// ============================================================

// Endpoint del catálogo (puede ser JSON Server o un JSON local)
const URL = 'http://localhost:3000/productos'; // o 'json/productos.json'

// Formateador de moneda a CLP (Chile)
const CLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });

// Referencias a elementos (algunas existen solo en páginas específicas)
const grid           = document.getElementById('gridProductos');   // productos.html
const destacadosGrid = document.getElementById('destacadosGrid');  // home.html
const inputQ = document.getElementById('q');      // buscador (productos.html)
const selOrd = document.getElementById('orden');  // select de orden (productos.html)
const total  = document.getElementById('totalProd'); // contador (productos.html)

// Clave de LocalStorage para el carrito
const LS_CART = 'rc_cart';

// Catálogo completo en memoria
let ALL = [];

// Asegura que el DOM esté listo antes de inicializar
document.addEventListener('DOMContentLoaded', init);

async function init() {
  try {
    // 1) Trae el catálogo
    const res = await fetch(URL);
    const data = await res.json();

    // 2) Soporta dos formatos de respuesta:
    //    - Arreglo plano de productos
    //    - Objeto con { productos: [...] }
    ALL = Array.isArray(data) ? data : (data.productos || []);

    // --- productos.html ---
    if (grid) {
      // Pinta todos los productos al iniciar
      renderTo(grid, ALL);
      // Conecta filtros (buscador + orden)
      wireFilters();
    }

    // --- home.html (Destacados) ---
    if (destacadosGrid) {
      // Toma los que estén marcados como 'destacado'
      let destacados = ALL.filter(p => p.destacado);
      // Si no hay ninguno con flag, toma los 3 primeros
      if (!destacados.length) destacados = ALL.slice(0, 3);
      renderTo(destacadosGrid, destacados.slice(0, 3));
    }

    // Listener global para botones "Agregar" (funciona en ambas páginas)
    document.addEventListener('click', onAddToCartClick);

  } catch (e) {
    // Si falla la carga del catálogo
    console.error('Error cargando productos:', e);
    if (grid)           grid.innerHTML           = errorBox('No se pudieron cargar los productos.');
    if (destacadosGrid) destacadosGrid.innerHTML = errorBox('No se pudieron cargar los destacados.');
  }
}

// Conecta filtros de búsqueda y orden (productos.html)
function wireFilters() {
  if (inputQ) inputQ.addEventListener('input', applyFilters);
  if (selOrd) selOrd.addEventListener('change', applyFilters);
}

// Aplica búsqueda por texto y orden seleccionado, luego re-renderiza
function applyFilters() {
  const q = (inputQ?.value || '').trim().toLowerCase();

  // Filtro por nombre o descripción
  let list = ALL.filter(p =>
    p.nombre.toLowerCase().includes(q) ||
    (p.descripcion || '').toLowerCase().includes(q)
  );

  // Orden según select
  switch (selOrd?.value) {
    case 'precio-asc':  list.sort((a,b) => a.precio - b.precio); break;
    case 'precio-desc': list.sort((a,b) => b.precio - a.precio); break;
    case 'nombre-asc':  list.sort((a,b) => a.nombre.localeCompare(b.nombre)); break;
    case 'nombre-desc': list.sort((a,b) => b.nombre.localeCompare(a.nombre)); break;
  }

  // Vuelve a pintar la grilla con la lista filtrada/ordenada
  if (grid) renderTo(grid, list);
}

// Render genérico: recibe un contenedor y una lista de productos
function renderTo(container, list) {
  // Actualiza contador (solo en productos.html)
  if (total && container === grid) total.textContent = `(${list.length})`;

  // Pinta cards
  container.innerHTML = list.map(cardHTML).join('');

  // Fallback de imagen: si falla, usar 'no_producto.png'
  container.querySelectorAll('img[data-fallback]').forEach(img => {
    img.addEventListener('error', () => { img.src = 'img/no_producto.png'; }, { once: true });
  });
}

// Card de un producto (HTML string)
function cardHTML(p) {
  const img = p.imagen || 'img/no_producto.png';
  const precio = isFinite(+p.precio) ? CLP.format(+p.precio) : '';
  const pagina = p.pagina || 'productos.html'; // si no tienes página de detalle aún, vuelve a productos.html

  return `
    <div class="col-12 col-sm-6 col-lg-4 col-xxl-3">
      <div class="card h-100 shadow-sm">
        <img src="${img}" data-fallback class="card-img-top" alt="${esc(p.nombre)}" loading="lazy">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title mb-1">${esc(p.nombre)}</h5>
          <p class="text-muted small mb-2">${esc(p.descripcion || '')}</p>
          ${precio ? `<p class="fw-bold mb-3">${precio}</p>` : ''}
          <div class="mt-auto d-flex gap-2">
            <a href="${pagina}" class="btn btn-dark btn-sm">Ver detalles</a>
            <button class="btn btn-outline-dark btn-sm" data-add="${p.id}">Agregar</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// Carrito en LocalStorage (mismo formato que usas en carrito.js)
// ============================================================

// Maneja click en botones "Agregar" usando delegación de eventos
function onAddToCartClick(ev) {
  const btn = ev.target.closest('button[data-add]');
  if (!btn) return;

  const id = +btn.getAttribute('data-add');

  // Lee carrito, agrega o incrementa y persiste
  const cart = JSON.parse(localStorage.getItem(LS_CART) || '[]');
  const item = cart.find(x => x.id === id);
  if (item) item.cant += 1;
  else cart.push({ id, cant: 1 });
  localStorage.setItem(LS_CART, JSON.stringify(cart));

  // Feedback rápido en el botón
  btn.textContent = 'Agregado ✓';
  btn.disabled = true;
  setTimeout(() => { btn.textContent = 'Agregar'; btn.disabled = false; }, 900);
}

// ============================================================
// Utilidades
// ============================================================

// Caja de error reutilizable (devuelve un HTML string)
function errorBox(msg){
  return `<div class="col"><div class="alert alert-danger">${esc(msg)}</div></div>`;
}

// Escape básico para evitar inyección HTML en textos visibles
function esc(s=''){
  return String(s)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}
