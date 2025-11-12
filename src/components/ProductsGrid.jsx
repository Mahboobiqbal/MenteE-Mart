import React from "react";
import ProductCard from "./ProductCard";

const ProductsGrid = ({ current = [], loading, totalCount = 0, page, setPage, totalPages }) => {
  const PAGE_SIZE = 12;
  return (
    <section className="mt-12">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-bold" style={{ color: "#333" }}>All Products — Everything in store</h2>
        <span className="text-sm" style={{ color: "#555" }}>{loading ? "Loading..." : `${totalCount} items`}</span>
      </div>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
        {loading
          ? Array.from({ length: PAGE_SIZE }).map((_, i) => <div key={i} className="h-64 rounded-xl bg-gray-100 animate-pulse" />)
          : current.length > 0
            ? current.map(p => <ProductCard key={p.id} product={p} />)
            : <div className="col-span-full py-12 text-center text-gray-500">No products available.</div>}
      </div>

      {totalCount > PAGE_SIZE && (
        <div className="mt-8 flex items-center justify-between">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-4 py-2 rounded-lg font-medium" style={{ backgroundColor: page === 1 ? "#3331A" : "#008060", color: page === 1 ? "#333699" : "#fff" }}>Previous</button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(totalPages, 6) }).map((_, idx) => (
              <button key={idx} onClick={() => setPage(idx + 1)} className={`px-3 py-1 rounded ${page === idx + 1 ? "font-semibold" : ""}`} style={{ background: page === idx + 1 ? "#008060" : "transparent", color: page === idx + 1 ? "#fff" : "#333" }}>{idx + 1}</button>
            ))}
            {totalPages > 6 && <span style={{ color: "#777" }}>…</span>}
          </div>

          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-4 py-2 rounded-lg font-medium" style={{ backgroundColor: page === totalPages ? "#3331A" : "#008060", color: page === totalPages ? "#333699" : "#fff" }}>Next</button>
        </div>
      )}
    </section>
  );
};

export default ProductsGrid;