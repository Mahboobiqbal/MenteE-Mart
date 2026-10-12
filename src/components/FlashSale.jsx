import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";

const pad = (n) => String(n).padStart(2, "0");

const getTimeLeft = () => {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const diff = Math.max(0, end - now);
  return {
    hours: Math.floor(diff / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
  };
};

const TimeBox = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <span className="w-11 h-11 rounded-lg bg-[#333] text-[#ffd700] text-xl font-bold flex items-center justify-center tabular-nums">
      {pad(value)}
    </span>
    <span className="text-[10px] uppercase tracking-wide text-gray-500 mt-1">
      {label}
    </span>
  </div>
);

const FlashSale = ({ products = [], loading = false }) => {
  const [left, setLeft] = useState(getTimeLeft());

  useEffect(() => {
    const t = setInterval(() => setLeft(getTimeLeft()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="mt-12 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 bg-gradient-to-r from-[#fff8e1] to-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⏰</span>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Flash Sale</h2>
            <p className="text-sm text-gray-500">Grab these deals before time runs out</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm font-medium text-gray-600">
            Ends in
          </span>
          <div className="flex items-center gap-2">
            <TimeBox value={left.hours} label="Hrs" />
            <TimeBox value={left.minutes} label="Min" />
            <TimeBox value={left.seconds} label="Sec" />
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-72 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
              {products.slice(0, 5).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="text-right mt-5">
              <Link
                to="/products?sort=discount"
                className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                View all deals →
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FlashSale;
