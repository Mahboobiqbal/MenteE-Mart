import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";

const FeaturedProducts = ({ products = [], loading = false }) => {
  const navigate = useNavigate();

  const featuredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.slice(0, 6);
  }, [products]);

  return (
    <section className="mt-12">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#333333]">All Products</h2>
          <p className="text-sm text-gray-600">Complete collection</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-xl bg-gray-100 animate-pulse"
            />
          ))
        ) : featuredProducts.length > 0 ? (
          featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full py-8 text-center text-gray-500">
            No products available.
          </div>
        )}
      </div>

      {Array.isArray(products) && products.length > 6 && (
        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/products")}
            className="px-8 py-3 rounded-full font-bold border-2 transition-all duration-300 hover:bg-[#008060]/10"
            style={{ borderColor: "#008060", color: "#008060" }}
          >
            View All {products.length} Products →
          </button>
        </div>
      )}
    </section>
  );
};

export default FeaturedProducts;
