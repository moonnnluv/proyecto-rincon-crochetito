// js/registro.js
(() => {
  const LS_REG = "rc_is_registered"; // flag en LocalStorage para "registro completado"

  // ---------------------------------------------
  // Utilidad: mostrar mensajes en un <div class="alert">
  // ---------------------------------------------
    function showAlert(el, msg, type = "success") {
        if (!el) return alert(msg);
        el.textContent = msg;
        el.className = `alert alert-${type}`;
        el.classList.remove("d-none");
        setTimeout(() => el.classList.add("d-none"), 2500);
    }

    // ---------------------------------------------
    // RUN chileno (módulo 11) con o sin formato
    // ---------------------------------------------
    function validarRUN(run) {
        if (!run) return false;
        const v = run.replace(/[.\-]/g, "").toUpperCase();
        if (!/^[0-9K]{8,9}$/.test(v)) return false; // 7-8 números + DV
        const cuerpo = v.slice(0, -1);
        const dv = v.slice(-1);
        let suma = 0, m = 2;
        for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo[i], 10) * m;
        m = (m === 7) ? 2 : m + 1;
        }
        const resto  = 11 - (suma % 11);
        const dvCalc = (resto === 11) ? "0" : (resto === 10) ? "K" : String(resto);
        return dv === dvCalc;
    }

    // ---------------------------------------------
    // Datos mock: comunas por región (select dependiente)
    // ---------------------------------------------
    const COMUNAS = {
        "Región Metropolitana": ["Santiago", "Maipú", "Las Condes", "Puente Alto", "Ñuñoa"],
        "Valparaíso": ["Valparaíso", "Viña del Mar", "Quilpué", "Villa Alemana"],
        "Biobío": ["Concepción", "Talcahuano", "San Pedro de la Paz", "Coronel"],
    };

    // Normaliza: sin acentos, minúsculas, espacios simples
    function norm(s = "") {
        return String(s)
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");
    }

    // Índice normalizado de regiones -> comunas
    const NORM_COMUNAS = {};
    Object.keys(COMUNAS).forEach(k => { NORM_COMUNAS[norm(k)] = COMUNAS[k]; });

    // Códigos comunes -> nombre de región
    const MAP_REGION = {
        "13":  "Región Metropolitana",
        "rm":  "Región Metropolitana",
        "05":  "Valparaíso",
        "v":   "Valparaíso",
        "08":  "Biobío",
        "viii":"Biobío"
    };

    // ---------------------------------------------
    // Helper: alternar visibilidad de contraseña
    // ---------------------------------------------
    function hookTogglePassword(inputId, btnId) {
        const input = document.getElementById(inputId);
        const btn = document.getElementById(btnId);
        if (!input || !btn) return;
        btn.addEventListener("click", () => {
        input.type = (input.type === "password") ? "text" : "password";
        const icon = btn.querySelector("i");
        if (icon) {
            icon.classList.toggle("bi-eye");
            icon.classList.toggle("bi-eye-slash");
        }
        });
    }

    // ---------------------------------------------
    // Arranque cuando el DOM está listo
    // ---------------------------------------------
    document.addEventListener("DOMContentLoaded", () => {
        console.info("[registro.js] cargado ✔");

        // Referencias (usa estos IDs en tu HTML)
        const form      = document.getElementById("formRegistro");
        const alertBox  = document.getElementById("regAlert");
        const run       = document.getElementById("run");
        const correo    = document.getElementById("correo");
        const telefono  = document.getElementById("telefono");
        const pass      = document.getElementById("pass");
        const pass2     = document.getElementById("pass2");
        const region    = document.getElementById("region");
        const comuna    = document.getElementById("comuna");

        // Mostrar/ocultar pass
        hookTogglePassword("pass",  "togglePass");
        hookTogglePassword("pass2", "togglePass2");

        // RUN a mayúsculas mientras se escribe
        run?.addEventListener("input", () => { run.value = run.value.toUpperCase(); });

        // ---------------------------------------------
        // Región → Comunas (tolerante a values y textos distintos)
        // ---------------------------------------------
        function llenarComunasDesdeRegion() {
        if (!region || !comuna) return;

        // Candidates: value y texto visible
        const rawVal  = region.value ?? "";
        const rawText = region.options[region.selectedIndex]?.text ?? "";

        // 1) Si el value es un código mapeado, úsalo; si no, usa el propio value
        let keyName = MAP_REGION[norm(rawVal)] || rawVal;

        // 2) Busca comunas por nombre normalizado (del value o del texto)
        let arr =
            NORM_COMUNAS[norm(keyName)] ||
            NORM_COMUNAS[norm(rawText)] ||
            null;

        // 3) Fallback definitivo: si no hay match, toma la PRIMERA región del objeto
        if (!arr) {
            const firstKey = Object.keys(COMUNAS)[0];
            arr = COMUNAS[firstKey] || [];
            console.warn("[registro.js] Región no mapeada. Usando fallback:", firstKey);
        }

        // Render de comunas
        comuna.innerHTML =
            '<option value="" disabled selected>Seleccione…</option>' +
            arr.map(c => `<option>${c}</option>`).join("");

        // Habilita solo si hay comunas
        comuna.disabled = arr.length === 0;

        // (Opcional) autoseleccionar la 1ª comuna
        // if (arr.length) { comuna.value = arr[0]; }
        }

        region?.addEventListener("change", llenarComunasDesdeRegion);

        // Si la región ya viene seleccionada, llena comunas al cargar
        llenarComunasDesdeRegion();

        // ---------------------------------------------
        // Validación + "submit" del registro (simulado)
        // ---------------------------------------------
        form?.addEventListener("submit", (e) => {
        e.preventDefault();
        e.stopPropagation();

        // RUN (obligatorio + válido)
        if (run && !validarRUN(run.value)) run.setCustomValidity("RUN inválido");
        else run?.setCustomValidity("");

        // Correo con dominios permitidos
        const okMail = /@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i.test(correo?.value || "");
        if (correo && !okMail) correo.setCustomValidity("Dominio no permitido");
        else correo?.setCustomValidity("");

        // Teléfono: opcional; si viene, formato CL (9 dígitos, acepta +56 9)
        const tel = telefono?.value.trim();
        if (telefono && tel && !/^(\+?56)?\s?9\d{8}$/.test(tel))
            telefono.setCustomValidity("Formato CL: 9 dígitos");
        else telefono?.setCustomValidity("");

        // Passwords: largo 4–10 y coincidencia
        const lenOk = (pass?.value.length || 0) >= 4 && (pass?.value.length || 0) <= 10;
        const eqOk  = pass?.value === pass2?.value;
        if (pass && !lenOk) pass.setCustomValidity("Largo inválido"); else pass?.setCustomValidity("");
        if (pass2 && !eqOk) pass2.setCustomValidity("No coincide");   else pass2?.setCustomValidity("");

        // Feedback Bootstrap y corte si hay errores
        form.classList.add("was-validated");
        if (!form.checkValidity()) {
            showAlert(alertBox, "Corrige los campos marcados.", "danger");
            return;
        }

        // Registro simulado: no guardamos datos personales, solo un flag
        localStorage.setItem(LS_REG, "1");

        showAlert(alertBox, "¡Registro validado! Tienes 10% de descuento 🎉");
        setTimeout(() => { window.location.href = "carrito.html"; }, 900);
        });
    });
})();
