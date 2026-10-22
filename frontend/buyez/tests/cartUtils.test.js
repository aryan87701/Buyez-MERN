import test from "node:test";
import assert from "node:assert";
import {
  calculateSubtotal,
  calculateShippingFee,
  calculateCartTotals,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_FEE,
} from "../src/utils/cartUtils.js";

test.describe("Cart Utilities Test Suite", () => {
  test("1. calculateSubtotal returns 0 for an empty cart", () => {
    assert.strictEqual(calculateSubtotal([]), 0);
  });

  test("2. calculateSubtotal accurately sums item price multiplied by quantity", () => {
    const items = [
      { _id: "1", price: 250, qty: 2 },
      { _id: "2", price: 100, qty: 3 },
    ];
    // 250*2 + 100*3 = 500 + 300 = 800
    assert.strictEqual(calculateSubtotal(items), 800);
  });

  test("3. calculateShippingFee applies standard shipping for subtotals below threshold", () => {
    assert.strictEqual(calculateShippingFee(500), STANDARD_SHIPPING_FEE);
  });

  test("4. calculateShippingFee grants free shipping at or above ₹999 threshold", () => {
    assert.strictEqual(calculateShippingFee(FREE_SHIPPING_THRESHOLD), 0);
    assert.strictEqual(calculateShippingFee(1500), 0);
  });

  test("5. calculateShippingFee returns 0 for empty cart (0 subtotal)", () => {
    assert.strictEqual(calculateShippingFee(0), 0);
  });

  test("6. calculateCartTotals computes full breakdown including remaining threshold", () => {
    const items = [{ _id: "1", price: 400, qty: 2 }]; // 800 subtotal
    const totals = calculateCartTotals(items);

    assert.strictEqual(totals.subtotal, 800);
    assert.strictEqual(totals.shippingFee, 99);
    assert.strictEqual(totals.totalAmount, 899);
    assert.strictEqual(totals.freeShippingRemaining, 199);
    assert.strictEqual(totals.hasFreeShipping, false);
  });

  test("7. addItemToCart appends a new product with specified quantity", () => {
    const initial = [];
    const product = { _id: "p1", pname: "Shirt", price: 500, stock: 10 };
    const updated = addItemToCart(initial, product, 2);

    assert.strictEqual(updated.length, 1);
    assert.strictEqual(updated[0]._id, "p1");
    assert.strictEqual(updated[0].qty, 2);
  });

  test("8. addItemToCart increments quantity for an existing product", () => {
    const initial = [{ _id: "p1", pname: "Shirt", price: 500, qty: 2, stock: 10 }];
    const product = { _id: "p1", stock: 10 };
    const updated = addItemToCart(initial, product, 3);

    assert.strictEqual(updated.length, 1);
    assert.strictEqual(updated[0].qty, 5);
  });

  test("9. addItemToCart enforces stock cap and prevents overselling", () => {
    const initial = [{ _id: "p1", pname: "Rare Sneaker", price: 2000, qty: 4, stock: 5 }];
    const product = { _id: "p1", stock: 5 };
    const updated = addItemToCart(initial, product, 3);

    assert.strictEqual(updated[0].qty, 5); // Capped at stock: 5
  });

  test("10. updateItemQuantity modifies item count and removes item if quantity <= 0", () => {
    const initial = [
      { _id: "p1", qty: 2, stock: 10 },
      { _id: "p2", qty: 1, stock: 10 },
    ];

    const updated = updateItemQuantity(initial, "p1", 5, 10);
    assert.strictEqual(updated.find((i) => i._id === "p1").qty, 5);

    const zeroed = updateItemQuantity(initial, "p1", 0, 10);
    assert.strictEqual(zeroed.length, 1);
    assert.strictEqual(zeroed[0]._id, "p2");
  });

  test("11. removeItemFromCart removes targeted product by ID", () => {
    const initial = [
      { _id: "p1", qty: 1 },
      { _id: "p2", qty: 2 },
    ];
    const updated = removeItemFromCart(initial, "p1");

    assert.strictEqual(updated.length, 1);
    assert.strictEqual(updated[0]._id, "p2");
  });
});
