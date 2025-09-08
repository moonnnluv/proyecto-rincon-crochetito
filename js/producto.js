// js/productos.js
const URL = 'http://localhost:3000/productos'; // o 'json/productos.json'
const CLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });

const grid           = document.getElementById('gridProductos');   // productos.html
const destacadosGrid = document.getElementById('destacadosGrid');  // home.html
const inputQ = document.getElementById('q');
const selOrd = document.getElementById('orden');
const total  = document.getElementById('totalProd');

const LS_CART = 'rc_cart';
let ALL = [];

// Asegura que el DOM esté listo
document.addEventListener('DOMContentLoaded', init);

async function init() {
  try {
    const res = await fetch(URL);
    const data = await res.json();
    // soporta { productos:[...] } o array directo
    ALL = Array.isArray(data) ? data : (data.productos || []);

    // --- productos.html ---
    if (grid) {
      renderTo(grid, ALL);
      wireFilters();
    }

    // --- home.html (Destacados) ---
    if (destacadosGrid) {
      let destacados = ALL.filter(p => p.destacado);
      if (!destacados.length) destacados = ALL.slice(0, 3); // fallback por si no hay flag
      renderTo(destacadosGrid, destacados.slice(0, 3));
    }

    // Botones "Agregar" (ambas páginas)
    document.addEventListener('click', onAddToCartClick);

  } catch (e) {
    console.error('Error cargando productos:', e);
    if (grid)           grid.innerHTML          = errorBox('No se pudieron cargar los productos.');
    if (destacadosGrid) destacadosGrid.innerHTML = errorBox('No se pudieron cargar los destacados.');
  }
}

function wireFilters() {
  if (inputQ) inputQ.addEventListener('input', applyFilters);
  if (selOrd) selOrd.addEventListener('change', applyFilters);
}

function applyFilters() {
  const q = (inputQ?.value || '').trim().toLowerCase();
  let list = ALL.filter(p =>
    p.nombre.toLowerCase().includes(q) ||
    (p.descripcion || '').toLowerCase().includes(q)
  );

  switch (selOrd?.value) {
    case 'precio-asc':  list.sort((a,b) => a.precio - b.precio); break;
    case 'precio-desc': list.sort((a,b) => b.precio - a.precio); break;
    case 'nombre-asc':  list.sort((a,b) => a.nombre.localeCompare(b.nombre)); break;
    case 'nombre-desc': list.sort((a,b) => b.nombre.localeCompare(a.nombre)); break;
  }

  if (grid) renderTo(grid, list);
}

function renderTo(container, list) {
  if (total && container === grid) total.textContent = `(${list.length})`;
  container.innerHTML = list.map(cardHTML).join('');

  container.querySelectorAll('img[data-fallback]').forEach(img => {
    img.addEventListener('error', () => { img.src = 'img/no_producto.png'; }, { once: true });
  });
}

function cardHTML(p) {
  const img = p.imagen || 'img/no_producto.png';
  const precio = isFinite(+p.precio) ? CLP.format(+p.precio) : '';
  const pagina = p.pagina || 'productos.html';

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

// --- Carrito en LocalStorage ---
function onAddToCartClick(ev) {
  const btn = ev.target.closest('button[data-add]');
  if (!btn) return;
  const id = +btn.getAttribute('data-add');

  const cart = JSON.parse(localStorage.getItem(LS_CART) || '[]');
  const item = cart.find(x => x.id === id);
  if (item) item.cant += 1; else cart.push({ id, cant: 1 });
  localStorage.setItem(LS_CART, JSON.stringify(cart));

  btn.textContent = 'Agregado ✓';
  btn.disabled = true;
  setTimeout(() => { btn.textContent = 'Agregar'; btn.disabled = false; }, 900);
}

// --- Utilidades ---
function errorBox(msg){ return `<div class="col"><div class="alert alert-danger">${esc(msg)}</div></div>`; }
function esc(s=''){ return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;'); }
