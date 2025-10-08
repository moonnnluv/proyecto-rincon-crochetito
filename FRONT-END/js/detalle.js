// js/detalle.js
(function () {
  // Clave para guardar/leer el carrito en LocalStorage
  const LS_CART = "rc_cart_v1";

  // Carga el catálogo de productos intentando varias rutas posibles:
  // - json-server local
  // - archivo JSON en distintas ubicaciones del proyecto
  async function cargarProductos() {
    const urls = [
      "http://localhost:3000/productos", // json-server
      "json/productos.json",             // archivo local (carpeta /json)
      "productos.json",                  // archivo en la raíz (si lo tienes ahí)
      "/json/productos.json"             // ruta absoluta a /json
    ];

    // Probamos cada URL hasta que una responda 200 OK y devuelva JSON válido
    for (const url of urls) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          // Soporta dos estructuras:
          // 1) Un array plano de productos
          // 2) Un objeto con la propiedad { productos: [...] }
          return Array.isArray(data) ? data : (data.productos || []);
        }
      } catch (e) {
        // Si falla una URL, seguimos con la siguiente
        console.warn("[detalle.js] Error con", url, e);
      }
    }

    // Si ninguna URL funcionó, avisamos y devolvemos lista vacía
    alert("Error cargando productos.");
    return [];
  }

  // Pinta en el DOM la info del producto seleccionado
  function pintar(prod) {
    const img = document.getElementById("pImagen");
    const nom = document.getElementById("pNombre");
    const pre = document.getElementById("pPrecio");
    const des = document.getElementById("pDesc");

    // Si no se encontró el producto (id inválido o no existe)
    if (!prod) {
      nom.textContent = "Producto no encontrado";
      img.src = "img/no_producto.png";
      return;
    }

    // Imagen (con fallback si falla la ruta)
    img.src = prod.imagen || "img/no_producto.png";
    img.alt = prod.nombre || "Producto";
    img.addEventListener(
      "error",
      () => { img.src = "img/no_producto.png"; },
      { once: true }
    );

    // Nombre, precio CLP y descripción
    nom.textContent = prod.nombre || "Producto";
    pre.textContent = `$${(Number(prod.precio) || 0).toLocaleString("es-CL")}`;
    des.textContent = prod.descripcion || "";

    // Botón "Agregar al carrito" (si existe en el HTML)
    document.getElementById("btnAgregar")
      ?.addEventListener("click", () => addToCart(prod));
  }

  // Lee el carrito desde LocalStorage
  function leerCarrito() {
    try { return JSON.parse(localStorage.getItem(LS_CART) || "[]"); }
    catch { return []; }
  }

  // Guarda el carrito completo en LocalStorage
  function guardarCarrito(c) {
    localStorage.setItem(LS_CART, JSON.stringify(c));
  }

  // Agrega el producto actual al carrito:
  // - Si ya existe, incrementa cantidad
  // - Si no, lo inserta con cantidad 1
  function addToCart(prod) {
    const cart = leerCarrito();
    const i = cart.findIndex(x => Number(x.id) === Number(prod.id));

    if (i >= 0) {
      cart[i].cantidad += 1;
    } else {
      cart.push({
        id: prod.id,
        slug: prod.slug,
        nombre: prod.nombre,
        precio: prod.precio,
        imagen: prod.imagen,
        cantidad: 1
      });
    }

    guardarCarrito(cart);
    alert("Producto agregado al carrito 🧺");
  }

  // ===== Inicio: buscar el producto por su ID y pintarlo =====
  // Se espera que en el HTML (o en otro script) exista window.PRODUCT_ID
  // con el ID numérico del producto que se está visualizando.
  const PROD_ID = Number(window.PRODUCT_ID);

  // Carga catálogo, busca el producto por id y lo muestra
  cargarProductos().then(lista => {
    const prod = lista.find(p => Number(p.id) === PROD_ID);
    pintar(prod);
  });

})();
// ============================================================