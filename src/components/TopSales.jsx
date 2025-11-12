import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";

const TopSales = ({ products = [], loading = false }) => {
  const navigate = useNavigate();

  const topSales = useMemo(() => {
    if (!products.length) return [];

    return products.map((product, index) => {
      const saleCount = Number(
        product.saleCount ??
          product.sales_count ??
          product.orders ??
          product.order_count ??
          product.whatsapp_clicks ??
          product.click_count ??
          product.clicks ??
          0
      );

      return {
        ...product,
        saleCount,
        rank: product.salesRank ?? index + 1,
      };
    });
  }, [products]);

  if (loading) {
    return (
      <section className="mt-12 mb-8 px-2">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-[#333333]">🔥 Top Sales</h2>
            <p className="text-sm text-gray-600">
              Most popular products this month
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
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

  if (topSales.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 mb-12 px-2">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-xl font-bold text-[#333333] flex items-center gap-2">
            🔥 Top Sales
            <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
              #{topSales[0]?.rank}
            </span>
          </h2>
          <p className="text-sm text-gray-600">
            Most popular products this month
          </p>
        </div>
        <button
          onClick={() => navigate("/products?sort=top-sales")}
          className="text-sm text-[#008060] hover:underline font-semibold"
        >
          View All →
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6 px-4">
        {topSales.slice(0, 6).map((product) => (
          <div key={product.id} className="relative group">
            {/* Rank Badge */}
            <div className="absolute -top-2 -left-2 z-10">
              <div
                className={`
                w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm
                ${
                  product.rank === 1
                    ? "bg-yellow-500"
                    : product.rank === 2
                    ? "bg-gray-400"
                    : product.rank === 3
                    ? "bg-orange-600"
                    : "bg-gray-600"
                }
              `}
              >
                #{product.rank}
              </div>
            </div>

            {/* Sales Count Badge */}
            <div className="absolute top-2 right-2 z-10">
              <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                {product.saleCount} sold
              </div>
            </div>

            <ProductCard
              product={{
                ...product,
                is_trending: true,
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default TopSales;
