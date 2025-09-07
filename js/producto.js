let url = 'http://localhost:3000/'; 

fetch(url)
  .then(r => r.json())
  .then(data => mostrarData(data))
  .catch(console.error);

const mostrarData = (data) => {
  let tbody = "";
  for (let i = 0; i < data.length; i++) {
    const p = data[i];
    const img = p.imagen || 'img/no_producto.jpg';
    tbody += `
      <tr>
        <td>${p.nombre}</td>
        <td>
          <a href="detalleProducto.html?nombre=${encodeURIComponent(p.nombre)}&imagen=${encodeURIComponent(img)}&precio=${encodeURIComponent(p.precio)}&descripcion=${encodeURIComponent(p.descripcion)}" target="_blank">
            <img src="${img}" class="foto" alt="${p.nombre}">
          </a>
        </td>
        <td>${p.precio}</td>
        <td>${p.descripcion}</td>
      </tr>`;
  }
  document.getElementById('ropadeportiva').innerHTML = tbody;
};
