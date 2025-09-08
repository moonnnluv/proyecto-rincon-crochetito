// js/detalle.js
(function () {
  const LS_CART = "rc_cart_v1";

  async function cargarProductos() {
    const urls = [
      "http://localhost:3000/productos", // json-server
      "json/productos.json",             // archivo local
      "productos.json",
      "/json/productos.json"
    ];
    for (const url of urls) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          // Soporta array plano o { productos: [...] }
          return Array.isArray(data) ? data : (data.productos || []);
        }
      } catch (e) {
        console.warn("[detalle.js] Error con", url, e);
      }
    }
    alert("Error cargando productos.");
    return [];
  }

  function pintar(prod) {
    const img = document.getElementById("pImagen");
    const nom = document.getElementById("pNombre");
    const pre = document.getElementById("pPrecio");
    const des = document.getElementById("pDesc");

    if (!prod) {
      nom.textContent = "Producto no encontrado";
      img.src = "img/no_producto.png";
      return;
    }

    img.src = prod.imagen || "img/no_producto.png";
    img.alt = prod.nombre || "Producto";
    // 👇 Fallback por si la ruta fallara
    img.addEventListener("error", () => {
      img.src = "img/no_producto.png";
    }, { once: true });

    nom.textContent = prod.nombre || "Producto";
    pre.textContent = `$${(Number(prod.precio) || 0).toLocaleString("es-CL")}`;
    des.textContent = prod.descripcion || "";

    document.getElementById("btnAgregar")
      ?.addEventListener("click", () => addToCart(prod));
  }

  function leerCarrito() {
    try { return JSON.parse(localStorage.getItem(LS_CART) || "[]"); }
    catch { return []; }
  }
  function guardarCarrito(c) {
    localStorage.setItem(LS_CART, JSON.stringify(c));
  }

  function addToCart(prod) {
    const cart = leerCarrito();
    const i = cart.findIndex(x => Number(x.id) === Number(prod.id));
    if (i >= 0) cart[i].cantidad += 1;
    else cart.push({
      id: prod.id,
      slug: prod.slug,
      nombre: prod.nombre,
      precio: prod.precio,
      imagen: prod.imagen,
      cantidad: 1
    });
    guardarCarrito(cart);
    alert("Producto agregado al carrito 🧺");
  }

  // Init
  const PROD_ID = Number(window.PRODUCT_ID);
  cargarProductos().then(lista => {
    const prod = lista.find(p => Number(p.id) === PROD_ID);
    pintar(prod);
  });
})();
