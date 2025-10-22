// src/context/cartContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null); // si no hay provider, será null

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("rc_cart") || "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("rc_cart", JSON.stringify(items));
  }, [items]);

  const add = (p, qty = 1) => {
    setItems(prev => {
      const i = prev.findIndex(x => x.id === p.id);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: copy[i].qty + qty };
        return copy;
      }
      return [...prev, { ...p, qty }];
    });
  };
  const remove = (id) => setItems(prev => prev.filter(x => x.id !== id));
  const clear = () => setItems([]);

  const total = useMemo(
    () => items.reduce((acc, it) => acc + (Number(it.precio||0) * Number(it.qty||0)), 0),
    [items]
  );

  const value = useMemo(() => ({ items, add, remove, clear, total }), [items, total]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    // mensaje claro para detectar si falta el provider
    throw new Error("useCart debe usarse dentro de <CartProvider>");
  }
  return ctx;
}
