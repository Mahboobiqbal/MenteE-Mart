import React from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";

const NewArrivals = ({ products = [], loading = false }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <section className="mt-12">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#333333]">
              🆕 New Arrivals
            </h2>
            <p className="text-sm text-gray-600">Fresh products just added</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#333333] flex items-center gap-2">
            🆕 New Arrivals
            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-semibold">
              FRESH
            </span>
          </h2>
          <p className="text-sm text-gray-600">Fresh products just added</p>
        </div>
        <button
          onClick={() => navigate("/products?sort=newest")}
          className="text-sm text-[#008060] hover:underline font-semibold"
        >
          View All →
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
        {products.map((product) => {
          const addedDate =
            product.dateAdded || product.created_at || product.updated_at;
          const dateValue = addedDate ? new Date(addedDate) : null;
          const formattedDate =
            dateValue && !Number.isNaN(dateValue.getTime())
              ? dateValue.toLocaleDateString()
              : "Recently";

          return (
            <div key={product.id} className="relative group">
              {/* New Badge */}
              <div className="absolute -top-2 -left-2 z-10">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full font-bold text-xs animate-pulse">
                  🆕 NEW
                </div>
              </div>

              {/* Badge based on product badge */}
              {product.badge && (
                <div className="absolute top-2 right-2 z-10">
                  <div className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    {product.badge}
                  </div>
                </div>
              )}

              <ProductCard
                product={{
                  ...product,
                  is_new: true,
                }}
              />

              {/* Date added */}
              <div className="mt-2 text-center">
                <span className="text-xs text-gray-500">
                  Added {formattedDate}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default NewArrivals;
