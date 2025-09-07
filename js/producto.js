// js/productos.js
    const URL = 'http://localhost:3000/productos'; // json-server --watch JSON/productos.json --port 3000
    const CLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });

    const grid   = document.getElementById('gridProductos');
    const inputQ = document.getElementById('q');        // <input id="q" ...>
    const selOrd = document.getElementById('orden');    // <select id="orden" ...>
    const total  = document.getElementById('totalProd'); // opcional: <span id="totalProd">

    let ALL = []; // cache de productos

    init();

    async function init() {
    try {
        const res = await fetch(URL);
        ALL = await res.json();             // /productos devuelve []
        render(ALL);                        // pinta todo por defecto
        wireEvents();                       // activa buscar/ordenar
    } catch (e) {
        console.error(e);
        grid.innerHTML = `<div class="col"><div class="alert alert-danger">No se pudieron cargar los productos.</div></div>`;
    }
    }

    function wireEvents() {
    if (inputQ)  inputQ.addEventListener('input', applyFilters);
    if (selOrd)  selOrd.addEventListener('change', applyFilters);
    }

    function applyFilters() {
    const q = (inputQ?.value || '').trim().toLowerCase();

    // filtrar
    let list = ALL.filter(p =>
        p.nombre.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q)
    );

    // ordenar
    switch (selOrd?.value) {
        case 'precio-asc':  list.sort((a,b) => a.precio - b.precio); break;
        case 'precio-desc': list.sort((a,b) => b.precio - a.precio); break;
        case 'nombre-asc':  list.sort((a,b) => a.nombre.localeCompare(b.nombre)); break;
        case 'nombre-desc': list.sort((a,b) => b.nombre.localeCompare(a.nombre)); break;
    }

    render(list);
    }

    function render(list) {
    if (total) total.textContent = `(${list.length})`;

    grid.innerHTML = list.map(p => cardHTML(p)).join('');

    // Fallback de imagen si falla la ruta del JSON
    grid.querySelectorAll('img[data-fallback]').forEach(img => {
        img.addEventListener('error', () => {
        img.src = 'img/no_producto.png';
        }, { once: true });
    });
    }

    function cardHTML(p) {
    const img = p.imagen || 'img/no_producto.png';
    const precio = CLP.format(Number(p.precio));

    // Tip: controla alto de imagen con CSS (ej. .card-img-top { aspect-ratio: 16/10; object-fit: cover; })
    return `
        <div class="col-12 col-sm-6 col-lg-4 col-xxl-3">
        <div class="card h-100 shadow-sm">
            <img src="${img}" data-fallback class="card-img-top" alt="${escapeHTML(p.nombre)}" loading="lazy">
            <div class="card-body d-flex flex-column">
            <h5 class="card-title mb-1">${escapeHTML(p.nombre)}</h5>
            <p class="text-muted small mb-2">${escapeHTML(p.descripcion)}</p>
            <p class="fw-bold mb-3">${precio}</p>
            <div class="mt-auto d-flex gap-2">
                <a href="${p.pagina || `detalleProducto.html?id=${encodeURIComponent(p.id)}`}" class="btn btn-dark btn-sm">Ver detalles</a>
                <button class="btn btn-outline-dark btn-sm" data-id="${p.id}">Agregar</button>
            </div>
            </div>
        </div>
        </div>
    `;
    }

    function escapeHTML(str='') {
    return String(str)
        .replaceAll('&','&amp;')
        .replaceAll('<','&lt;')
        .replaceAll('>','&gt;')
        .replaceAll('"','&quot;')
        .replaceAll("'",'&#39;');
    }
