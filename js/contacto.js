(() => {
  const form = document.getElementById('contactForm');
  const alertBox = document.getElementById('formAlert');
  const LS_KEY = 'rc_contact_msgs';

  function showAlert(msg, type = 'success') {
    alertBox.textContent = msg;
    alertBox.className = `alert alert-${type}`;
  }

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      showAlert('Por favor corrige los campos marcados.', 'danger');
      return;
    }

    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim(),
      ts: new Date().toISOString()
    };

    // Simulación de envío: guardar en LocalStorage
    try {
      const prev = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
      prev.push(data);
      localStorage.setItem(LS_KEY, JSON.stringify(prev));

      form.reset();
      form.classList.remove('was-validated');
      showAlert('¡Mensaje enviado! Te responderé pronto 💜', 'success');
    } catch (e) {
      console.error(e);
      showAlert('Ocurrió un error al guardar tu mensaje.', 'danger');
    }
  });
})();
