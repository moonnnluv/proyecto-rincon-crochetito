// js/admin.js
const LS_KEY = "rc_productos";

function leerProductos() {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    }

    function guardarProductos(data) {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
    }

    function renderTabla() {
    const tbody = document.querySelector("#tablaProductos tbody");
    tbody.innerHTML = "";

    const productos = leerProductos();
    productos.forEach((p, idx) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
        <td>${p.id}</td>
        <td>${p.nombre}</td>
        <td>${p.descripcion}</td>
        <td>$${p.precio}</td>
        <td><img src="${p.imagen}" width="40"></td>
        <td>
            <button onclick="editar(${p.id})">Editar</button>
            <button onclick="eliminar(${p.id})">Eliminar</button>
        </td>
        `;
        tbody.appendChild(tr);
    });
    }

    function editar(id) {
    const productos = leerProductos();
    const p = productos.find(x => x.id === id);
    if (!p) return;

    document.getElementById("idProducto").value = p.id;
    document.getElementById("nombre").value = p.nombre;
    document.getElementById("descripcion").value = p.descripcion;
    document.getElementById("precio").value = p.precio;
    document.getElementById("imagen").value = p.imagen;
    }

    function eliminar(id) {
    let productos = leerProductos();
    productos = productos.filter(p => p.id !== id);
    guardarProductos(productos);
    renderTabla();
    }

    document.getElementById("formProducto").addEventListener("submit", (e) => {
    e.preventDefault();

    const id = parseInt(document.getElementById("idProducto").value || Date.now());
    const nombre = document.getElementById("nombre").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const precio = parseFloat(document.getElementById("precio").value);
    const imagen = document.getElementById("imagen").value.trim();

    let productos = leerProductos();
    const idx = productos.findIndex(p => p.id === id);

    const nuevo = { id, nombre, descripcion, precio, imagen };

    if (idx >= 0) {
        productos[idx] = nuevo; // editar
    } else {
        productos.push(nuevo); // nuevo
    }

    guardarProductos(productos);
    renderTabla();
    e.target.reset();
    });

window.addEventListener("DOMContentLoaded", renderTabla);
