# Buyez Task 5 — Performance Measurements & Optimization Notes

## 1. Overview
As part of Task 5 (Testing, Debugging, and Optimization), performance profiling and measurements were conducted across the frontend client and backend service.

---

## 2. Frontend Optimizations

### A. Synthetic Catalogue Filtering & Sorting Microbenchmark
* **Objective:** Evaluate execution speed of search and filtering algorithms when handling large in-memory collections (100,000 items).
* **Script:** `frontend/buyez/scripts/catalogue-benchmark.mjs`
* **Test Dataset:** 100,000 synthetic e-commerce product records across 6 categories.
* **Operations Tested per Iteration:**
  1. Unique category extraction from full dataset.
  2. Multi-field substring search across product title, description, and category.
  3. Price-based ascending sort.
* **Measured Timings (10 Consecutive Iterations on Node.js v22):**
  - Minimum Runtime: `9.95 ms`
  - Median Runtime: `10.31 ms`
  - Maximum Runtime: `11.82 ms`
* **Context & Limitations:** This is an in-memory utility microbenchmark measuring V8 array execution. It demonstrates that the pure helper functions in `productUtils.js` execute in ~10ms for 100,000 records. Real-world browser response times will additionally depend on DOM virtualization and network roundtrips.

---

### B. Network Request Reduction in Orders View
* **Baseline Behavior:** Visiting `/orders` triggered 2 concurrent HTTP requests:
  1. `GET /api/orders/myOrders` (Order payloads)
  2. `GET /api/products` (Full catalogue payload, ~6KB to several MB as catalog scales)
* **Optimized Behavior:** By ensuring `backend/controllers/orderController.js` populates `items.productId: 'pname price images'`, the second request was eliminated entirely.
* **Outcome:** 50% reduction in HTTP network requests on the Orders page; eliminates redundant client-side array mapping.

---

### C. Memoization of Catalogue State & Live Search
* **`Explore.jsx`:** Applied `useMemo` for category extraction (`dynamicCategories`) and product filtering/sorting (`filteredProducts`). Prevents expensive array traversals on unrelated component re-renders.
* **`Navbar.jsx`:** Applied `useMemo` for search results matching, preventing duplicate state writes and keeping dropdown results aligned with the active query.

---

### D. Production Bundle Size & Build Times
* **Tooling:** Vite v8.2 + Rolldown bundler + React 19 + Tailwind CSS v4.
* **Production Build Metrics:**
  - `dist/index.html`: ~0.82 kB (gzip: ~0.46 kB)
  - `dist/assets/index.css`: ~51.2 kB (gzip: ~8.98 kB)
  - `dist/assets/index.js`: ~364.3 kB (gzip: ~100.7 kB)
* **Compilation Speed:** Production bundle compiles cleanly in **under 450 ms**.
* **Zero ESLint Warnings:** Clean static analysis verification across all JSX components.

---

## 3. Backend Optimizations

### A. Authoritative Single-Query Stock Decrements
* Instead of sequentially querying and saving individual documents, `Product.findOneAndUpdate` utilizes conditional atomic filters (`{ _id, stock: { $gte: qty } }`) with `$inc: { stock: -qty }`, reducing database round trips and eliminating race conditions.

### B. Ephemeral Test Harness Architecture
* By decoupling Express application initialization (`app.js`) from server listening (`index.js`), automated test suites run against ephemeral in-memory ports without needing live MongoDB connections or external test harnesses.
