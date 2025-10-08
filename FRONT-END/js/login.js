// Toggle mostrar/ocultar contraseña
// -------------------------------------------------
// Obtiene los elementos del input de contraseña y el botón toggle.
// Si existen, agrega el listener para alternar entre 'password' y 'text'.
const passInput = document.getElementById('password');
const btnToggle = document.getElementById('btnTogglePass');

if (btnToggle && passInput) {
    btnToggle.addEventListener('click', () => {
        if (passInput.type === 'password') {
        // Mostrar contraseña
        passInput.type = 'text';
        btnToggle.innerHTML = '<span class="bi bi-eye-slash"></span> Ocultar';
        } else {
        // Ocultar contraseña
        passInput.type = 'password';
        btnToggle.innerHTML = '<span class="bi bi-eye"></span> Mostrar';
        }
    });
    }

    /* =================================================
    Validaciones comunes (reutilizables)
    ================================================= */

    // Dominios permitidos para el correo
    const EMAIL_DOMAINS = ["duoc.cl","profesor.duoc.cl","gmail.com"];

    // Valida formato general de email y que el dominio esté permitido.
    // - No vacío
    // - Largo <= 100
    // - Forma local@dominio
    // - Dominio ∈ EMAIL_DOMAINS
    function emailValido(v){
    if(!v) return false;
    if(v.length > 100) return false;
    const m = v.match(/^[^@\s]+@([^@\s]+)$/); // captura el dominio
    if(!m) return false;
    const domain = m[1].toLowerCase();
    return EMAIL_DOMAINS.includes(domain);
    }

    // Helpers de largo mínimo/máximo
    function maxLen(v, max){ return (v || "").length <= max; }
    function minLen(v, min){ return (v || "").length >= min; }

    /* =================================================
    RUN chileno (sin puntos ni guion, con dígito verificador)
    - Acepta 7 a 9 caracteres [0-9K]
    - Calcula DV con módulo 11
    ================================================= */
    function validarRUN(run){
    if(!run) return false;
    if(!/^[0-9kK]{7,9}$/.test(run)) return false;

    const body = run.slice(0, -1);           // todo menos el DV
    const dv   = run.slice(-1).toUpperCase();// dígito verificador ingresado
    let suma = 0, mul = 2;

    // Recorre el cuerpo desde el final multiplicando por 2..7 cíclico
    for (let i = body.length - 1; i >= 0; i--) {
        suma += parseInt(body[i], 10) * mul;
        mul = (mul === 7) ? 2 : mul + 1;
    }

    // Cálculo de DV esperado
    const res = 11 - (suma % 11);
    const dvCalc = (res === 11) ? "0" : (res === 10 ? "K" : String(res));

    return dvCalc === dv;
    }

    /* =================================================
    Validación de Login con Bootstrap
    - Reglas extra:
        * email con dominios permitidos
        * password entre 4 y 10 caracteres
    - Muestra feedback con .was-validated y alertas
    ================================================= */
    const form        = document.getElementById('formLogin');
    const alertGlobal = document.getElementById('alertGlobal');
    const emailInput  = document.getElementById('email');
    const rememberMe  = document.getElementById('rememberMe');

    if (form && emailInput && passInput) {
    form.addEventListener('submit', (event) => {
        // Oculta alerta global (si estaba visible de un intento anterior)
        if (alertGlobal) alertGlobal.classList.add('d-none');

        // Limpia mensajes previos (importante para que checkValidity recalcule)
        if (emailInput.setCustomValidity) emailInput.setCustomValidity('');
        if (passInput.setCustomValidity)  passInput.setCustomValidity('');

        // Reglas personalizadas (además de los required del HTML)
        let ok = true;

        // 1) Email con dominios permitidos y largo <= 100
        if (!emailValido(emailInput.value)) {
        emailInput.setCustomValidity && emailInput.setCustomValidity(
            'Usa @duoc.cl, @profesor.duoc.cl o @gmail.com (máx 100).'
        );
        ok = false;
        }

        // 2) Password entre 4 y 10 caracteres
        if (!(minLen(passInput.value, 4) && maxLen(passInput.value, 10))) {
        passInput.setCustomValidity && passInput.setCustomValidity(
            'La contraseña debe tener entre 4 y 10 caracteres.'
        );
        ok = false;
        }

        // 3) Si falla HTML5 o las reglas extra, prevenimos el submit y mostramos estilos de error
        if (!form.checkValidity() || !ok) {
        event.preventDefault();
        event.stopPropagation();
        form.classList.add('was-validated');      // activa feedback de Bootstrap
        if (alertGlobal) alertGlobal.classList.remove('d-none'); // muestra alerta general
        return;
        }

        // 4) Simulación de login exitoso (frontend)
        //    * Si conectas un backend real, quita el preventDefault y envía el form.
        event.preventDefault();
        localStorage.setItem('rc_user_email', emailInput.value.trim());

        // "Recordarme": persistimos una marca simple
        if (rememberMe && rememberMe.checked) localStorage.setItem('rc_remember', '1');
        else localStorage.removeItem('rc_remember');

        alert('¡Sesión iniciada! (simulación)');
        window.location.href = 'home.html'; // redirección post login
    });
    }

    /* =================================================
    Atajos de demo: Vista Admin / Vista Cliente
    - Crea una "sesión ficticia" con rol distinto
    - Redirige a home_admin.html o home_cliente.html
    ================================================= */
    (function(){
    const LS_AUTH = "nxv3_auth";

    // Función utilitaria para ir a una vista demo con rol precargado
    function go(role){
        // Limpia sesión previa (si hubiera)
        localStorage.removeItem(LS_AUTH);

        // Crea sesión demo según el rol solicitado
        const demoUser = (role === "ADMIN")
        ? { correo: "admin@demo.local",   nombre: "Admin Demo",   run: "11.111.111-1", rol: "ADMIN",   ts: Date.now() }
        : { correo: "cliente@demo.local", nombre: "Cliente Demo", run: "22.222.222-2", rol: "CLIENTE", ts: Date.now() };

        // Persiste la "sesión"
        localStorage.setItem(LS_AUTH, JSON.stringify(demoUser));

        // Redirige a la página de inicio correspondiente
        window.location.href = (role === "ADMIN") ? "home_admin.html" : "home_cliente.html";
    }

    // Botones (si existen en el DOM) que activan la vista demo
    document.getElementById("btnVistaAdmin")  ?.addEventListener("click", () => go("ADMIN"));
    document.getElementById("btnVistaCliente")?.addEventListener("click", () => go("CLIENTE"));
    })();
