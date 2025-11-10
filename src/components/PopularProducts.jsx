import React from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";

const PopularProducts = ({ saleProducts = [], trendingProducts = [] }) => {
  const navigate = useNavigate();

  // Combine and deduplicate products
  const allPopular = [
    ...new Map([
      ...saleProducts.map((p) => [p.id, p]),
      ...trendingProducts.map((p) => [p.id, p]),
    ]).values(),
  ].slice(0, 8);

  return (
    <section className="mt-12">
      <div className="text-center mb-8">
        <div
          className="inline-block rounded-full px-4 py-2 text-sm font-semibold mb-3"
          style={{ background: "#FFD700", color: "#333333" }}
        >
          🔥 Popular Now
        </div>
        <h2 className="text-2xl font-bold text-[#333333]">Deals & Trending</h2>
        <p className="text-sm text-gray-600">
          Best value products everyone's loving
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {allPopular.map((product) => (
          <div key={product.id} className="relative">
            {(product.sale_price || product.sale_type) && (
              <div className="absolute top-2 right-2 z-10 bg-[#FFD700] text-[#333333] px-2 py-1 rounded-full text-xs font-bold">
                SALE
              </div>
            )}
            {product.featured && (
              <div className="absolute top-2 left-2 z-10 bg-[#008060] text-white px-2 py-1 rounded-full text-xs font-bold">
                FEATURED
              </div>
            )}
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <button
          onClick={() => navigate("/products")}
          className="px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300"
          style={{ background: "#008060", color: "white" }}
        >
          View All Products →
        </button>
      </div>
    </section>
  );
};

export default PopularProducts;
