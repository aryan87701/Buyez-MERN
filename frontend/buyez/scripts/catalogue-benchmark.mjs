import { performance } from "node:perf_hooks";
import { filterAndSortProducts, extractUniqueCategories } from "../src/utils/productUtils.js";

console.log("=== Buyez Catalogue Microbenchmark (Synthetic 100,000 Items) ===");
console.log("Generating 100,000 synthetic products...");

const categories = ["Smartphones", "Audio", "Footwear", "Accessories", "Electronics", "Home"];
const products = Array.from({ length: 100000 }, (_, i) => ({
  _id: `prod_${i}`,
  pname: `Item #${i} ${categories[i % categories.length]} Edition`,
  pdesc: `High quality crafted item with premium finish #${i}`,
  category: categories[i % categories.length],
  price: 500 + (i % 5000) * 10,
  createdAt: new Date(Date.now() - (i % 365) * 86400000).toISOString(),
}));

console.log(`Catalogue generated: ${products.length} products.`);

const runs = 10;
const runtimes = [];

for (let r = 0; r < runs; r++) {
  const start = performance.now();

  // Test extraction
  const cats = extractUniqueCategories(products);

  // Test category filter + search + sort
  const filtered = filterAndSortProducts(products, {
    category: "Audio",
    search: "Edition",
    sortBy: "price-low",
  });

  const duration = performance.now() - start;
  runtimes.push(duration);
}

runtimes.sort((a, b) => a - b);
const median = runtimes[Math.floor(runs / 2)];
const min = runtimes[0];
const max = runtimes[runs - 1];

console.log("\nResults over 10 consecutive iterations:");
console.log(`- Minimum: ${min.toFixed(3)} ms`);
console.log(`- Median : ${median.toFixed(3)} ms`);
console.log(`- Maximum: ${max.toFixed(3)} ms`);
console.log("\nNote: This is an in-memory synthetic microbenchmark for utility performance,");
console.log("not a substitute for real-world end-to-end network latency or browser DOM rendering.");
