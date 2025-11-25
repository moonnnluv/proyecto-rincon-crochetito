import { createContext, useContext, useEffect, useMemo, useState } from "react";

const defaultCart = {
  items: [],
  add: () => {},
  remove: () => {},
  clear: () => {},
  updateQty: () => {},   // 👈 nuevo
  count: 0,
  total: 0,
};
const CartCtx = createContext(defaultCart);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("rc_cart")) || []; }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("rc_cart", JSON.stringify(items));
  }, [items]);

  function add(prod, qty = 1) {
    const delta = qty || 1;

    setItems(prev => {
      const i = prev.findIndex(x => x.id === prod.id);
      if (i >= 0) {
        const cp = [...prev];
        const current = cp[i];
        const maxStock = prod.stock ?? current.stock ?? Infinity;
        const newQty = Math.min((current.qty || 1) + delta, maxStock);
        cp[i] = { ...current, ...prod, qty: newQty, stock: maxStock };
        return cp;
      }
      const maxStock = prod.stock ?? Infinity;
      const initialQty = Math.min(delta, maxStock);
      return [...prev, { ...prod, qty: initialQty, stock: maxStock }];
    });
  }

  function updateQty(id, qty) {
    setItems(prev =>
      prev.flatMap((it) => {
        if (it.id !== id) return [it];
        const max = it.stock ?? Infinity;
        const newQty = Math.max(0, Math.min(qty, max));
        if (newQty === 0) return []; // lo elimina
        return [{ ...it, qty: newQty }];
      })
    );
  }

  function remove(id) { setItems(prev => prev.filter(x => x.id !== id)); }
  function clear() { setItems([]); }

  const count = items.reduce((a, it) => a + (it.qty || 1), 0);
  const total = items.reduce((a, it) => a + (it.qty || 1) * Number(it.precio || 0), 0);

  const value = useMemo(
    () => ({ items, add, remove, clear, updateQty, count, total }),
    [items, count, total]
  );

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() { return useContext(CartCtx); }
