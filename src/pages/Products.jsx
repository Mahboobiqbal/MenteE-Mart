// filepath: h:\Code\Nainzaka Aesthetics\src\pages\Products.jsx
import React, { useState, useEffect, useMemo } from "react";
import supabase from "../utils/supabase";
import ProductCard from "../components/ProductCard";

const emerald = "#008060";
const yellow = "#FFD700";
const white = "#FFFFFF";
const charcoal = "#333333";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  const categories = useMemo(
    () => [
      { id: "all", name: "All Products", icon: "🛍️" },
      { id: "shawal_men", name: "Shawals — Men's", icon: "🧣" },
      { id: "shawal_women", name: "Shawals — Women's", icon: "🧣" },
      { id: "peshawar_chappals", name: "Peshawar Chappals", icon: "👞" },
      { id: "citrale_caps", name: "Citrale Caps", icon: "🧢" },
    ],
    []
  );

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filtering, sorting
  useEffect(() => {
    let filtered = [...products];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(term) ||
          (p.description || "").toLowerCase().includes(term) ||
          (p.category || "").toLowerCase().includes(term)
      );
    }

    if (selectedCategory !== "all") {
      const selectedCatObj = categories.find((c) => c.id === selectedCategory);
      if (selectedCatObj) {
        const cat = selectedCatObj.name.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            (p.category || "").toLowerCase() === cat ||
            (p.category || "").toLowerCase().includes(cat)
        );
      }
    }

    filtered = filtered.filter((p) => {
      const price = Number(p.price || 0);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (Number(a.price) || 0) - (Number(b.price) || 0);
        case "price-high":
          return (Number(b.price) || 0) - (Number(a.price) || 0);
        case "name":
          return String(a.name || "").localeCompare(String(b.name || ""));
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, priceRange, sortBy]);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, priceRange, sortBy]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex justify-center items-center"
        style={{ background: "#f5f7f6" }}
      >
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div
              className="absolute inset-0 border-4 rounded-full animate-pulse"
              style={{ borderColor: `${emerald}33` }}
            ></div>
            <div
              className="absolute inset-2 border-4 rounded-full animate-spin"
              style={{ borderColor: `${emerald}55`, borderTopColor: emerald }}
            />
          </div>
          <p className="text-lg font-medium" style={{ color: charcoal }}>
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f5f7f6" }}>
      {/* Header */}
      <div
        className="relative overflow-hidden border-b"
        style={{ borderColor: "#e5e7eb" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-10">
          <div className="text-center space-y-3">
            <h1
              className="text-4xl md:text-5xl font-light"
              style={{ color: charcoal }}
            >
              Our{" "}
              <span className="font-semibold" style={{ color: emerald }}>
                Collection
              </span>
            </h1>
            <p
              className="text-base md:text-lg"
              style={{ color: `${charcoal}b3` }}
            >
              Discover premium products curated for your style
            </p>
          </div>
        </div>
        {/* Subtle accents */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div
            className="absolute -left-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-2xl"
            style={{ background: emerald }}
          ></div>
          <div
            className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full opacity-10 blur-3xl"
            style={{ background: yellow }}
          ></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Bar */}
        <div
          className="bg-white rounded-2xl border shadow-sm mb-8 p-6"
          style={{ borderColor: "#e5e7eb" }}
        >
          <div className="flex flex-col gap-6">
            {/* Search */}
            <div>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl transition-all duration-200 outline-none"
                  style={{
                    background: "#F9FAFB",
                    border: "1px solid #e5e7eb",
                    color: charcoal,
                    boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow = `0 0 0 2px ${yellow}66`)
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "inset 0 1px 0 rgba(0,0,0,0.02)")
                  }
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                  <svg
                    className="w-5 h-5 transition-colors"
                    style={{ color: `${charcoal}99` }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200"
                  style={
                    selectedCategory === category.id
                      ? {
                          background: emerald,
                          color: white,
                          boxShadow: "0 2px 6px rgba(0,128,96,0.25)",
                        }
                      : {
                          background: "#F9FAFB",
                          color: charcoal,
                          border: "1px solid #e5e7eb",
                        }
                  }
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>

            {/* Sort & Price */}
            <div className="flex flex-wrap gap-4">
              <select
                value={`${priceRange[0]}-${priceRange[1]}`}
                onChange={(e) => {
                  const [min, max] = e.target.value.split("-").map(Number);
                  setPriceRange([min, max]);
                }}
                className="px-4 py-2 rounded-lg text-sm transition-all duration-200 outline-none"
                style={{
                  background: "#F9FAFB",
                  border: "1px solid #e5e7eb",
                  color: charcoal,
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.boxShadow = `0 0 0 2px ${yellow}66`)
                }
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                <option value="0-50000">All Prices</option>
                <option value="0-1000">Under ₨1,000</option>
                <option value="1000-5000">₨1,000 - ₨5,000</option>
                <option value="5000-10000">₨5,000 - ₨10,000</option>
                <option value="10000-50000">Above ₨10,000</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg text-sm transition-all duration-200 outline-none"
                style={{
                  background: "#F9FAFB",
                  border: "1px solid #e5e7eb",
                  color: charcoal,
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.boxShadow = `0 0 0 2px ${yellow}66`)
                }
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results header */}
        <div
          className="flex justify-between items-center mb-8 bg-white rounded-xl border p-4"
          style={{ borderColor: "#e5e7eb" }}
        >
          <div>
            <h2 className="text-xl font-medium" style={{ color: charcoal }}>
              {selectedCategory === "all"
                ? "All Products"
                : categories.find((c) => c.id === selectedCategory)?.name}
            </h2>
            <p className="text-sm" style={{ color: `${charcoal}99` }}>
              Showing{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}{" "}
              of {filteredProducts.length} products
            </p>
          </div>
        </div>

        {/* No Results */}
        {filteredProducts.length === 0 ? (
          <div
            className="text-center py-16 bg-white rounded-2xl border"
            style={{ borderColor: "#e5e7eb" }}
          >
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10"
                style={{ color: `${charcoal}66` }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium" style={{ color: charcoal }}>
              No products found
            </h3>
            <p className="mt-1" style={{ color: `${charcoal}99` }}>
              Try adjusting your search or filters
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setPriceRange([0, 50000]);
              }}
              className="mt-6 px-8 py-3 rounded-xl font-medium transition-all"
              style={{
                background: emerald,
                color: white,
                boxShadow: "0 6px 14px rgba(0,128,96,0.25)",
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {paginatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={{
                    id: p.id,
                    slug: p.slug,
                    name: p.name,
                    price: p.price,
                    compareAtPrice: p.sale_price ? p.regular_price : null,
                    image: p.image_url,
                    rating: p.rating,
                    reviews: p.reviews,
                    category: p.category,
                    inStock: p.in_stock,
                  }}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    style={{ borderColor: "#e5e7eb", color: charcoal }}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  {[...Array(totalPages)].map((_, idx) => {
                    const pageNumber = idx + 1;
                    const show =
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      Math.abs(currentPage - pageNumber) <= 1;

                    if (!show) {
                      if (
                        pageNumber === currentPage - 2 ||
                        pageNumber === currentPage + 2
                      ) {
                        return (
                          <span
                            key={`dot-${idx}`}
                            className="px-4 py-2"
                            style={{ color: `${charcoal}66` }}
                          >
                            …
                          </span>
                        );
                      }
                      return null;
                    }

                    const active = currentPage === pageNumber;
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(pageNumber)}
                        className="min-w-[40px] h-10 rounded-lg font-medium text-sm transition-all"
                        style={
                          active
                            ? {
                                background: emerald,
                                color: white,
                                boxShadow: "0 6px 14px rgba(0,128,96,0.25)",
                              }
                            : {
                                background: white,
                                border: "1px solid #e5e7eb",
                                color: charcoal,
                              }
                        }
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    style={{ borderColor: "#e5e7eb", color: charcoal }}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;
