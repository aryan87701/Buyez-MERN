# Buyez Task 5 — Debugging & Defect Resolution Log

## Overview
This log documents genuine defects identified during the Task 5 code audit and testing phase across the Buyez full-stack e-commerce application. Each entry records the defect symptom, root cause analysis, targeted fix implemented, and verification mechanism.

---

### Defect 1: Client-Side Price Reliance & Total Tampering Risk
* **Severity:** High (Financial Integrity & Security)
* **Location:** `backend/controllers/orderController.js`
* **Symptom:** The order creation endpoint previously accepted client-computed `price` and `totalAmount` directly from `req.body.items`, allowing malicious users to modify item prices or inject arbitrary order totals.
* **Root Cause:** Absence of server-side authoritative pricing lookup and recalculation before persisting order records.
* **Fix Implemented:** Modified `createOrder` to query authoritative product prices directly from MongoDB for each item, calculate item subtotals, enforce the ₹999 free-shipping threshold (or apply ₹99 standard shipping), and compute the true final order amount on the server.
* **Verification:** Verified via `backend/tests/api.test.js` (Test #20).

---

### Defect 2: Race Condition in Stock Decrement & Insufficient Inventory Overselling
* **Severity:** High (Inventory Consistency)
* **Location:** `backend/controllers/orderController.js`
* **Symptom:** Order creation checked `prod.stock < item.qty` in a preliminary loop, then ran a separate `$inc: { stock: -item.qty }` update. Concurrent checkout requests could read stale stock and cause negative inventory balances.
* **Root Cause:** Non-atomic read-then-write pattern without conditional database-level guards.
* **Fix Implemented:** Replaced decoupled read-and-update with conditional atomic decrement:
  ```javascript
  const updated = await Product.findOneAndUpdate(
    { _id: item.productId, stock: { $gte: item.qty } },
    { $inc: { stock: -item.qty } },
    { new: true }
  );
  ```
* **Verification:** Verified via `backend/tests/api.test.js` (Test #19, #20).

---

### Defect 3: Missing Inventory Rollback on Partial Multi-Item Checkout Failure
* **Severity:** High (Data Consistency)
* **Location:** `backend/controllers/orderController.js`
* **Symptom:** In an order with multiple distinct items, if item #1 decremented successfully but item #2 failed (or database connection dropped before order save), item #1's stock remained decremented forever without an order existing.
* **Root Cause:** Lack of transaction/compensating rollback logic for multi-item mutations.
* **Fix Implemented:** Implemented a compensating rollback loop inside the `catch` block that iterates through all successfully decremented items and increments their stock back by the exact ordered quantities.
* **Verification:** Verified via `backend/tests/api.test.js` rollback assertions.

---

### Defect 4: Unrestricted Order Status Transitions
* **Severity:** Medium (Fulfillment Workflow)
* **Location:** `backend/controllers/orderController.js`
* **Symptom:** `updateOrderStatus` accepted any arbitrary string supplied in `req.body.status`, bypassing the Mongoose schema enum and corrupting order statuses.
* **Root Cause:** Missing runtime validation of incoming status strings prior to updating the order record.
* **Fix Implemented:** Added an authoritative whitelist check:
  ```javascript
  const ALLOWED_STATUSES = ['pending', 'shipped', 'delivered'];
  if (!status || !ALLOWED_STATUSES.includes(status.toLowerCase())) {
    return res.status(400).json({ message: "Invalid order status" });
  }
  ```
* **Verification:** Verified via `backend/tests/api.test.js` (Test #22).

---

### Defect 5: Unsafe Bearer Token Parsing & Deleted User Handling
* **Severity:** Medium (Authentication Security)
* **Location:** `backend/middlewares/authMiddleware.js`
* **Symptom:** `req.headers.authorization.split(' ')[1]` threw unhandled errors or permitted empty tokens if the header was malformed. Furthermore, if a user account was deleted from MongoDB, an existing valid JWT still allowed requests to proceed.
* **Root Cause:** Absence of token structure guards and missing existence validation for `req.user`.
* **Fix Implemented:** Added length/empty checks on token extraction and explicit `if (!user) return res.status(401)` checks.
* **Verification:** Verified via `backend/tests/api.test.js` (Test #4, #5, #17).

---

### Defect 6: Weak OTP Format Validation
* **Severity:** Medium (Verification Integrity)
* **Location:** `backend/controllers/authControllers.js`
* **Symptom:** Non-string or partial inputs were passed to loose equality `otp != user.otp`, allowing unexpected type coercion.
* **Root Cause:** Lack of type checking and regex validation for 6-digit numeric OTPs.
* **Fix Implemented:** Added strict validation:
  ```javascript
  if (!otp || typeof otp !== "string" || !/^\d{6}$/.test(otp.trim())) {
    return res.status(400).json({ message: "OTP must be a 6-digit numeric string" });
  }
  ```
* **Verification:** Verified via `backend/tests/api.test.js` (Test #14, #15, #16).

---

### Defect 7: Redundant Full-Catalogue Fetch on Customer Order History Page
* **Severity:** Low (Performance & Bandwidth)
* **Location:** `frontend/buyez/src/pages/Orders.jsx`
* **Symptom:** The order history view triggered a secondary network call `GET /api/products` fetching the entire product catalogue just to map product names, even when only a few items had been ordered.
* **Root Cause:** Legacy workaround before backend order controller was updated to populate `items.productId` fields.
* **Fix Implemented:** Removed the redundant second fetch completely and relied directly on populated `item.productId.pname` and `price` returned by `GET /api/orders/myOrders`.
* **Verification:** Tested visually on `/orders` with zero redundant network requests.

---

### Defect 8: Unstable Callback Reference in Admin Dashboard
* **Severity:** Low (React Re-renders)
* **Location:** `frontend/buyez/src/pages/AdminDashboard.jsx`
* **Symptom:** `fetchData` was redefined on every render, causing React Hook lint warnings and potential re-render loops in dependent effects.
* **Root Cause:** Missing `useCallback` wrapper with proper dependency declarations.
* **Fix Implemented:** Wrapped `fetchData` in `useCallback(async () => { ... }, [token])` and included it in the `useEffect` dependency array.
* **Verification:** Verified with zero React hooks warnings during build and lint.
