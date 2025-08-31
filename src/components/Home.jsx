// filepath: h:\Code\Nainzaka Aesthetics\src\components\Home.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import ProductTile from "./ProductTile";
import supabase from "../utils/supabase";

const PAGE_SIZE = 12;
const emerald = "#008060";
const yellow = "#FFD700";
const white = "#FFFFFF";
const charcoal = "#333333";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const q = (params.get("q") || "").trim();
  const pageParam = Math.max(1, parseInt(params.get("page") || "1", 10) || 1);
  const [page, setPage] = useState(pageParam);

  useEffect(() => setPage(pageParam), [pageParam]);

  // Load from Supabase
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) throw new Error(error.message);
        
        // Transform Supabase data to match expected format
        const transformedProducts = data.map(product => ({
          id: product.id,
          slug: product.slug || product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          compareAtPrice: product.sale_price ? product.regular_price : null,
          image: product.image_url,
          rating: product.rating || 4.0,
          reviews: product.reviews || 0,
          category: product.category,
          inStock: product.in_stock,
          isTrending: product.featured,
          views: product.views || 0,
          clicks: product.clicks || 0
        }));

        setProducts(transformedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Filter by query (for All Products only)
  const filtered = useMemo(() => {
    const lower = q.toLowerCase();
    if (!lower) return products;
    return products.filter((p) => {
      const name = String(p.name || p.title || "").toLowerCase();
      const desc = String(p.description || "").toLowerCase();
      return name.includes(lower) || desc.includes(lower);
    });
  }, [products, q]);

  // Build sections
  const saleProducts = useMemo(
    () => products.filter((p) => p.compareAtPrice && Number(p.compareAtPrice) > Number(p.price)).slice(0, 8),
    [products]
  );

  const trendingProducts = useMemo(
    () =>
      products
        .filter(
          (p) => p.isTrending || Number(p.reviews) >= 5 || Number(p.rating) >= 4.5 || Number(p.views) > 50
        )
        .slice(0, 10),
    [products]
  );

  const usedIds = new Set([...trendingProducts, ...saleProducts].map((p) => p.id));
  const generalList = filtered.filter((p) => !usedIds.has(p.id));

  const totalPages = Math.max(1, Math.ceil(generalList.length / PAGE_SIZE));
  const current = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return generalList.slice(start, start + PAGE_SIZE);
  }, [generalList, page]);

  const goTo = (p) => {
    setPage(p);
    const sp = new URLSearchParams(location.search);
    sp.set("page", String(p));
    navigate({ pathname: "/", search: `?${sp.toString()}` });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = (formData.get("q") || "").toString().trim();
    const sp = new URLSearchParams(location.search);
    if (query) sp.set("q", query);
    else sp.delete("q");
    sp.set("page", "1");
    navigate({ pathname: "/", search: `?${sp.toString()}` });
  };

  // Show error state if fetch failed
  if (error && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f5f7f6" }}>
        <div className="bg-white p-8 rounded-xl border max-w-md mx-auto text-center" style={{ borderColor: "#e5e7eb" }}>
          <svg className="w-12 h-12 mx-auto mb-4" style={{ color: "#ef4444" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold mb-2" style={{ color: charcoal }}>Error Loading Products</h2>
          <p className="mb-4 text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 rounded-lg font-medium"
            style={{ backgroundColor: emerald, color: white }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ backgroundColor: white }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header + search */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: charcoal }}>Discover Products</h1>
            <p className="text-sm mt-1" style={{ color: "#555" }}>
              Shop Smart. Live Better.
            </p>
          </div>

          <form onSubmit={onSearchSubmit} className="w-full md:w-auto">
            <div className="relative">
              <input
                name="q"
                defaultValue={q}
                type="search"
                placeholder="Search products..."
                className="w-full md:w-80 h-11 rounded-xl pl-4 pr-24 outline-none transition"
                style={{ backgroundColor: white, color: charcoal, border: `1px solid ${charcoal}22` }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${yellow}`)}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-1 my-1 px-4 rounded-lg font-medium transition"
                style={{ backgroundColor: yellow, color: charcoal }}
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Trending section - horizontal scroll tiles */}
        <section className="mt-10">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-bold" style={{ color: charcoal }}>Trending Now</h2>
            <Link to="/products" className="text-sm font-medium hover:underline" style={{ color: emerald }}>
              View all
            </Link>
          </div>
          <div
            className="mt-4 flex gap-4 overflow-x-auto pb-2 snap-x"
            style={{ scrollbarColor: `${emerald} ${white}` }}
          >
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="min-w-[260px] max-w-[260px] h-48 bg-gray-100 rounded-xl animate-pulse" />
                ))
              : trendingProducts.length > 0 
                ? trendingProducts.map((p) => <ProductTile key={p.id} product={p} />)
                : <div className="w-full py-8 text-center text-gray-500">No trending products found.</div>}
          </div>
        </section>

        {/* Sale section - highlighted grid */}
        <section className="mt-12">
          <div
            className="rounded-xl px-4 py-2 inline-block"
            style={{ backgroundColor: yellow, color: charcoal }}
          >
            Limited-time Deals
          </div>
          <p className="mt-2 text-sm" style={{ color: "#555" }}>
            Save more on bestsellers.
          </p>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-64 rounded-xl bg-gray-100 animate-pulse" />
                ))
              : saleProducts.length > 0
                ? saleProducts.map((p) => <ProductCard key={p.id} product={p} />)
                : <div className="col-span-full py-12 text-center text-gray-500">No sale products currently available.</div>}
          </div>
        </section>

        {/* All products - paginated grid */}
        <section className="mt-12">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-bold" style={{ color: charcoal }}>All Products</h2>
            <span className="text-sm" style={{ color: "#555" }}>
              {loading ? "Loading..." : `${generalList.length} items`}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {loading
              ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <div key={i} className="h-64 rounded-xl bg-gray-100 animate-pulse" />
                ))
              : current.length > 0
                ? current.map((p) => <ProductCard key={p.id} product={p} />)
                : <div className="col-span-full py-12 text-center text-gray-500">
                    {q ? "No products found matching your search." : "No products available."}
                  </div>}
          </div>

          {generalList.length > PAGE_SIZE && (
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => goTo(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg font-medium transition"
                style={{
                  backgroundColor: page === 1 ? `${charcoal}1A` : emerald,
                  color: page === 1 ? `${charcoal}99` : white,
                  cursor: page === 1 ? "not-allowed" : "pointer",
                }}
              >
                Previous
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(totalPages, 6) }).map((_, idx) => {
                  const p = idx + 1;
                  const active = p === page;
                  return (
                    <button
                      key={p}
                      onClick={() => goTo(p)}
                      className="min-w-10 h-10 px-3 rounded-lg border text-sm font-medium transition"
                      style={{
                        backgroundColor: active ? yellow : white,
                        color: charcoal,
                        border: `1px solid ${active ? yellow : `${charcoal}26`}`,
                      }}
                    >
                      {p}
                    </button>
                  );
                })}
                {totalPages > 6 && <span style={{ color: "#777" }}>…</span>}
              </div>

              <button
                onClick={() => goTo(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg font-medium transition"
                style={{
                  backgroundColor: page === totalPages ? `${charcoal}1A` : emerald,
                  color: page === totalPages ? `${charcoal}99` : white,
                  cursor: page === totalPages ? "not-allowed" : "pointer",
                }}
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;