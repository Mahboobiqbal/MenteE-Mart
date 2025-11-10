// filepath: h:\Code\Nainzaka Aesthetics\src\components\Home.jsx
import React, { useEffect, useState } from "react";
import supabase from "../utils/supabase";
import HeroSection from "./HeroSection";
import Showcase from "./Showcase";
import QuickCategories from "./QuickCategories";
import PopularProducts from "./PopularProducts";
import FeaturedProducts from "./FeaturedProducts";
import ServiceMapMobile from "./ServiceMapMobile";

const PAGE_SIZE = 12;
const white = "#FFFFFF";

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

  // current products for featured section
  const [current, setCurrent] = useState([]);

  const [saleProducts, setSaleProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);

  // showcase
  const [showcase, setShowcase] = useState([]);
  const [scIndex, setScIndex] = useState(0);
  const [topFallback, setTopFallback] = useState(null);

  // Single fetch + normalize
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        if (!mounted) return;
        const normalized = (data || []).map(normalize);
        setProducts(normalized);

        // derived lists
        setSaleProducts(normalized.filter((p) => p.sale_price || p.sale_type));
        setTrendingProducts(
          normalized.filter((p) => p.featured || (p.views || 0) > 50)
        );

        // Set first 12 products for featured section
        setCurrent(normalized.slice(0, PAGE_SIZE));
      } catch (e) {
        console.error("Failed to load products:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Build showcase from already-fetched products (no extra DB calls)
  useEffect(() => {
    if (!products || products.length === 0) {
      setShowcase([]);
      setTopFallback(null);
      return;
    }

    // Top viewed product
    const sortedByViews = [...products].sort(
      (a, b) => (b.views || 0) - (a.views || 0)
    );
    const top = sortedByViews[0] ?? null;

    // specials: featured or sale_type
    const specials = products
      .filter((p) => p.featured || p.sale_type)
      .slice(0, 2);

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

  // Ensure showcase index resets when slides change
  useEffect(() => {
    setScIndex(0);
  }, [showcase.length]);

  return (
    <div className="w-full" style={{ backgroundColor: white }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section>
          <HeroSection />
        </section>

        {/* NEW: Quick Categories */}
        <section className="mt-8">
          <QuickCategories />
        </section>

        {/* Showcase / top-viewed / specials */}
        <section className="mt-8">
          <Showcase
            showcase={showcase}
            topFallback={topFallback}
            scIndex={scIndex}
            setScIndex={setScIndex}
          />
        </section>

        {/* IMPROVED: Popular Products (Deals + Trending combined) */}
        <PopularProducts
          saleProducts={saleProducts}
          trendingProducts={trendingProducts}
          loading={loading}
        />

        {/* IMPROVED: Featured Products (reduced from full grid) */}
        <FeaturedProducts current={current} loading={loading} />

        {/* IMPROVED: Mobile-friendly Service Map */}
        <section>
          <ServiceMapMobile />
        </section>
      </div>
    </div>
  );
};

export default Home;
