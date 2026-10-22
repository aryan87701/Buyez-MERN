import test from "node:test";
import assert from "node:assert";
import {
  extractUniqueCategories,
  filterAndSortProducts,
} from "../src/utils/productUtils.js";

const sampleProducts = [
  { _id: "1", pname: "Apple iPhone 15", category: "Smartphones", price: 79999, pdesc: "A16 Bionic chip", createdAt: "2026-01-01" },
  { _id: "2", pname: "Sony WH-1000XM5", category: "Audio", price: 29990, pdesc: "Active noise cancellation", createdAt: "2026-02-15" },
  { _id: "3", pname: "Nike Air Max 270", category: "Footwear", price: 13995, pdesc: "Comfortable running shoes", createdAt: "2026-03-10" },
  { _id: "4", pname: "Wireless Ergonomic Mouse", category: "Accessories", price: 1999, pdesc: "Bluetooth 5.0 office mouse", createdAt: "2026-01-20" },
];

test.describe("Product Utilities Test Suite", () => {
  test("1. extractUniqueCategories prepends 'All' and eliminates duplicate or empty values", () => {
    const list = [
      { category: "Audio" },
      { category: "Smartphones" },
      { category: "Audio" },
      { category: "" },
      {},
    ];
    const categories = extractUniqueCategories(list);
    assert.deepStrictEqual(categories, ["All", "Audio", "Smartphones"]);
  });

  test("2. filterAndSortProducts returns full catalog when default filters applied", () => {
    const result = filterAndSortProducts(sampleProducts);
    assert.strictEqual(result.length, 4);
  });

  test("3. filterAndSortProducts filters strictly by category", () => {
    const result = filterAndSortProducts(sampleProducts, { category: "Audio" });
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].pname, "Sony WH-1000XM5");
  });

  test("4. filterAndSortProducts searches case-insensitively by product title", () => {
    const result = filterAndSortProducts(sampleProducts, { search: "iphone" });
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0]._id, "1");
  });

  test("5. filterAndSortProducts searches across description and category attributes", () => {
    const resultDesc = filterAndSortProducts(sampleProducts, { search: "running" });
    assert.strictEqual(resultDesc.length, 1);
    assert.strictEqual(resultDesc[0].pname, "Nike Air Max 270");

    const resultCat = filterAndSortProducts(sampleProducts, { search: "accessories" });
    assert.strictEqual(resultCat.length, 1);
    assert.strictEqual(resultCat[0]._id, "4");
  });

  test("6. filterAndSortProducts sorts by price in ascending order (low to high)", () => {
    const result = filterAndSortProducts(sampleProducts, { sortBy: "price-low" });
    assert.strictEqual(result[0].price, 1999);
    assert.strictEqual(result[result.length - 1].price, 79999);
  });

  test("7. filterAndSortProducts sorts by price in descending order (high to low)", () => {
    const result = filterAndSortProducts(sampleProducts, { sortBy: "price-high" });
    assert.strictEqual(result[0].price, 79999);
    assert.strictEqual(result[result.length - 1].price, 1999);
  });

  test("8. filterAndSortProducts sorts by newest creation date", () => {
    const result = filterAndSortProducts(sampleProducts, { sortBy: "newest" });
    assert.strictEqual(result[0]._id, "3"); // 2026-03-10
  });
});
