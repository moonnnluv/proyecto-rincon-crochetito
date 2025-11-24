import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./authContext";

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

describe("AuthContext + JWT", () => {
  beforeEach(() => {
    // limpiamos mocks y storage antes de cada test
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("guarda el token en localStorage y actualiza el usuario cuando el login es exitoso", async () => {
    // Respuesta fake del backend
    const fakeResponse = {
      token: "FAKE_JWT_TOKEN",
      id: 1,
      nombre: "Admin Crochetito",
      email: "admin@crochetito.cl",
      rol: "SUPERADMIN",
      estado: "ACTIVO",
    };

    // Mock de fetch para el endpoint /auth/login
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

    // Esperamos a que se resuelva la promesa y se actualice el contexto
    await waitFor(() => {
      expect(localStorage.getItem("rc_token")).toBe("FAKE_JWT_TOKEN");
    });

    // El usuario también debe guardarse en localStorage
    const storedUser = JSON.parse(localStorage.getItem("rc_user"));
    expect(storedUser).toMatchObject({
      email: "admin@crochetito.cl",
      rol: "SUPERADMIN",
    });

    // En la interfaz, el email del usuario debería mostrarse
    expect(screen.getByTestId("user-email").textContent).toBe(
      "admin@crochetito.cl"
    );

    // Y fetch debe haber sido llamado una vez
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("al hacer logout limpia el usuario y el token del localStorage", async () => {
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

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    // Confirmamos que parte con el usuario cargado
    expect(screen.getByTestId("user-email").textContent).toBe(
      "admin@crochetito.cl"
    );

    const btnLogout = screen.getByRole("button", { name: /hacer logout/i });
    fireEvent.click(btnLogout);

    // Después del logout no debe haber usuario ni token
    expect(screen.getByTestId("user-email").textContent).toBe("");
    expect(localStorage.getItem("rc_user")).toBeNull();
    expect(localStorage.getItem("rc_token")).toBeNull();
  });
});
