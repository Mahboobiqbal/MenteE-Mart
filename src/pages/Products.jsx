// filepath: h:\Code\Nainzaka Aesthetics\src\pages\Products.jsx
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import ProductCard from "../components/ProductCard";

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

  // Updated Categories
  const categories = [
    { id: "all", name: "All Products", icon: "🛍️" },
    { id: "cleansers", name: "Cleansers", icon: "🧴" },
    { id: "moisturizers", name: "Moisturizers", icon: "✨" },
    { id: "serums", name: "Serums & Treatments", icon: "💧" },
    { id: "sunscreens", name: "Sunscreens", icon: "☀️" },
    { id: "masks", name: "Face Masks", icon: "🎭" },
    { id: "lipbody", name: "Lip & Body Care", icon: "💋" }
  ];

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Fixed Filtering logic
  useEffect(() => {
    let filtered = [...products];
    
    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Category filter
    if (selectedCategory !== "all") {
      const selectedCatObj = categories.find(c => c.id === selectedCategory);
      if (selectedCatObj) {
        filtered = filtered.filter(product =>
          product.category?.toLowerCase() === selectedCatObj.name.toLowerCase() ||
          product.category?.toLowerCase().includes(selectedCatObj.name.toLowerCase())
        );
      }
    }
    
    // Price filter
    filtered = filtered.filter(product => {
      const price = product.salePrice || product.price || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          const priceA = a.salePrice || a.price || 0;
          const priceB = b.salePrice || b.price || 0;
          return priceA - priceB;
        case "price-high":
          const priceHighA = a.salePrice || a.price || 0;
          const priceHighB = b.salePrice || b.price || 0;
          return priceHighB - priceHighA;
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        default:
          return 0;
      }
    });
    
    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, priceRange, sortBy]);

  // Add pagination logic
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  // Add this useEffect
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, selectedCategory, priceRange, sortBy]);

  // Enhanced Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-white to-pink-50">
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-pink-100 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 border-4 border-t-[#660033] rounded-full animate-spin"></div>
          </div>
          <p className="text-lg text-gray-700 font-medium animate-pulse">
            Loading your beauty collection...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-pink-50/30">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-light text-gray-900">
              Our{" "}
              <span className="font-medium bg-gradient-to-r from-[#660033] to-[#AD1457] bg-clip-text text-transparent">
                Collection
              </span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Discover premium beauty products curated for your unique style
            </p>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute -left-4 -top-4 w-24 h-24 bg-gradient-to-br from-[#660033] to-[#AD1457] rounded-full opacity-10 blur-2xl"></div>
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-gradient-to-br from-[#660033] to-[#AD1457] rounded-full opacity-10 blur-3xl"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Filters Bar */}
        <div className="bg-white/80 backdrop-blur-md shadow-lg rounded-2xl mb-8 p-6">
          <div className="flex flex-col lg:flex-col gap-7">
            {/* Enhanced Search */}
            <div className="flex-1">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl 
                           focus:outline-none focus:ring-2 focus:ring-[#660033]/20 focus:border-[#660033]
                           transition-all duration-300 group-hover:bg-white"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-[#660033] transition-colors duration-300" 
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z">
                    </path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Enhanced Category Pills */}
            <div className="flex-none">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300
                              ${selectedCategory === category.id
                                ? 'bg-gradient-to-r from-[#660033] to-[#AD1457] text-white shadow-lg'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Enhanced Sort & Price Filters */}
            <div className="flex gap-4">
              <select
                value={`${priceRange[0]}-${priceRange[1]}`}
                onChange={(e) => {
                  const [min, max] = e.target.value.split('-').map(Number);
                  setPriceRange([min, max]);
                }}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-[#660033]/20 focus:border-[#660033]
                         hover:bg-white transition-all duration-300"
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
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-[#660033]/20 focus:border-[#660033]
                         hover:bg-white transition-all duration-300"
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Enhanced Results Header */}
        <div className="flex justify-between items-center mb-8 bg-white/80 backdrop-blur-md rounded-xl p-4">
          <div>
            <h2 className="text-xl font-medium text-gray-900">
              {selectedCategory === "all" ? "All Products" : categories.find(c => c.id === selectedCategory)?.name}
            </h2>
            <p className="text-gray-600 text-sm">
              Showing {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
            </p>
          </div>
        </div>

        {/* Enhanced No Results State */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white/80 backdrop-blur-md rounded-2xl">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
                </path>
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
            <button 
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setPriceRange([0, 50000]);
              }}
              className="bg-gradient-to-r from-[#660033] to-[#AD1457] text-white px-8 py-3 rounded-xl
                         font-medium transition-all duration-300 hover:shadow-lg hover:shadow-pink-200
                         transform hover:-translate-y-0.5"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed
                             hover:border-[#660033] hover:text-[#660033] transition-colors duration-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {[...Array(totalPages)].map((_, idx) => {
                    const pageNumber = idx + 1;
                    // Show first page, last page, current page, and one page before/after current
                    const shouldShow = pageNumber === 1 || 
                                     pageNumber === totalPages ||
                                     Math.abs(currentPage - pageNumber) <= 1;

                    if (!shouldShow) {
                      // Show dots only once between gaps
                      if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                        return <span key={`dot-${idx}`} className="px-4 py-2">...</span>;
                      }
                      return null;
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`min-w-[40px] h-10 rounded-lg font-medium text-sm transition-all duration-300
                                  ${currentPage === pageNumber
                                    ? 'bg-gradient-to-r from-[#660033] to-[#AD1457] text-white shadow-lg'
                                    : 'bg-white border border-gray-200 text-gray-700 hover:border-[#660033] hover:text-[#660033]'
                                  }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed
                             hover:border-[#660033] hover:text-[#660033] transition-colors duration-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
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