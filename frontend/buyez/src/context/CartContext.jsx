import { createContext, useState, useEffect } from "react";

export const CartContext = createContext({
  cart: [],
  cartCount: 0,
  cartTotal: 0,
  freeShippingThreshold: 999,
  shippingFee: 0,
  grandTotal: 0,
  addToCart: () => {},
  updateQty: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
});

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("buyez_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("buyez_cart", JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  const addToCart = (product, qty = 1) => {
    if (!product || !product._id) return;
    // Strict stock guard: cannot add items with 0 stock
    if (product.stock !== undefined && Number(product.stock) <= 0) return;

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product._id === product._id
      );

      const maxStock =
        product.stock !== undefined && product.stock !== null
          ? Number(product.stock)
          : 99;

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].qty + qty;
        updated[existingIndex].qty = Math.min(newQty, maxStock);
        return updated;
      } else {
        return [...prev, { product, qty: Math.min(qty, maxStock) }];
      }
    });
  };

  const updateQty = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product._id === productId) {
          const maxStock =
            item.product.stock !== undefined && item.product.stock !== null
              ? Number(item.product.stock)
              : 99;
          return { ...item, qty: Math.min(newQty, maxStock) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product._id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((acc, item) => acc + (item.qty || 0), 0);

  const cartTotal = cart.reduce(
    (acc, item) => acc + (item.product?.price || 0) * (item.qty || 0),
    0
  );

  const freeShippingThreshold = 999;
  const shippingFee = cartTotal >= freeShippingThreshold || cartTotal === 0 ? 0 : 99;
  const grandTotal = cartTotal + shippingFee;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
        freeShippingThreshold,
        shippingFee,
        grandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
