(() => {
  // Referencias a los elementos del formulario y alerta
  const form = document.getElementById('contactForm');
  const alertBox = document.getElementById('formAlert');
  const LS_KEY = 'rc_contact_msgs'; // clave de LocalStorage para guardar mensajes

  // Función para mostrar un mensaje en el alertBox
  function showAlert(msg, type = 'success') {
    alertBox.textContent = msg;
    alertBox.className = `alert alert-${type}`; // usa clases de Bootstrap
  }

  // Escucha el envío del formulario
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();     // evita recargar la página
    ev.stopPropagation();    // evita burbujear el evento a otros elementos

    // Validación usando HTML5 + Bootstrap (checkValidity)
    if (!form.checkValidity()) {
      form.classList.add('was-validated'); // activa estilos de error Bootstrap
      showAlert('Por favor corrige los campos marcados.', 'danger');
      return; // corta aquí si hay errores
    }

    // Si pasa la validación, armamos el objeto mensaje
    const data = {
      name: form.name.value.trim(),      // nombre (requerido, máx 100):contentReference[oaicite:2]{index=2}
      email: form.email.value.trim(),    // correo (máx 100, dominios válidos):contentReference[oaicite:3]{index=3}
      message: form.message.value.trim(),// comentario (requerido, máx 500):contentReference[oaicite:4]{index=4}
      ts: new Date().toISOString()       // timestamp del envío
    };

    // Simulación de envío: lo guardamos en LocalStorage
    try {
      const prev = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
      prev.push(data); // añadimos el nuevo mensaje al arreglo
      localStorage.setItem(LS_KEY, JSON.stringify(prev));

      // Limpieza visual y feedback al usuario
      form.reset();
      form.classList.remove('was-validated');
      showAlert('¡Mensaje enviado! Te responderé pronto 💜', 'success');
    } catch (e) {
      console.error(e);
      showAlert('Ocurrió un error al guardar tu mensaje.', 'danger');
    }
  });
})();
