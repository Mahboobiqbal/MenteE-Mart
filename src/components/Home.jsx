// filepath: h:\Code\Nainzaka Aesthetics\src\components\Home.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import supabase from "../utils/supabase";
import { Link, useLocation, useNavigate } from "react-router-dom";
import HeroSection from "./HeroSection";
import Showcase from "./Showcase";
import TrendingNow from "./TrendingNow";
import DealsGrid from "./DealsGrid";
import ProductsGrid from "./ProductsGrid";
import SectionHeader from "./SectionHeader";

const PAGE_SIZE = 12;
const emerald = "#008060";
const white = "#FFFFFF";
const charcoal = "#333333";

const normalize = (p) => ({
  id: p.id,
  // support multiple DB column name variants
  name: p.name ?? p.title ?? p.product_name ?? "",
  description: p.description ?? p.desc ?? "",
  // keep both keys (some components use image, others image_url)
  image: p.image ?? p.image_url ?? p.thumbnail ?? "",
  image_url: p.image_url ?? p.image ?? p.thumbnail ?? "",
  price: Number(p.price ?? p.regular_price ?? p.sale_price ?? 0),
  sale_price: p.sale_price ?? null,
  regular_price: p.regular_price ?? null,
  in_stock: typeof p.in_stock === "boolean" ? p.in_stock : true,
  featured: !!p.featured,
  views: Number(p.views ?? 0),
  clicks: Number(p.clicks ?? 0),
  sale_type: p.sale_type ?? null,
  // include raw object for anything else
  raw: p,
});

const Home = () => {
  const [products, setProducts] = useState([]); // normalized products
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // lists + pagination
  const [generalList, setGeneralList] = useState([]);
  const [current, setCurrent] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [saleProducts, setSaleProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);

  // showcase
  const [showcase, setShowcase] = useState([]);
  const [scIndex, setScIndex] = useState(0);
  const [topFallback, setTopFallback] = useState(null);
  const [loadingTop, setLoadingTop] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const qparams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  // Single fetch + normalize
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        if (!mounted) return;
        const normalized = (data || []).map(normalize);
        setProducts(normalized);

        // derived lists
        setGeneralList(normalized);
        setSaleProducts(normalized.filter((p) => p.sale_price || p.sale_type));
        setTrendingProducts(normalized.filter((p) => p.featured || (p.views || 0) > 50));

        const pages = Math.max(1, Math.ceil(normalized.length / PAGE_SIZE));
        setTotalPages(pages);
        setPage(1);
        setCurrent(normalized.slice(0, PAGE_SIZE));
      } catch (e) {
        console.error("Failed to load products:", e);
        setError(e?.message || "Failed to load products");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // recompute current page slice when page or generalList changes
  useEffect(() => {
    const start = (page - 1) * PAGE_SIZE;
    setCurrent(generalList.slice(start, start + PAGE_SIZE));
  }, [page, generalList]);

  // Build showcase from already-fetched products (no extra DB calls)
  useEffect(() => {
    if (!products || products.length === 0) {
      setShowcase([]);
      setTopFallback(null);
      return;
    }

    // Top viewed product
    const sortedByViews = [...products].sort((a, b) => (b.views || 0) - (a.views || 0));
    const top = sortedByViews[0] ?? null;

    // specials: featured or sale_type
    const specials = products.filter((p) => p.featured || p.sale_type).slice(0, 2);

    // merged: top first (if not already included), then specials (dedupe), cap to 2
    const merged = [];
    if (top) merged.push(top);
    for (const s of specials) {
      if (!merged.find((m) => m.id === s.id)) merged.push(s);
    }
    setShowcase(merged.slice(0, 2));

    // top fallback used when no specials exist (still provide the top product)
    if (merged.length === 0 && top) {
      setTopFallback(top);
    } else {
      setTopFallback(merged[0] ?? null);
    }
  }, [products]);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    const q = new FormData(e.target).get("q")?.toString().trim().toLowerCase() || "";
    if (!q) {
      setGeneralList(products);
      setPage(1);
      return;
    }
    const filtered = products.filter((p) => (p.name || "").toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q));
    setGeneralList(filtered);
    setPage(1);
  };

  // Ensure showcase index resets when slides change
  useEffect(() => {
    setScIndex(0);
  }, [showcase.length]);

  return (
    <div className="w-full" style={{ backgroundColor: white }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* <SectionHeader badge="Limited-time Deals" title="Discover Products" subtitle="Shop Smart. Live Better." /> */}

        {/* Hero (top) */}
        <section>
          <HeroSection />
        </section>

        {/* Showcase / top-viewed / specials */}
        <section className="mt-8">
          <Showcase
            showcase={showcase}
            topFallback={topFallback}
            loadingTop={loadingTop}
            scIndex={scIndex}
            setScIndex={setScIndex}
          />
        </section>

        {/* Limited-time deals under Hero (user requested) */}
        <DealsGrid saleProducts={saleProducts} loading={loading} />

        {/* Trending */}
        <TrendingNow trendingProducts={trendingProducts} loading={loading} />

        {/* All products grid */}
        <ProductsGrid current={current} loading={loading} totalCount={generalList.length} page={page} setPage={setPage} totalPages={totalPages} />
      </div>
    </div>
  );
};

export default Home;