# Buyez Task 5 — Manual Validation Checklist

## Purpose
While 42 automated tests provide comprehensive coverage of API contracts and pure utility calculations, the following manual verification checklist confirms end-to-end functionality against a running MongoDB instance and live browser environment.

---

### Step 1: Services Initialization
- [ ] **MongoDB:** Verify MongoDB service is running locally (`mongod` on port 27017).
- [ ] **Backend Service:** Start Express server:
  ```bash
  cd backend
  npm run dev
  ```
  Verify output: `Server is running on port 3000` / `MongoDB Connected`.
- [ ] **Frontend Client:** In a separate terminal, start Vite dev server:
  ```bash
  cd frontend/buyez
  npm run dev
  ```
  Verify client launches at `http://localhost:5173`.

---

### Step 2: Authentication & Registration Workflow
- [ ] Navigate to `http://localhost:5173/login`.
- [ ] Click the **Register** tab. Enter a test name, unique email, and password.
- [ ] Submit form: Verify registration succeeds and transitions in-place to **Step 2 (Verify Your Email)**.
- [ ] Verify that an email was sent via Nodemailer (or check server logs for OTP).
- [ ] Enter wrong 6-digit OTP: Verify clear error prompt ("Wrong OTP, retry!").
- [ ] Enter valid 6-digit OTP: Verify account is marked verified and redirected to store.

---

### Step 3: Real-Time Live Search (Any Page)
- [ ] In the top navigation bar search input, type `"Sony"` or `"iPhone"`.
- [ ] Verify an instant live dropdown menu pops up immediately with matching product thumbnail, title, category, and price in ₹.
- [ ] Click a product: Verify immediate navigation to `/products/:id`.
- [ ] Press `Esc` or click outside: Verify dropdown closes automatically.
- [ ] Click the `(X)` icon: Verify search query is cleared instantly.

---

### Step 4: Cart & Free-Shipping Threshold
- [ ] Open a product with price < ₹999 (e.g. ₹500 item). Add to cart.
- [ ] Navigate to `/cart`.
- [ ] Verify subtotal shows ₹500, shipping fee shows ₹99, grand total is ₹599.
- [ ] Verify progress bar indicates amount needed for free delivery (`₹499 to go`).
- [ ] Increase quantity to 2 (total ₹1,000 >= ₹999).
- [ ] Verify shipping fee updates to `FREE` (₹0) and grand total reflects ₹1,000.
- [ ] Attempt to increase quantity past product's available stock: Verify quantity is capped at maximum stock.

---

### Step 5: Checkout & Order Placement
- [ ] From `/cart`, proceed to `/checkout`.
- [ ] Verify customer name autofills from authenticated session.
- [ ] Enter delivery address: Street, City, Postal Code, Country.
- [ ] Verify Payment method is set to Cash on Delivery (COD).
- [ ] Click **"Place Order"**: Verify order confirmation view displays order ID and breakdown.
- [ ] Navigate to `/orders`: Verify newly placed order appears at top of order history with `Processing` (pending) status badge.
- [ ] Verify stock in MongoDB has been decremented by the exact ordered quantity.

---

### Step 6: Admin Dashboard (Role-Based Access)
- [ ] Log in with an administrator account (`role: "admin"`).
- [ ] Click **Admin Portal** (`/admin`).
- [ ] Verify KPIs load: Total Revenue, Total Orders, Product Count, User Count.
- [ ] In Orders table, update the test order's status from `pending` to `shipped` and then `delivered`.
- [ ] Log out, then try navigating directly to `/admin`: Verify route guard redirects unauthorized customer to `/login`.
