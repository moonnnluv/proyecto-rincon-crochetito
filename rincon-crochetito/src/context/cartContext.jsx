import { createContext, useContext, useEffect, useMemo, useState } from "react";

const defaultCart = {
  items: [],
  add: () => {},
  remove: () => {},
  clear: () => {},
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
    setItems(prev => {
      const i = prev.findIndex(x => x.id === prod.id);
      if (i >= 0) {
        const cp = [...prev];
        cp[i] = { ...cp[i], qty: (cp[i].qty || 1) + qty };
        return cp;
      }
      return [...prev, { ...prod, qty }];
    });
  }
  function remove(id) { setItems(prev => prev.filter(x => x.id !== id)); }
  function clear() { setItems([]); }

  const count = items.reduce((a, it) => a + (it.qty || 1), 0);
  const total = items.reduce((a, it) => a + (it.qty || 1) * Number(it.precio || 0), 0);

  const value = useMemo(() => ({ items, add, remove, clear, count, total }), [items, count, total]);
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() { return useContext(CartCtx); }
