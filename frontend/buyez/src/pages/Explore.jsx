import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { Search, ArrowUpDown, X, PackageX, AlertCircle } from "lucide-react";
import { extractUniqueCategories, filterAndSortProducts } from "../utils/productUtils";

export const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const selectedCategory = searchParams.get("category") || "All";
  const searchKeyword = searchParams.get("search") || "";
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setProducts(Array.isArray(data) ? data : []);
          }
        } else {
          if (isMounted) {
            setError(`Failed to load product catalogue (status: ${res.status})`);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError("Network or server connection error loading catalogue.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  // Dynamically extract categories directly from products existing in MongoDB
  const dynamicCategories = useMemo(
    () => extractUniqueCategories(products),
    [products]
  );

  // Memoized filtering and sorting strictly using pure utility functions
  const filteredProducts = useMemo(
    () =>
      filterAndSortProducts(products, {
        category: selectedCategory,
        search: searchKeyword,
        sortBy,
      }),
    [products, selectedCategory, searchKeyword, sortBy]
  );

  const handleSearchChange = (value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value.trim()) {
      newParams.set("search", value.trim());
    } else {
      newParams.delete("search");
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleCategoryClick = (cat) => {
    const newParams = new URLSearchParams(searchParams);
    if (cat === "All") {
      newParams.delete("category");
    } else {
      newParams.set("category", cat);
    }
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSortBy("featured");
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-[#fcfbfa] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#f5ede3] via-[#f7f2ea] to-[#eee4d6] rounded-2xl p-6 sm:p-10 border border-[#e8dfd2]">
          <span className="text-xs font-bold tracking-widest uppercase text-neutral-600">
            STORE CATALOGUE
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 font-serif mt-1">
            Shop Products
          </h1>
          <p className="text-sm text-neutral-600 max-w-lg mt-2">
            Explore products published directly in your store database.
          </p>
        </div>

        {/* Error Alert if catalogue failed to load */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-3">
            <AlertCircle size={18} className="flex-shrink-0" />
            <div className="flex-1">
              <span className="font-semibold">{error}</span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-xs bg-rose-600 text-white px-3 py-1.5 rounded-lg hover:bg-rose-700 font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          
          {/* Dynamic Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            {dynamicCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? "bg-[#153228] text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-60">
              <Search
                size={16}
                className="absolute left-3 top-2.5 text-neutral-400"
              />
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchKeyword}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-neutral-100 text-xs rounded-lg border border-neutral-200 focus:outline-none focus:border-[#153228]"
              />
              {searchKeyword && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="absolute right-2.5 top-2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-700">
              <ArrowUpDown size={14} className="text-neutral-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-neutral-100 py-1.5 px-2.5 rounded-lg border border-neutral-200 text-xs focus:outline-none"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest (Date)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

        </div>

        {/* Counter */}
        <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
          <p>
            Showing{" "}
            <span className="font-bold text-neutral-900">
              {filteredProducts.length}
            </span>{" "}
            products from database
          </p>
          {(selectedCategory !== "All" || searchKeyword) && (
            <button
              onClick={handleClearFilters}
              className="text-[#153228] font-semibold hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-72 bg-neutral-100 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200 p-8 space-y-3">
            <PackageX size={36} className="mx-auto text-neutral-400" />
            <p className="text-base font-semibold text-neutral-800">
              No products found
            </p>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              No products match this query in the database.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-2 px-4 py-2 bg-[#153228] text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Explore;
