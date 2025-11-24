// src/context/authContext.test.jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./authContext";

// Helper para crear un JWT falso con exp
function createFakeJwtWithExp(expSeconds) {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = { exp: expSeconds };

  const toBase64Url = (obj) => {
    const json = JSON.stringify(obj);

    // Compat: usar btoa si existe, si no usar Buffer (Node)
    let base64;
    if (typeof btoa === "function") {
      base64 = btoa(json);
    } else if (typeof Buffer !== "undefined") {
      base64 = Buffer.from(json, "binary").toString("base64");
    } else {
      throw new Error("No hay forma de hacer base64 en este entorno");
    }

    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };

  return `${toBase64Url(header)}.${toBase64Url(payload)}.signature`;
}

// Componente de prueba que usa el contexto
function TestAuthComponent() {
  const { user, login, logout } = useAuth();

  return (
    <div>
      <span data-testid="user-email">{user?.email ?? ""}</span>
      <button onClick={() => login("admin@crochetito.cl", "12345678")}>
        Hacer login
      </button>
      <button onClick={logout}>Hacer logout</button>
    </div>
  );
}

// Componente para exponer el hook directamente en algunos tests
let authRef = null;
function ExposeAuth() {
  authRef = useAuth();
  return null;
}

describe("AuthContext + JWT", () => {
  beforeEach(() => {
    // limpiamos mocks y storage antes de cada test
    vi.restoreAllMocks();
    localStorage.clear();
    authRef = null;
  });

  it("guarda el token, el usuario y rc_admin_id cuando el login es exitoso", async () => {
    // Respuesta fake del backend
    const fakeResponse = {
      token: "FAKE_JWT_TOKEN",
      id: 1,
      nombre: "Admin Crochetito",
      email: "admin@crochetito.cl",
      rol: "SUPERADMIN",
      estado: "ACTIVO",
    };

    // Mock de fetch para el endpoint /v1/auth/login
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => fakeResponse,
    });

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    const btnLogin = screen.getByRole("button", { name: /hacer login/i });

    // Ejecutamos login
    fireEvent.click(btnLogin);

    // Esperamos a que se resuelva la promesa, se actualice el contexto
    // y corran los useEffect que sincronizan localStorage
    await waitFor(() => {
      // Token guardado
      expect(localStorage.getItem("rc_token")).toBe("FAKE_JWT_TOKEN");

      // Usuario guardado
      const storedUser = JSON.parse(localStorage.getItem("rc_user"));
      expect(storedUser).toMatchObject({
        email: "admin@crochetito.cl",
        rol: "SUPERADMIN",
      });

      // rc_admin_id debe quedar seteado para ADMIN / SUPERADMIN
      expect(localStorage.getItem("rc_admin_id")).toBe("1");

      // En la interfaz, el email del usuario debería mostrarse
      expect(screen.getByTestId("user-email").textContent).toBe(
        "admin@crochetito.cl"
      );
    });

    // Y fetch debe haber sido llamado una vez
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    // opcional: verificar que golpea al endpoint correcto
    expect(fetchSpy.mock.calls[0][0]).toMatch(/\/v1\/auth\/login$/);
  });

  it("al hacer logout limpia el usuario, el token y rc_admin_id del localStorage", async () => {
    // Dejamos un usuario y token previamente guardados
    const initialUser = {
      id: 1,
      nombre: "Admin Crochetito",
      email: "admin@crochetito.cl",
      rol: "SUPERADMIN",
      estado: "ACTIVO",
    };
    localStorage.setItem("rc_user", JSON.stringify(initialUser));
    localStorage.setItem("rc_token", "TOKEN_ANTERIOR");
    localStorage.setItem("rc_admin_id", "1");

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    // Confirmamos que parte con el usuario cargado en UI
    expect(screen.getByTestId("user-email").textContent).toBe(
      "admin@crochetito.cl"
    );

    const btnLogout = screen.getByRole("button", { name: /hacer logout/i });
    fireEvent.click(btnLogout);

    // Esperamos a que el effect que sincroniza localStorage se ejecute
    await waitFor(() => {
      expect(screen.getByTestId("user-email").textContent).toBe("");
      expect(localStorage.getItem("rc_user")).toBeNull();
      expect(localStorage.getItem("rc_token")).toBeNull();
      expect(localStorage.getItem("rc_admin_id")).toBeNull();
    });
  });

  it("si el backend responde 401 en login, lanza error y no guarda nada en localStorage", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      json: async () => ({ message: "Bad credentials" }),
    });

    render(
      <AuthProvider>
        <ExposeAuth />
      </AuthProvider>
    );

    // Nos aseguramos de tener la ref al contexto
    expect(authRef).not.toBeNull();

    // login debería rechazar con el mensaje de credenciales inválidas
    await expect(
      authRef.login("wrong@crochetito.cl", "badpass")
    ).rejects.toThrow("Credenciales inválidas");

    // No debe haberse guardado nada
    expect(localStorage.getItem("rc_token")).toBeNull();
    expect(localStorage.getItem("rc_user")).toBeNull();
    expect(localStorage.getItem("rc_admin_id")).toBeNull();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("si el token está expirado al montar, limpia la sesión y deja user en null", async () => {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const expiredToken = createFakeJwtWithExp(nowSeconds - 60); // expiró hace 1 minuto

    // Simulamos un usuario 'guardado' pero con token vencido
    localStorage.setItem(
      "rc_user",
      JSON.stringify({
        id: 1,
        email: "expired@crochetito.cl",
        rol: "SUPERADMIN",
      })
    );
    localStorage.setItem("rc_token", expiredToken);
    localStorage.setItem("rc_admin_id", "1");

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    // El efecto de verificación de expiración debe limpiar todo
    await waitFor(() => {
      expect(screen.getByTestId("user-email").textContent).toBe("");
      expect(localStorage.getItem("rc_token")).toBeNull();
      expect(localStorage.getItem("rc_user")).toBeNull();
      expect(localStorage.getItem("rc_admin_id")).toBeNull();
    });
  });
});
