import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const emerald = "#008060";
const white = "#FFFFFF";

const AdvancedFilters = ({
  onFiltersChange,
  totalProducts,
  categories = [],
  priceRange = [0, 50000],
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "all",
    stockStatus: searchParams.get("stock") || "all",
    minRating: searchParams.get("rating") || "0",
    special: searchParams.get("special") || "all",
    priceMin: searchParams.get("priceMin") || priceRange[0],
    priceMax: searchParams.get("priceMax") || priceRange[1],
    inStockOnly: searchParams.get("inStock") === "true",
    sortBy: searchParams.get("sort") || "name",
  });

  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    // Update URL params
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value !== "all" && value !== 0 && value !== false) {
        params.set(key === "inStockOnly" ? "inStock" : key, value.toString());
      }
    });

    setSearchParams(params);

    // Notify parent component
    if (onFiltersChange) {
      onFiltersChange(updatedFilters);
    }
  };

  const clearFilters = () => {
    const resetFilters = {
      category: "all",
      stockStatus: "all",
      minRating: "0",
      special: "all",
      priceMin: priceRange[0],
      priceMax: priceRange[1],
      inStockOnly: false,
      sortBy: "name",
    };
    setFilters(resetFilters);
    setSearchParams({});

    if (onFiltersChange) {
      onFiltersChange(resetFilters);
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category !== "all") count++;
    if (filters.stockStatus !== "all") count++;
    if (parseFloat(filters.minRating) > 0) count++;
    if (filters.special !== "all") count++;
    if (filters.inStockOnly) count++;
    if (filters.priceMin > priceRange[0] || filters.priceMax < priceRange[1])
      count++;
    if (filters.sortBy !== "name") count++;
    return count;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Filter Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {totalProducts} products
              </span>
              {getActiveFiltersCount() > 0 && (
                <span className="bg-[#008060] text-white text-xs px-2 py-1 rounded-full">
                  {getActiveFiltersCount()} active
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {getActiveFiltersCount() > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-[#008060] transition-colors"
              >
                Clear All
              </button>
            )}

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-[#008060] hover:text-[#006B4F] transition-colors"
            >
              {showAdvanced ? "Simple" : "Advanced"}
              <svg
                className={`w-4 h-4 transition-transform ${
                  showAdvanced ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Basic Filters */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange({ category: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008060] focus:border-transparent outline-none transition"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Availability
            </label>
            <select
              value={filters.stockStatus}
              onChange={(e) =>
                handleFilterChange({ stockStatus: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008060] focus:border-transparent outline-none transition"
            >
              <option value="all">All Products</option>
              <option value="in_stock">In Stock Only</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Rating
            </label>
            <select
              value={filters.minRating}
              onChange={(e) =>
                handleFilterChange({ minRating: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008060] focus:border-transparent outline-none transition"
            >
              <option value="0">All Ratings</option>
              <option value="3">3+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008060] focus:border-transparent outline-none transition"
            >
              <option value="name">Name A-Z</option>
              <option value="name_desc">Name Z-A</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-4">Advanced Filters</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Price Range: ₨{Number(filters.priceMin).toLocaleString()} - ₨
                {Number(filters.priceMax).toLocaleString()}
              </label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Minimum Price
                  </label>
                  <input
                    type="range"
                    min={priceRange[0]}
                    max={priceRange[1]}
                    value={filters.priceMin}
                    onChange={(e) =>
                      handleFilterChange({
                        priceMin: parseInt(e.target.value),
                        priceMax: Math.max(
                          filters.priceMax,
                          parseInt(e.target.value)
                        ),
                      })
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #008060 0%, #008060 ${
                        ((filters.priceMin - priceRange[0]) /
                          (priceRange[1] - priceRange[0])) *
                        100
                      }%, #E5E7EB ${
                        ((filters.priceMin - priceRange[0]) /
                          (priceRange[1] - priceRange[0])) *
                        100
                      }%, #E5E7EB 100%)`,
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Maximum Price
                  </label>
                  <input
                    type="range"
                    min={priceRange[0]}
                    max={priceRange[1]}
                    value={filters.priceMax}
                    onChange={(e) =>
                      handleFilterChange({
                        priceMax: parseInt(e.target.value),
                        priceMin: Math.min(
                          filters.priceMin,
                          parseInt(e.target.value)
                        ),
                      })
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #008060 0%, #008060 ${
                        ((filters.priceMax - priceRange[0]) /
                          (priceRange[1] - priceRange[0])) *
                        100
                      }%, #E5E7EB ${
                        ((filters.priceMax - priceRange[0]) /
                          (priceRange[1] - priceRange[0])) *
                        100
                      }%, #E5E7EB 100%)`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Special Offers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Special Offers
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="special"
                    value="all"
                    checked={filters.special === "all"}
                    onChange={(e) =>
                      handleFilterChange({ special: e.target.value })
                    }
                    className="mr-3"
                  />
                  <span className="text-sm">All Products</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="special"
                    value="featured"
                    checked={filters.special === "featured"}
                    onChange={(e) =>
                      handleFilterChange({ special: e.target.value })
                    }
                    className="mr-3"
                  />
                  <span className="text-sm">Featured Only</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="special"
                    value="on_sale"
                    checked={filters.special === "on_sale"}
                    onChange={(e) =>
                      handleFilterChange({ special: e.target.value })
                    }
                    className="mr-3"
                  />
                  <span className="text-sm">On Sale</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="special"
                    value="trending"
                    checked={filters.special === "trending"}
                    onChange={(e) =>
                      handleFilterChange({ special: e.target.value })
                    }
                    className="mr-3"
                  />
                  <span className="text-sm">Trending</span>
                </label>
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.inStockOnly}
                  onChange={(e) =>
                    handleFilterChange({ inStockOnly: e.target.checked })
                  }
                  className="mr-3 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  In Stock Only
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {getActiveFiltersCount() > 0 && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Active Filters:
          </h4>
          <div className="flex flex-wrap gap-2">
            {filters.category !== "all" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#008060]/10 text-[#008060]">
                Category:{" "}
                {categories.find((c) => c === filters.category) ||
                  filters.category}
                <button
                  onClick={() => handleFilterChange({ category: "all" })}
                  className="ml-2 text-[#008060] hover:text-[#006B4F]"
                >
                  ×
                </button>
              </span>
            )}
            {filters.stockStatus !== "all" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {filters.stockStatus === "in_stock"
                  ? "In Stock"
                  : "Out of Stock"}
                <button
                  onClick={() => handleFilterChange({ stockStatus: "all" })}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {parseFloat(filters.minRating) > 0 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {filters.minRating}+ Stars
                <button
                  onClick={() => handleFilterChange({ minRating: "0" })}
                  className="ml-2 text-yellow-600 hover:text-yellow-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.special !== "all" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {filters.special === "featured"
                  ? "Featured"
                  : filters.special === "on_sale"
                  ? "On Sale"
                  : "Trending"}
                <button
                  onClick={() => handleFilterChange({ special: "all" })}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.inStockOnly && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                In Stock Only
                <button
                  onClick={() => handleFilterChange({ inStockOnly: false })}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;
