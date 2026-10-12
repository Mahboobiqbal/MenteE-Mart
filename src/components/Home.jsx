import React, { useEffect, useMemo, useState } from "react";
import HeroCarousel from "./HeroCarousel";
import TrustBadges from "./TrustBadges";
import FlashSale from "./FlashSale";
import Testimonials from "./Testimonials";
import Showcase from "./Showcase";
import QuickCategories from "./QuickCategories";
import PopularProducts from "./PopularProducts";
import FeaturedProducts from "./FeaturedProducts";
import TopSales from "./TopSales";
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
        {/* Hero Carousel */}
        <section>
          <HeroCarousel />
        </section>

        {/* Trust Badges */}
        <section className="mt-8">
          <TrustBadges />
        </section>

        {/* Quick Categories */}
        <section className="mt-8">
          <QuickCategories />
        </section>

        {/* Flash Sale */}
        <FlashSale products={saleProducts} loading={loading} />

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

        {/* Testimonials */}
        <Testimonials />

        {/* Mobile-friendly Service Map */}
        <section className="mt-12">
          <ServiceMapMobile />
        </section>
      </div>
    </div>
  );
};

export default Home;
