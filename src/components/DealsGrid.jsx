import React from "react";
import ProductCard from "./ProductCard";

const _emerald = "#008060";
const charcoal = "#333333";

const DealsGrid = ({ saleProducts = [], loading = false }) => {
  const PAGE_PREVIEW = 4;
  return (
    <section className="mt-12">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="inline-block rounded-full px-3 py-1 text-sm font-semibold mb-1" style={{ background: "#FFD700", color: charcoal }}>
            Limited-time Deals
          </div>
          <h3 className="text-lg font-semibold" style={{ color: charcoal }}>Deals & Offers</h3>
          <p className="mt-1 text-sm" style={{ color: "#555" }}>Save more on bestsellers — limited windows, big savings.</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
        {loading
          ? Array.from({ length: PAGE_PREVIEW }).map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-gray-100 animate-pulse" />
            ))
          : saleProducts.length > 0
            ? saleProducts.map(p => <ProductCard key={p.id} product={p} />)
            : <div className="col-span-full py-12 text-center text-gray-500">No sale products currently available.</div>
        }
      </div>
    </section>
  );
};

export default DealsGrid;