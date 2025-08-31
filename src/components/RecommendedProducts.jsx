import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabase";

const RecommendedProducts = ({ 
  title = "Recommended For You", 
  subtitle = "Based on your interests", 
  category = null, 
  excludeId = null, 
  limit = 4,
  showViewed = false // Set to true to show recently viewed
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let query = supabase.from("products").select("*").eq("in_stock", true);

        if (showViewed) {
          // Show recently viewed from localStorage
          const viewed = JSON.parse(localStorage.getItem("viewedProducts") || "[]");
          const viewedIds = viewed.map(p => p.id);
          if (viewedIds.length === 0) {
            setProducts([]);
            setLoading(false);
            return;
          }
          query = query.in("id", viewedIds.slice(0, limit));
        } else {
          // Show by category or general popular
          if (category) {
            query = query.eq("category", category);
          }
          if (excludeId) {
            query = query.neq("id", excludeId);
          }
          query = query.limit(limit);
        }

        const { data, error } = await query;
        if (error) throw error;

        // If showing viewed, maintain order from localStorage
        if (showViewed) {
          const viewed = JSON.parse(localStorage.getItem("viewedProducts") || "[]");
          const ordered = viewed
            .filter(v => data.some(d => d.id === v.id))
            .map(v => data.find(d => d.id === v.id))
            .filter(Boolean);
          setProducts(ordered);
        } else {
          setProducts(data || []);
        }
      } catch (err) {
        console.error("Error fetching recommended products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, excludeId, limit, showViewed]);

  if (loading) {
    return (
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
            <p className="text-gray-600 mt-2">{subtitle}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null; // Or show a subtle message
  }

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-lg text-gray-600 mt-3">{subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/product/${product.slug || product.id}`)}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 cursor-pointer transform hover:-translate-y-1"
            >
              <div className="relative aspect-square bg-gray-100">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x300/F3F4F6/9CA3AF?text=No+Image";
                  }}
                />
                {product.sale_price && (
                  <div className="absolute top-3 left-3 bg-[#660033] text-white text-xs font-bold px-2 py-1 rounded-full">
                    SALE
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-[#660033] transition-colors">
                  {product.name}
                </h3>
                <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description?.substring(0, 60)}...</p>

                <div className="flex items-center justify-between">
                  <div>
                    {product.sale_price ? (
                      <>
                        <span className="font-bold text-[#660033]">
                          ₨{Number(product.sale_price).toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500 line-through ml-1">
                          ₨{Number(product.regular_price || product.price).toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <span className="font-bold text-gray-900">
                        ₨{Number(product.price || 0).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-[#660033] font-medium">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecommendedProducts;