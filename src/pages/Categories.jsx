import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import supabase from "../utils/supabase";

const emerald = "#008060";
const yellow = "#FFD700";
const charcoal = "#333333";

const CategoryCard = ({ category, productCount }) => (
  <div className="bg-white rounded-2xl shadow-sm border hover:shadow-lg transition-all duration-300 overflow-hidden group">
    <div className="aspect-w-16 aspect-h-10 bg-gradient-to-br from-[#F0FFF6] to-[#E8F8F3] relative">
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300"
          style={{ background: emerald }}
        >
          <svg
            className="w-10 h-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
      </div>
    </div>

    <div className="p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-bold" style={{ color: charcoal }}>
          {category.name}
        </h3>
        <span
          className="px-3 py-1 rounded-full text-sm font-medium text-white"
          style={{ background: emerald }}
        >
          {productCount || 0}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {category.description ||
          `Discover our ${category.name.toLowerCase()} collection`}
      </p>

      <Link
        to={`/products?category=${encodeURIComponent(category.name)}`}
        className="inline-flex items-center justify-center w-full px-4 py-2 rounded-lg font-medium transition-colors duration-300"
        style={{
          background: emerald,
          color: "#fff",
          border: "none",
        }}
      >
        <span>Browse {category.name}</span>
        <svg
          className="w-4 h-4 ml-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Link>
    </div>
  </div>
);

const StatCard = ({ icon, value, label }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
      style={{ background: emerald }}
    >
      {icon}
    </div>
    <div className="text-2xl font-bold" style={{ color: emerald }}>
      {value}
    </div>
    <div className="text-gray-600 text-sm">{label}</div>
  </div>
);

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCategories: 0,
    totalProducts: 0,
    featuredCategories: 0,
  });

  useEffect(() => {
    let mounted = true;

    const fetchCategories = async () => {
      setLoading(true);
      try {
        // First, try to get categories from categories table
        let { data: categoryData, error: categoryError } = await supabase
          .from("categories")
          .select("*")
          .order("name");

        // If categories table doesn't exist or has no data, use fallback categories
        if (categoryError || !categoryData || categoryData.length === 0) {
          categoryData = [
            {
              id: 1,
              name: "Electronics",
              description:
                "Latest gadgets, devices, and electronic accessories",
            },
            {
              id: 2,
              name: "Fashion",
              description: "Trendy clothing, shoes, and fashion accessories",
            },
            {
              id: 3,
              name: "Home & Living",
              description: "Furniture, decor, and household essentials",
            },
            {
              id: 4,
              name: "Beauty & Health",
              description: "Personal care, cosmetics, and wellness products",
            },
            {
              id: 5,
              name: "Sports & Fitness",
              description: "Athletic wear, equipment, and fitness gear",
            },
            {
              id: 6,
              name: "Books & Stationery",
              description: "Books, notebooks, and office supplies",
            },
            {
              id: 7,
              name: "Toys & Games",
              description: "Educational toys, games, and entertainment",
            },
            {
              id: 8,
              name: "Automotive",
              description: "Car accessories, tools, and automotive supplies",
            },
          ];
        }

        // Get product counts for each category
        const categoriesWithCounts = await Promise.all(
          categoryData.map(async (category) => {
            try {
              const { count } = await supabase
                .from("products")
                .select("*", { count: "exact", head: true })
                .or(
                  `category.ilike.%${category.name}%,categories.ilike.%${category.name}%`
                );

              return {
                ...category,
                productCount: count || 0,
              };
            } catch (err) {
              console.warn(
                `Failed to get count for category ${category.name}:`,
                err
              );
              return {
                ...category,
                productCount: 0,
              };
            }
          })
        );

        // Get overall stats
        try {
          const { count: totalProducts } = await supabase
            .from("products")
            .select("*", { count: "exact", head: true });

          if (mounted) {
            setStats({
              totalCategories: categoriesWithCounts.length,
              totalProducts: totalProducts || 0,
              featuredCategories: categoriesWithCounts.filter(
                (cat) => (cat.productCount || 0) > 5
              ).length,
            });
          }
        } catch (err) {
          console.warn("Failed to get product stats:", err);
        }

        if (mounted) {
          setCategories(categoriesWithCounts);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
        if (mounted) {
          setError(err.message || "Failed to load categories");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAFAFA] to-[#F0FFF6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[#008060] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAFAFA] to-[#F0FFF6] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 rounded-lg font-medium"
            style={{ background: emerald, color: "#fff" }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAFA] to-[#F0FFF6]">
      {/* Hero Section */}
      <section className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-4 mb-6">
              <img
                src={logo}
                alt="MenteE Mart Logo"
                className="w-16 h-16 rounded-lg shadow-md"
              />
              <div>
                <h1
                  className="text-4xl md:text-5xl font-extrabold"
                  style={{ color: charcoal }}
                >
                  Shop by Category
                </h1>
                <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
                  Explore our carefully curated product categories and find
                  exactly what you're looking for
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <StatCard
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14-7H3a2 2 0 00-2 2v14a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2z"
                  />
                </svg>
              }
              value={stats.totalCategories}
              label="Categories"
            />
            <StatCard
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              }
              value={stats.totalProducts}
              label="Products"
            />
            <StatCard
              icon={
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              }
              value={stats.featuredCategories}
              label="Featured"
            />
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold" style={{ color: charcoal }}>
            Browse All Categories
          </h2>
          <p className="text-gray-600 mt-2">
            Find products organized by their categories for easier shopping
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Categories Available
            </h3>
            <p className="text-gray-600">
              Check back later for our latest product categories.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                productCount={category.productCount}
              />
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#E8F8F3] to-[#F0FFF6] py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ color: charcoal }}>
            Can't find what you're looking for?
          </h2>
          <p className="text-gray-600 mb-8">
            Browse our complete product catalog or search for specific items
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 ease-in-out"
              style={{ background: yellow, color: charcoal }}
            >
              Browse All Products
            </Link>
            <Link
              to="/#"
              className="inline-flex items-center justify-center px-8 py-3 border-2 rounded-full font-semibold hover:bg-white transition duration-300 ease-in-out"
              style={{
                borderColor: emerald,
                color: emerald,
                background: "transparent",
              }}
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Categories;
