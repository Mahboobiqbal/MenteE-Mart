import React from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";

const FeaturedProducts = ({ current = [], loading = false }) => {
  const navigate = useNavigate();

  // Show only 6 products on the home page instead of 12
  const featuredProducts = current.slice(0, 6);

  return (
    <section className="mt-12">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#333333]">All Products</h2>
          <p className="text-sm text-gray-600">Complete collection</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-xl bg-gray-100 animate-pulse"
            />
          ))
        ) : featuredProducts.length > 0 ? (
          featuredProducts.map((p) => <ProductCard key={p.id} product={p} />)
        ) : (
          <div className="col-span-full py-8 text-center text-gray-500">
            No products available.
          </div>
        )}
      </div>

      {current.length > 6 && (
        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/products")}
            className="px-8 py-3 rounded-full font-bold border-2 transition-all duration-300 hover:bg-[#008060]/10"
            style={{ borderColor: "#008060", color: "#008060" }}
          >
            View All {current.length} Products →
          </button>
        </div>
      )}
    </section>
  );
};

export default FeaturedProducts;
