const test = require("node:test");
const assert = require("node:assert");
const http = require("node:http");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = require("../app.js");
const User = require("../model/User.model.js");
const Product = require("../model/Product.model.js");
const Order = require("../model/Order.model.js");
const sendEmail = require("../util/sendMail.js");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_key_12345";

let server;
let baseUrl;

const customerId = "60d0fe4f5311236168a109ca";
const adminId = "60d0fe4f5311236168a109cb";

const customerToken = jwt.sign({ id: customerId }, process.env.JWT_SECRET, { expiresIn: "1h" });
const adminToken = jwt.sign({ id: adminId }, process.env.JWT_SECRET, { expiresIn: "1h" });

const makeRequest = (path, options = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const reqOptions = {
      method: options.method || "GET",
      headers: options.headers || {},
    };

    const req = http.request(url, reqOptions, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        let parsed;
        try {
          parsed = JSON.parse(body);
        } catch {
          parsed = body;
        }
        resolve({ status: res.statusCode, data: parsed, headers: res.headers });
      });
    });

    req.on("error", reject);

    if (options.body) {
      req.write(typeof options.body === "string" ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
};

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test.describe("Buyez Backend API Test Suite", () => {
  // 1. Product APIs
  test("1. GET /api/products returns product array", async () => {
    const origFind = Product.find;
    Product.find = () => Promise.resolve([{ _id: "p1", pname: "Test Shoe", price: 1200, stock: 10 }]);

    const res = await makeRequest("/api/products");
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data));
    assert.strictEqual(res.data[0].pname, "Test Shoe");

    Product.find = origFind;
  });

  test("2. GET /api/products/:id returns specific product", async () => {
    const origFindById = Product.findById;
    Product.findById = (id) => Promise.resolve({ _id: id, pname: "Specific Item", price: 999 });

    const res = await makeRequest("/api/products/p1");
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.pname, "Specific Item");

    Product.findById = origFindById;
  });

  test("3. GET /api/products/:id returns 404 for missing product", async () => {
    const origFindById = Product.findById;
    Product.findById = () => Promise.resolve(null);

    const res = await makeRequest("/api/products/nonexistent");
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.data.message, "Product not found");

    Product.findById = origFindById;
  });

  test("4. POST /api/products rejects unauthenticated user", async () => {
    const res = await makeRequest("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { pname: "Hacked Item", price: 100 },
    });
    assert.strictEqual(res.status, 401);
  });

  test("5. PUT /api/products/:id rejects non-admin customer", async () => {
    const origUserFind = User.findById;
    User.findById = () => ({
      select: () => Promise.resolve({ _id: customerId, role: "customer" }),
    });

    const res = await makeRequest("/api/products/p1", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: { price: 50 },
    });
    assert.strictEqual(res.status, 403);

    User.findById = origUserFind;
  });

  test("6. DELETE /api/products/:id rejects unauthorized access", async () => {
    const res = await makeRequest("/api/products/p1", { method: "DELETE" });
    assert.strictEqual(res.status, 401);
  });

  // 2. Authentication APIs
  test("7. POST /api/auth/register creates user with valid data", async () => {
    const origFindOne = User.findOne;
    const origCreate = User.create;

    User.findOne = () => Promise.resolve(null);
    User.create = (doc) =>
      Promise.resolve({
        _id: "new_u1",
        name: doc.name,
        email: doc.email,
        role: "customer",
        verified: false,
      });

    const res = await makeRequest("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { name: "Alice Test", email: "alice@example.com", password: "Password123!" },
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.email, "alice@example.com");
    assert.ok(res.data.token);

    User.findOne = origFindOne;
    User.create = origCreate;
  });

  test("8. POST /api/auth/register rejects missing fields", async () => {
    const res = await makeRequest("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { email: "alice@example.com" },
    });
    assert.strictEqual(res.status, 400);
    assert.ok(res.data.message.includes("required"));
  });

  test("9. POST /api/auth/register rejects invalid email format", async () => {
    const res = await makeRequest("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { name: "Alice", email: "invalid-email-string", password: "pwd" },
    });
    assert.strictEqual(res.status, 400);
    assert.ok(res.data.message.includes("valid email"));
  });

  test("10. POST /api/auth/register rejects duplicate email", async () => {
    const origFindOne = User.findOne;
    User.findOne = () => Promise.resolve({ _id: "existing_user" });

    const res = await makeRequest("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { name: "Alice", email: "existing@example.com", password: "pwd" },
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.message, "User already exists");

    User.findOne = origFindOne;
  });

  test("11. POST /api/auth/login succeeds with valid credentials", async () => {
    const origFindOne = User.findOne;
    const hash = await bcrypt.hash("Secret123", 10);

    User.findOne = () =>
      Promise.resolve({
        _id: customerId,
        name: "Login User",
        email: "login@example.com",
        password: hash,
        role: "customer",
        verified: true,
      });

    const res = await makeRequest("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { email: "login@example.com", password: "Secret123" },
    });

    assert.strictEqual(res.status, 200);
    assert.ok(res.data.token);
    assert.strictEqual(res.data.verified, true);

    User.findOne = origFindOne;
  });

  test("12. POST /api/auth/login rejects incorrect password", async () => {
    const origFindOne = User.findOne;
    const hash = await bcrypt.hash("RealPassword", 10);

    User.findOne = () =>
      Promise.resolve({
        _id: customerId,
        email: "login@example.com",
        password: hash,
      });

    const res = await makeRequest("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { email: "login@example.com", password: "WrongPassword" },
    });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.message, "Invalid email or password");

    User.findOne = origFindOne;
  });

  test("13. POST /api/auth/login rejects missing credentials", async () => {
    const res = await makeRequest("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { email: "login@example.com" },
    });
    assert.strictEqual(res.status, 400);
  });

  test("14. POST /api/auth/verify-otp succeeds with matching OTP", async () => {
    const origUserFind = User.findById;
    let saved = false;

    User.findById = () => ({
      select: () =>
        Promise.resolve({
          _id: customerId,
          otp: "123456",
          verified: false,
          save: () => {
            saved = true;
            return Promise.resolve();
          },
        }),
    });

    const res = await makeRequest("/api/auth/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: { otp: "123456" },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.message, "User successfully verified");
    assert.strictEqual(saved, true);

    User.findById = origUserFind;
  });

  test("15. POST /api/auth/verify-otp rejects mismatched OTP", async () => {
    const origUserFind = User.findById;

    User.findById = () => ({
      select: () =>
        Promise.resolve({
          _id: customerId,
          otp: "123456",
          verified: false,
        }),
    });

    const res = await makeRequest("/api/auth/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: { otp: "654321" },
    });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.message, "Wrong OTP, retry!");

    User.findById = origUserFind;
  });

  test("16. POST /api/auth/verify-otp rejects malformed OTP", async () => {
    const res = await makeRequest("/api/auth/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: { otp: "abc" },
    });

    assert.strictEqual(res.status, 400);
    assert.ok(res.data.message.includes("6-digit"));
  });

  // 3. Order APIs
  test("17. POST /api/orders rejects unauthenticated requests", async () => {
    const res = await makeRequest("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { items: [{ product: "p1", qty: 1 }] },
    });
    assert.strictEqual(res.status, 401);
  });

  test("18. POST /api/orders rejects invalid items payload", async () => {
    const origUserFind = User.findById;
    User.findById = () => ({
      select: () => Promise.resolve({ _id: customerId, role: "customer" }),
    });

    const res = await makeRequest("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: { items: [] },
    });
    assert.strictEqual(res.status, 400);

    User.findById = origUserFind;
  });

  test("19. POST /api/orders rejects order exceeding available stock", async () => {
    const origUserFind = User.findById;
    const origProdFind = Product.findById;

    User.findById = () => ({
      select: () => Promise.resolve({ _id: customerId, role: "customer" }),
    });
    Product.findById = () => Promise.resolve({ _id: "p1", pname: "Rare Watch", stock: 2, price: 5000 });

    const res = await makeRequest("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: {
        items: [{ product: "p1", qty: 5 }],
        address: { street: "123 Main St", city: "Delhi", postalcode: "110001" },
      },
    });

    assert.strictEqual(res.status, 400);
    assert.ok(res.data.message.includes("Insufficient stock"));

    User.findById = origUserFind;
    Product.findById = origProdFind;
  });

  test("20. POST /api/orders calculates authoritative price and creates order with COD", async () => {
    const origUserFind = User.findById;
    const origProdFind = Product.findById;
    const origProdUpdate = Product.findOneAndUpdate;
    const origOrderCreate = Order.create;

    User.findById = () => ({
      select: () => Promise.resolve({ _id: customerId, name: "Alice", email: "alice@test.com" }),
    });
    // Database price is 500
    Product.findById = () => Promise.resolve({ _id: "p1", pname: "Shirt", stock: 10, price: 500 });
    Product.findOneAndUpdate = () => Promise.resolve({ _id: "p1", stock: 8 });

    let createdOrder = null;
    Order.create = (doc) => {
      createdOrder = doc;
      return Promise.resolve({ _id: "order_123", ...doc });
    };

    const res = await makeRequest("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: {
        items: [{ product: "p1", qty: 2 }], // 2 * 500 = 1000 >= 999 -> Free shipping!
        address: { street: "123 Main St", city: "Delhi", postalcode: "110001" },
      },
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(createdOrder.totalAmount, 1000); // Server calculated
    assert.strictEqual(createdOrder.paymentId, "COD");

    User.findById = origUserFind;
    Product.findById = origProdFind;
    Product.findOneAndUpdate = origProdUpdate;
    Order.create = origOrderCreate;
  });

  test("21. GET /api/orders returns orders for authenticated customer", async () => {
    const origUserFind = User.findById;
    const origOrderFind = Order.find;

    User.findById = () => ({
      select: () => Promise.resolve({ _id: customerId }),
    });
    Order.find = (filter) => {
      assert.strictEqual(String(filter.user), customerId);
      return {
        populate: () => ({
          sort: () => Promise.resolve([{ _id: "ord_1", user: customerId, totalAmount: 1000 }]),
        }),
      };
    };

    const res = await makeRequest("/api/orders", {
      headers: { Authorization: `Bearer ${customerToken}` },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.length, 1);

    User.findById = origUserFind;
    Order.find = origOrderFind;
  });

  test("22. PUT /api/orders/:id/status rejects invalid status enum", async () => {
    const origUserFind = User.findById;
    User.findById = () => ({
      select: () => Promise.resolve({ _id: adminId, role: "admin" }),
    });

    const res = await makeRequest("/api/orders/ord_1/status", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: { status: "flying_in_sky" },
    });

    assert.strictEqual(res.status, 400);
    assert.ok(res.data.message.includes("Invalid order status"));

    User.findById = origUserFind;
  });

  // 4. Analytics & Authorization
  test("23. GET /api/analytics rejects non-admin users with 403", async () => {
    const origUserFind = User.findById;
    User.findById = () => ({
      select: () => Promise.resolve({ _id: customerId, role: "customer" }),
    });

    const res = await makeRequest("/api/analytics", {
      headers: { Authorization: `Bearer ${customerToken}` },
    });

    assert.strictEqual(res.status, 403);

    User.findById = origUserFind;
  });
});
