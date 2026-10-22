export const FREE_SHIPPING_THRESHOLD = 999;
export const STANDARD_SHIPPING_FEE = 99;

/**
 * Calculates the subtotal of all items in the cart.
 */
export const calculateSubtotal = (items = []) => {
  return items.reduce((acc, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 0;
    return acc + price * qty;
  }, 0);
};

/**
 * Calculates the shipping fee based on subtotal.
 */
export const calculateShippingFee = (subtotal = 0) => {
  if (subtotal <= 0 || subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }
  return STANDARD_SHIPPING_FEE;
};

/**
 * Computes full cart totals summary.
 */
export const calculateCartTotals = (items = []) => {
  const subtotal = calculateSubtotal(items);
  const shippingFee = calculateShippingFee(subtotal);
  const totalAmount = subtotal + shippingFee;
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  return {
    subtotal,
    shippingFee,
    totalAmount,
    freeShippingRemaining,
    hasFreeShipping,
  };
};

/**
 * Adds an item to the cart, capping at available stock.
 */
export const addItemToCart = (cartItems = [], productToAdd, quantity = 1) => {
  if (!productToAdd || !productToAdd._id) return cartItems;

  const qtyToAdd = Math.max(1, Math.floor(Number(quantity) || 1));
  const maxStock = typeof productToAdd.stock === "number" ? productToAdd.stock : Infinity;
  const existingIndex = cartItems.findIndex((item) => item._id === productToAdd._id);

  if (existingIndex > -1) {
    const currentQty = cartItems[existingIndex].qty || 0;
    const newQty = Math.min(currentQty + qtyToAdd, maxStock);

    return cartItems.map((item, idx) =>
      idx === existingIndex ? { ...item, qty: newQty } : item
    );
  }

  const initialQty = Math.min(qtyToAdd, maxStock);
  return [...cartItems, { ...productToAdd, qty: initialQty }];
};

/**
 * Updates item quantity, removing if <= 0 and capping at max stock.
 */
export const updateItemQuantity = (cartItems = [], productId, quantity, maxStock = Infinity) => {
  const targetQty = Math.floor(Number(quantity));

  if (targetQty <= 0) {
    return cartItems.filter((item) => item._id !== productId);
  }

  const effectiveMax = typeof maxStock === "number" ? maxStock : Infinity;
  const safeQty = Math.min(targetQty, effectiveMax);

  return cartItems.map((item) =>
    item._id === productId ? { ...item, qty: safeQty } : item
  );
};

/**
 * Removes an item from the cart.
 */
export const removeItemFromCart = (cartItems = [], productId) => {
  return cartItems.filter((item) => item._id !== productId);
};
