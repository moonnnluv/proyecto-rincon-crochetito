// js/carrito.js
// ============================================================
// Carrito de compras (Frontend con LocalStorage)
// - Carga catálogo desde URL (JSON server o archivo local)
// - Lee/escribe carrito en localStorage
// - Renderiza ítems y subtotal
// - Permite aumentar/disminuir cantidad, eliminar, vaciar y "pagar"
// ============================================================

// Endpoint del catálogo (puede ser JSON Server o un JSON local)
const URL = 'http://localhost:3000/productos'; // o 'json/productos.json'

// Clave para guardar el carrito en LocalStorage
const LS_CART = 'rc_cart';

// Formateador de moneda en CLP (Chile)
const CLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });

// Referencias a elementos del DOM (deben existir en el HTML)
const cartList   = document.getElementById('cartList');       // contenedor de tarjetas del carrito
const subtotalEl = document.getElementById('cartSubtotal');   // span/div para subtotal
const alertEl    = document.getElementById('alertCarrito');   // alerta para mensajes (éxito/error)
const btnVaciar  = document.getElementById('btnVaciar');      // botón "Vaciar carrito"
const btnPagar   = document.getElementById('btnPagar');       // botón "Pagar"

// Estado en memoria (no persistente)
let PRODUCTS = []; // catálogo completo (se carga desde URL)
let CART = [];     // arreglo de líneas del carrito: [{id, cant}]

// Cuando el DOM está listo, arrancamos la app del carrito
document.addEventListener('DOMContentLoaded', init);

// Inicializa: carga productos, carrito, renderiza y conecta eventos
async function init() {
  try {
    // 1) Trae el catálogo de productos
    const res = await fetch(URL);
    const data = await res.json();

    // Soporta dos formas de respuesta: arreglo plano o { productos: [...] }
    PRODUCTS = Array.isArray(data) ? data : (data.productos || []);

    // 2) Carga el carrito desde LocalStorage
    CART = loadCart();

    // 3) Pinta el carrito en la página
    render();

    // 4) Escucha clicks en la lista (delegación para +, -, eliminar)
    cartList.addEventListener('click', onListClick);

    // 5) Botones globales
    btnVaciar.addEventListener('click', vaciar);
    btnPagar.addEventListener('click', pagar);
  } catch (e) {
    // Si falla la carga del catálogo o algo inesperado
    console.error(e);
    showAlert('No se pudo cargar el carrito. Intenta nuevamente.', 'danger');
  }
}

// Lee el carrito desde LocalStorage (devuelve [] si no hay o si hay error)
function loadCart() {
  try { return JSON.parse(localStorage.getItem(LS_CART) || '[]'); }
  catch { return []; }
}

// Guarda el estado actual del carrito en LocalStorage
function saveCart() { localStorage.setItem(LS_CART, JSON.stringify(CART)); }

// Dibuja el carrito completo (lista de ítems + subtotal). Si está vacío, muestra aviso.
function render() {
  if (!CART.length) {
    cartList.innerHTML = `
      <div class="alert alert-info">
        Tu carrito está vacío. Agrega productos desde <a class="alert-link" href="productos.html">Productos</a>.
      </div>`;
    subtotalEl.textContent = CLP.format(0);
    return;
  }

  // Mapea cada línea del carrito a su producto completo del catálogo
  const items = CART.map(({ id, cant }) => {
    const p = PRODUCTS.find(x => x.id === id);
    return p ? { ...p, cant } : null; // combina datos del producto + cantidad
  }).filter(Boolean); // descarta nulos si algún id no existe en PRODUCTS

  // Pinta las tarjetas de ítem
  cartList.innerHTML = items.map(itemHTML).join('');

  // Fallback de imagen: si falla la carga, usar "no_producto.png"
  cartList.querySelectorAll('img[data-fallback]').forEach(img => {
    img.addEventListener('error', () => { img.src = 'img/no_producto.png'; }, { once: true });
  });

  // Calcula subtotal (precio * cantidad) y muestra formateado
  const subtotal = items.reduce((acc, it) => acc + (+it.precio || 0) * it.cant, 0);
  subtotalEl.textContent = CLP.format(subtotal);
}

// Devuelve el HTML (string) de una tarjeta de producto dentro del carrito
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

// Maneja clicks dentro de la lista: detectar si fue -, + o eliminar
function onListClick(e) {
  const dec = e.target.closest('[data-dec]'); // botón disminuir
  const inc = e.target.closest('[data-inc]'); // botón aumentar
  const del = e.target.closest('[data-del]'); // botón eliminar
  if (!dec && !inc && !del) return;

  if (dec) actualizarCantidad(+dec.dataset.dec, -1);
  if (inc) actualizarCantidad(+inc.dataset.inc, +1);
  if (del) eliminar(+del.dataset.del);
}

// Cambia la cantidad de un ítem del carrito por delta (+1 o -1)
// Si queda en 0 o menos, lo saca del carrito
function actualizarCantidad(id, delta) {
  const item = CART.find(x => x.id === id);
  if (!item) return;
  item.cant += delta;
  if (item.cant <= 0) CART = CART.filter(x => x.id !== id);
  saveCart(); render();
}

// Quita un producto del carrito por id y vuelve a renderizar
function eliminar(id) {
  CART = CART.filter(x => x.id !== id);
  saveCart(); render();
}

// Vacía todo el carrito (con confirmación)
function vaciar() {
  if (!CART.length) return;
  if (!confirm('¿Vaciar el carrito completo?')) return;
  CART = [];
  saveCart(); render();
}

// Simula el pago: muestra mensaje, limpia carrito y vuelve a pintar
function pagar() {
  if (!CART.length) { showAlert('Tu carrito está vacío.', 'warning'); return; }
  showAlert('Compra simulada ✅ ¡Gracias por tu pedido!', 'success');
  CART = [];
  saveCart(); render();
}

// Muestra un mensaje en el contenedor de alertas (Bootstrap)
function showAlert(text, type='success') {
  alertEl.textContent = text;
  alertEl.className = `alert alert-${type}`;
}

// Escape básico para evitar HTML injection en textos visibles
function esc(s='') {
  return String(s)
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'",'&#39;');
}
