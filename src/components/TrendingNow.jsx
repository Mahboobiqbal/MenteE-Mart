import React from "react";
import ProductTile from "./ProductTile";

const TrendingNow = ({ trendingProducts = [], loading }) => {
  return (
    <section className="mt-10">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#333" }}>Trending Now</h2>
          <p className="text-sm text-gray-600">See what’s catching attention — curated picks and rising stars.</p>
        </div>
      </div>

      <div className="mt-4 flex gap-4 overflow-x-auto pb-2 snap-x">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="min-w-[260px] max-w-[260px] h-48 bg-gray-100 rounded-xl animate-pulse" />)
          : trendingProducts.length > 0
            ? trendingProducts.map(p => <ProductTile key={p.id} product={p} />)
            : <div className="w-full py-8 text-center text-gray-500">No trending products found.</div>}
      </div>
    </section>
  );
};

export default TrendingNow;