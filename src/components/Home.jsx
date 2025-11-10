// filepath: h:\Code\Nainzaka Aesthetics\src\components\Home.jsx
import React, { useEffect, useMemo, useState } from "react";
import HeroSection from "./HeroSection";
import Showcase from "./Showcase";
import QuickCategories from "./QuickCategories";
import PopularProducts from "./PopularProducts";
import FeaturedProducts from "./FeaturedProducts";
import TopSales from "./TopSales";
import { motion as Motion } from "framer-motion";
import TrendingProducts from "./TrendingProducts";
import NewArrivals from "./NewArrivals";
import ServiceMapMobile from "./ServiceMapMobile";
import { getCachedData, loadProducts } from "../utils/dataLoader";

const FEATURED_LIMIT = 6;
const white = "#FFFFFF";

const computeEngagementScore = (product) => {
  if (!product) return 0;
  const views = Number(product.view_count ?? product.views ?? 0);
  const clicks = Number(product.click_count ?? product.clicks ?? 0);
  const whatsapp = Number(product.whatsapp_clicks ?? 0);
  return views + clicks * 3 + whatsapp * 5;
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scIndex, setScIndex] = useState(0);

  // Load products from JSON files instead of database
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getCachedData("products", loadProducts);
        if (!mounted) return;

        setProducts(data || []);
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

  const featuredProducts = useMemo(
    () => products.filter((product) => Boolean(product?.featured)),
    [products]
  );

  const saleProducts = useMemo(() => {
    return products
      .filter((product) => {
        const regular = Number(product?.regular_price ?? product?.price ?? 0);
        const sale = Number(product?.sale_price ?? 0);
        return (sale > 0 && sale < regular) || Boolean(product?.sale_type);
      })
      .map((product) => ({
        ...product,
      }));
  }, [products]);

  const trendingProducts = useMemo(() => {
    if (!products.length) return [];

    const scored = products.map((product) => ({
      product,
      score: computeEngagementScore(product),
    }));

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, 6).map(({ product, score }, index) => ({
      ...product,
      engagementScore: score,
      isHot: index === 0 && score > 0,
    }));
  }, [products]);

  const showcaseProducts = useMemo(() => {
    const base = featuredProducts.length ? featuredProducts : trendingProducts;
    return base.slice(0, 4);
  }, [featuredProducts, trendingProducts]);

  const topSalesProducts = useMemo(() => {
    if (!products.length) return [];

    const ranked = products.map((product) => {
      const saleCount = Number(
        product.sales_count ??
          product.orders ??
          product.order_count ??
          product.whatsapp_clicks ??
          product.click_count ??
          product.clicks ??
          0
      );
      const rankingScore =
        saleCount > 0 ? saleCount : computeEngagementScore(product);

      return {
        ...product,
        saleCount,
        _score: rankingScore,
      };
    });

    ranked.sort((a, b) => b._score - a._score);

    return ranked.slice(0, 5).map((product, index) => {
      const { _score, ...rest } = product;
      return {
        ...rest,
        salesRank: index + 1,
      };
    });
  }, [products]);

  const newArrivals = useMemo(() => {
    if (!products.length) return [];

    return [...products]
      .sort(
        (a, b) =>
          new Date(b.created_at || b.updated_at || 0) -
          new Date(a.created_at || a.updated_at || 0)
      )
      .slice(0, 6)
      .map((product) => ({
        ...product,
        dateAdded: product.created_at || product.updated_at || null,
      }));
  }, [products]);

  const featuredDisplay = useMemo(() => {
    const source = featuredProducts.length ? featuredProducts : products;
    return source.slice(0, FEATURED_LIMIT);
  }, [featuredProducts, products]);

  useEffect(() => {
    if (showcaseProducts.length === 0) {
      setScIndex(0);
      return;
    }

    if (scIndex >= showcaseProducts.length) {
      setScIndex(0);
    }
  }, [scIndex, showcaseProducts]);

  return (
    <div className="w-full" style={{ backgroundColor: white }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section>
          <HeroSection />
        </section>

        {/* Quick Categories - Now loads from JSON */}
        <section className="mt-8">
          <QuickCategories />
        </section>

        {/* Showcase of featured or trending products */}
        <section className="mt-8">
          <Showcase
            showcase={showcaseProducts}
            topFallback={trendingProducts[0] || null}
            loadingTop={loading}
            scIndex={scIndex}
            setScIndex={setScIndex}
          />
        </section>

        {/* Top Sales */}
        <TopSales products={topSalesProducts} loading={loading} />

        {/* Trending Products */}
        <TrendingProducts products={trendingProducts} loading={loading} />

        {/* Popular Products */}
        <PopularProducts
          saleProducts={saleProducts}
          trendingProducts={trendingProducts}
          loading={loading}
        />

        {/* Featured Products */}
        <FeaturedProducts products={featuredDisplay} loading={loading} />

        {/* New Arrivals */}
        <NewArrivals products={newArrivals} loading={loading} />

        {/* Collaboration with Nainzaka Aesthetic */}
        <Motion.section
          className="mt-16 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          <div className="relative py-8 px-6">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 mr-4">
                <span className="text-2xl">🤝</span>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">
                  ✨ We are Collaborating with ✨
                </h3>
                <p className="text-white/90 text-lg font-medium">
                  Nainzaka Aesthetic - Premium Beauty & Wellness
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 ml-4">
                <span className="text-2xl">💄</span>
              </div>
            </div>

            {/* Infinite Scroll Animation */}
            <div className="relative overflow-hidden">
              <div className="flex animate-scroll whitespace-nowrap">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="flex items-center space-x-8 mx-4">
                    <div className="bg-white rounded-xl p-4 shadow-lg">
                      <img
                        src="/src/assets/nainzaka logo.jpg"
                        alt="Nainzaka Aesthetic Logo"
                        className="h-16 w-auto object-contain rounded-lg"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/200x80/FFFFFF/6B7280?text=Nainzaka+Aesthetic";
                        }}
                      />
                    </div>
                    <div className="text-white font-semibold text-lg">
                      Premium Quality Products
                    </div>
                    <div className="text-white/80">✨</div>
                    <div className="text-white font-semibold text-lg">
                      Expert Formulations
                    </div>
                    <div className="text-white/80">💎</div>
                    <div className="text-white font-semibold text-lg">
                      Beauty Redefined
                    </div>
                    <div className="text-white/80">🌟</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-6">
              <p className="text-white/90 text-sm">
                Discover our exclusive collection of premium beauty products in
                partnership with Nainzaka Aesthetic
              </p>
            </div>
          </div>
        </Motion.section>

        {/* Mobile-friendly Service Map */}
        <section>
          <ServiceMapMobile />
        </section>
      </div>
    </div>
  );
};

export default Home;
