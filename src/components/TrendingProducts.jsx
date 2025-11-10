import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";

const getEngagementScore = (product) => {
  if (!product) return 0;
  const views = Number(product.view_count ?? product.views ?? 0);
  const clicks = Number(product.click_count ?? product.clicks ?? 0);
  const whatsapp = Number(product.whatsapp_clicks ?? 0);
  return views + clicks * 3 + whatsapp * 5;
};

const TrendingProducts = ({ products = [], loading = false }) => {
  const navigate = useNavigate();

  const trending = useMemo(() => {
    if (!products.length) return [];

    const scored = products.map((product) => ({
      product,
      score: Number(product.engagementScore ?? getEngagementScore(product)),
    }));

    scored.sort((a, b) => b.score - a.score);

    const topSix = scored.slice(0, 6);
    const maxScore = Math.max(1, ...topSix.map((entry) => entry.score));

    return topSix.map((entry, index) => {
      const views = Number(
        entry.product.view_count ?? entry.product.views ?? 0
      );
      const clicks = Number(
        entry.product.click_count ?? entry.product.clicks ?? 0
      );
      const whatsapp = Number(entry.product.whatsapp_clicks ?? 0);
      const trendScore = Math.min(
        100,
        Math.round((entry.score / maxScore) * 100)
      );
      const viewIncrease = Math.max(8, Math.round(views * 0.2) || 0);
      const purchaseIncrease = Math.max(
        5,
        Math.round(whatsapp * 0.5 + clicks * 0.2) || 0
      );

      return {
        ...entry.product,
        trendScore,
        isHot: index === 0 && trendScore >= 60,
        viewIncrease,
        purchaseIncrease,
      };
    });
  }, [products]);

  if (loading) {
    return (
      <section className="mt-12">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#333333]">
              📈 Trending Now
            </h2>
            <p className="text-sm text-gray-600">Products gaining popularity</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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

  if (trending.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#333333] flex items-center gap-2">
            📈 Trending Now
            {trending.find((p) => p.isHot) && (
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-semibold animate-pulse">
                HOT
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-600">Products gaining popularity</p>
        </div>
        <button
          onClick={() => navigate("/products?sort=trending")}
          className="text-sm text-[#008060] hover:underline font-semibold"
        >
          View All →
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {trending.map((product) => (
          <div key={product.id} className="relative group">
            {/* Trending Badge */}
            <div className="absolute -top-2 -left-2 z-10">
              <div
                className={`
                px-3 py-1 rounded-full text-white font-bold text-xs
                ${product.isHot ? "bg-red-500 animate-pulse" : "bg-blue-500"}
              `}
              >
                {product.isHot ? "🔥 HOT" : "📈 TRENDING"}
              </div>
            </div>

            {/* Trend Score */}
            <div className="absolute top-2 right-2 z-10">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                {product.trendScore}% trending
              </div>
            </div>

            <ProductCard
              product={{
                ...product,
                is_trending: true,
              }}
            />

            {/* Trend indicators */}
            <div className="mt-2 flex justify-between text-xs text-gray-600">
              <span>+{product.viewIncrease}% views</span>
              <span>+{product.purchaseIncrease}% purchases</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrendingProducts;
