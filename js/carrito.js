// js/carrito.js
const URL = 'http://localhost:3000/productos'; // o 'json/productos.json'
const LS_CART = 'rc_cart';
const CLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });

const cartList   = document.getElementById('cartList');
const subtotalEl = document.getElementById('cartSubtotal');
const alertEl    = document.getElementById('alertCarrito');
const btnVaciar  = document.getElementById('btnVaciar');
const btnPagar   = document.getElementById('btnPagar');

let PRODUCTS = []; // catálogo
let CART = [];     // [{id, cant}]

document.addEventListener('DOMContentLoaded', init);

async function init() {
  try {
    const res = await fetch(URL);
    const data = await res.json();
    PRODUCTS = Array.isArray(data) ? data : (data.productos || []);

    CART = loadCart();
    render();

    cartList.addEventListener('click', onListClick);
    btnVaciar.addEventListener('click', vaciar);
    btnPagar.addEventListener('click', pagar);
  } catch (e) {
    console.error(e);
    showAlert('No se pudo cargar el carrito. Intenta nuevamente.', 'danger');
  }
}

function loadCart() {
  try { return JSON.parse(localStorage.getItem(LS_CART) || '[]'); }
  catch { return []; }
}
function saveCart() { localStorage.setItem(LS_CART, JSON.stringify(CART)); }

function render() {
  if (!CART.length) {
    cartList.innerHTML = `
      <div class="alert alert-info">
        Tu carrito está vacío. Agrega productos desde <a class="alert-link" href="productos.html">Productos</a>.
      </div>`;
    subtotalEl.textContent = CLP.format(0);
    return;
  }

  const items = CART.map(({ id, cant }) => {
    const p = PRODUCTS.find(x => x.id === id);
    return p ? { ...p, cant } : null;
  }).filter(Boolean);

  cartList.innerHTML = items.map(itemHTML).join('');

  cartList.querySelectorAll('img[data-fallback]').forEach(img => {
    img.addEventListener('error', () => { img.src = 'img/no_producto.png'; }, { once: true });
  });

  const subtotal = items.reduce((acc, it) => acc + (+it.precio || 0) * it.cant, 0);
  subtotalEl.textContent = CLP.format(subtotal);
}

function itemHTML(p) {
  const img    = p.imagen || 'img/no_producto.png';
  const precio = isFinite(+p.precio) ? CLP.format(+p.precio) : '$0';
  const total  = isFinite(+p.precio) ? CLP.format(+p.precio * p.cant) : '$0';

  return `
    <div class="card">
      <div class="card-body d-flex gap-3 align-items-center">
        <img src="${img}" data-fallback alt="${esc(p.nombre)}" class="rounded" style="width:90px;height:90px;object-fit:cover">
        <div class="flex-grow-1">
          <h6 class="mb-1">${esc(p.nombre)}</h6>
          <div class="text-muted small mb-2">${esc(p.descripcion || '')}</div>
          <div class="d-flex align-items-center gap-2">
            <div class="btn-group btn-group-sm" role="group" aria-label="Cantidad">
              <button class="btn btn-outline-secondary" data-dec="${p.id}">−</button>
              <span class="px-2">${p.cant}</span>
              <button class="btn btn-outline-secondary" data-inc="${p.id}">+</button>
            </div>
            <button class="btn btn-outline-danger btn-sm" data-del="${p.id}">
              <i class="bi bi-x-lg"></i> Eliminar
            </button>
          </div>
        </div>
        <div class="text-end">
          <div class="small text-muted">Precio</div>
          <div class="fw-semibold">${precio}</div>
          <div class="small text-muted mt-2">Total</div>
          <div class="fw-bold">${total}</div>
        </div>
      </div>
    </div>
  `;
}

function onListClick(e) {
  const dec = e.target.closest('[data-dec]');
  const inc = e.target.closest('[data-inc]');
  const del = e.target.closest('[data-del]');
  if (!dec && !inc && !del) return;

  if (dec) actualizarCantidad(+dec.dataset.dec, -1);
  if (inc) actualizarCantidad(+inc.dataset.inc, +1);
  if (del) eliminar(+del.dataset.del);
}

function actualizarCantidad(id, delta) {
  const item = CART.find(x => x.id === id);
  if (!item) return;
  item.cant += delta;
  if (item.cant <= 0) CART = CART.filter(x => x.id !== id);
  saveCart(); render();
}

function eliminar(id) {
  CART = CART.filter(x => x.id !== id);
  saveCart(); render();
}

function vaciar() {
  if (!CART.length) return;
  if (!confirm('¿Vaciar el carrito completo?')) return;
  CART = [];
  saveCart(); render();
}

function pagar() {
  if (!CART.length) { showAlert('Tu carrito está vacío.', 'warning'); return; }
  showAlert('Compra simulada ✅ ¡Gracias por tu pedido!', 'success');
  CART = [];
  saveCart(); render();
}

function showAlert(text, type='success') {
  alertEl.textContent = text;
  alertEl.className = `alert alert-${type}`;
}

function esc(s='') {
  return String(s)
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'",'&#39;');
}
    