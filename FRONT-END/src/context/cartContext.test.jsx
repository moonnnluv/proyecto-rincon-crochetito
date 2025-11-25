import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CartProvider, useCart } from "./cartContext.jsx";

// Componente de prueba que usa el carrito
function TestCartComponent() {
  const { count, total, add, clear } = useCart();

  return (
    <div>
      <span data-testid="cart-count">{count}</span>
      <span data-testid="cart-total">{total}</span>

      <button
        onClick={() =>
          add({ id: 1, nombre: "Monitor", precio: 99990, stock: 10 })
        }
      >
        agregar monitor
      </button>

      <button onClick={clear}>vaciar carrito</button>
    </div>
  );
}

describe("CartContext", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("actualiza cantidad y total al agregar un producto", async () => {
    render(
      <CartProvider>
        <TestCartComponent />
      </CartProvider>
    );

    const countSpan = screen.getByTestId("cart-count");
    const totalSpan = screen.getByTestId("cart-total");
    const btnAdd = screen.getByRole("button", { name: /agregar monitor/i });

    // Estado inicial
    expect(countSpan.textContent).toBe("0");
    expect(totalSpan.textContent).toBe("0");

    // Agregamos 1 vez el producto
    fireEvent.click(btnAdd);

    await waitFor(() => {
      expect(countSpan.textContent).toBe("1");
      expect(Number(totalSpan.textContent)).toBe(99990);
    });

    // Agregamos otra vez (deberían ser 2 unidades)
    fireEvent.click(btnAdd);

    await waitFor(() => {
      expect(countSpan.textContent).toBe("2");
      expect(Number(totalSpan.textContent)).toBe(99990 * 2);
    });

    // También se guarda en localStorage
    const stored = JSON.parse(localStorage.getItem("rc_cart"));
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({ id: 1, qty: 2 });
  });
});
