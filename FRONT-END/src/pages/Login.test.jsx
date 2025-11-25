// src/pages/Login.test.jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import Login from "./Login";
import { useAuth, routeForRole } from "../context/authContext.jsx";

// Mock del contexto de auth: usamos vi.fn() y luego configuramos en beforeEach/tests
vi.mock("../context/authContext.jsx", () => ({
  useAuth: vi.fn(),
  routeForRole: vi.fn(),
}));

// Mock parcial de react-router-dom: solo useNavigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  window.alert = vi.fn();

  // mocks por defecto para que cualquier render de <Login /> no reviente
  vi.mocked(useAuth).mockReturnValue({ login: vi.fn() });
  vi.mocked(routeForRole).mockReturnValue("/");
  vi.mocked(useNavigate).mockReturnValue(vi.fn());
});

describe("Login.jsx", () => {
  it("renderiza el formulario de login", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: /iniciar sesión/i })
    ).toBeDefined();
    expect(screen.getByLabelText(/email/i)).toBeDefined();
    expect(screen.getByLabelText(/contraseña/i)).toBeDefined();
    expect(
      screen.getByRole("button", { name: /entrar/i })
    ).toBeDefined();
  });

  it("llama a login y navega según el rol al enviar el formulario", async () => {
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    const mockLogin = vi.fn().mockResolvedValue({ rol: "CLIENTE" });
    vi.mocked(useAuth).mockReturnValue({ login: mockLogin });
    vi.mocked(routeForRole).mockReturnValue("/mi-cuenta");

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "cliente@correo.test" },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: "secreto123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("cliente@correo.test", "secreto123");
      expect(routeForRole).toHaveBeenCalledWith("CLIENTE");
      expect(mockNavigate).toHaveBeenCalledWith("/mi-cuenta", { replace: true });
    });
  });

  it("muestra mensaje de error si el login falla", async () => {
    vi.mocked(useNavigate).mockReturnValue(vi.fn());

    const error = new Error("Credenciales inválidas");
    const mockLogin = vi.fn().mockRejectedValue(error);
    vi.mocked(useAuth).mockReturnValue({ login: mockLogin });
    vi.mocked(routeForRole).mockReturnValue("/mi-cuenta");

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "bad@correo.test" },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: "wrong" },
    });

    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    const alertMsg = await screen.findByText(/credenciales inválidas/i);
    expect(alertMsg).toBeDefined();
    expect(window.alert).toHaveBeenCalledWith("Credenciales inválidas");
  });
});
