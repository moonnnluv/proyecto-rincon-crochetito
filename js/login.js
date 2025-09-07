// Toggle mostrar/ocultar contraseña
const passInput = document.getElementById('password');
const btnToggle = document.getElementById('btnTogglePass');

if (btnToggle && passInput) {
    btnToggle.addEventListener('click', () => {
    if (passInput.type === 'password') {
        passInput.type = 'text';
        btnToggle.innerHTML = '<span class="bi bi-eye-slash"></span> Ocultar';
    } else {
        passInput.type = 'password';
        btnToggle.innerHTML = '<span class="bi bi-eye"></span> Mostrar';
    }
    });
}

/* Validaciones comunes */
const EMAIL_DOMAINS = ["duoc.cl","profesor.duoc.cl","gmail.com"];
function emailValido(v){
    if(!v) return false;
    if(v.length>100) return false;
    const m = v.match(/^[^@\s]+@([^@\s]+)$/);
    if(!m) return false;
    const domain = m[1].toLowerCase();
    return EMAIL_DOMAINS.includes(domain);
}
function maxLen(v,max){ return (v||"").length<=max; }
function minLen(v,min){ return (v||"").length>=min; }

/* RUN chileno (sin puntos ni guion, con dígito verificador) */
function validarRUN(run){
    if(!run) return false;
    if(!/^[0-9kK]{7,9}$/.test(run)) return false;
    const body = run.slice(0,-1);
    const dv = run.slice(-1).toUpperCase();
    let suma=0, mul=2;
    for(let i=body.length-1;i>=0;i--){
    suma += parseInt(body[i],10)*mul;
    mul = (mul===7)?2:mul+1;
}
    const res = 11 - (suma % 11);
    const dvCalc = (res===11) ? "0" : (res===10 ? "K" : String(res));
    return dvCalc === dv;
}

// Validación Bootstrap
const form = document.getElementById('formLogin');
const alertGlobal = document.getElementById('alertGlobal');
const emailInput = document.getElementById('email');
const rememberMe = document.getElementById('rememberMe');

if (form && emailInput && passInput) {
    form.addEventListener('submit', (event) => {
    alertGlobal && alertGlobal.classList.add('d-none');

    // limpiar mensajes previos
    if (emailInput.setCustomValidity) emailInput.setCustomValidity('');
    if (passInput.setCustomValidity)  passInput.setCustomValidity('');

    // reglas extra (dominios permitidos y largo de pass)
    let ok = true;
    if (!emailValido(emailInput.value)) {
        emailInput.setCustomValidity && emailInput.setCustomValidity('Usa @duoc.cl, @profesor.duoc.cl o @gmail.com (máx 100).');
        ok = false;
    }
    if (!(minLen(passInput.value,4) && maxLen(passInput.value,10))) {
        passInput.setCustomValidity && passInput.setCustomValidity('La contraseña debe tener entre 4 y 10 caracteres.');
        ok = false;
    }

    if (!form.checkValidity() || !ok) {
        event.preventDefault();
        event.stopPropagation();
        form.classList.add('was-validated');
        alertGlobal && alertGlobal.classList.remove('d-none');
        return;
    }

    // Simulación de login exitoso
    event.preventDefault(); // quita esto si conectas back-end real
    localStorage.setItem('rc_user_email', emailInput.value.trim());
    if (rememberMe && rememberMe.checked) localStorage.setItem('rc_remember','1');
    else localStorage.removeItem('rc_remember');

    alert('¡Sesión iniciada! (simulación)');
    window.location.href = 'home.html';
    });
}