/**
 * Extracts unique categories from an array of products.
 */
export const extractUniqueCategories = (products = []) => {
  if (!Array.isArray(products)) return ["All"];

  const categories = products
    .map((p) => p.category)
    .filter((cat) => typeof cat === "string" && cat.trim().length > 0);

  return ["All", ...Array.from(new Set(categories))];
};

/**
 * Filters and sorts products based on category, search keyword, and sort criteria.
 */
export const filterAndSortProducts = (
  products = [],
  { category = "All", search = "", sortBy = "featured" } = {}
) => {
  if (!Array.isArray(products)) return [];

  const query = search.trim().toLowerCase();
  const selectedCat = (category || "All").trim().toLowerCase();

  const filtered = products.filter((prod) => {
    if (!prod) return false;

    const name = (prod.pname || prod.name || "").toLowerCase();
    const desc = (prod.pdesc || "").toLowerCase();
    const cat = (prod.category || "").toLowerCase();

    const matchesSearch =
      !query ||
      name.includes(query) ||
      desc.includes(query) ||
      cat.includes(query);

    const matchesCat = selectedCat === "all" || cat === selectedCat;

    return matchesSearch && matchesCat;
  });

  if (sortBy === "price-low") {
    return [...filtered].sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
  }

  if (sortBy === "price-high") {
    return [...filtered].sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
  }

  if (sortBy === "newest") {
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }

  // "featured" or default preserves initial catalogue order
  return filtered;
};

/**
 * Formats a numeric price into Indian Rupees format.
 */
export const formatPriceINR = (amount = 0) => {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
};
