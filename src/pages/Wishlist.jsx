import React, { useEffect, useState } from "react";
import supabase from "../utils/supabase";
import ProductCard from "../components/ProductCard";
import { Link, useNavigate } from "react-router-dom";

const Wishlist = () => {
  const [items, setItems] = useState([]); // raw product rows
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const ids = JSON.parse(localStorage.getItem("wishlist") || "[]");
      if (!ids || ids.length === 0) {
        setItems([]);
        return;
      }
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .in("id", ids);
      if (error) throw error;
      // map to shape ProductCard expects
      const mapped = (data || []).map(p => ({
        id: p.id,
        slug: p.slug,
        name: p.name ?? p.title,
        image: p.image_url ?? p.image,
        price: p.sale_price ?? p.price,
        sale_price: p.sale_price ?? null,
        regular_price: p.regular_price ?? null,
        rating: p.rating ?? 0,
        reviews: p.reviews ?? 0,
        category: p.category,
        inStock: typeof p.in_stock === "boolean" ? p.in_stock : true,
      }));
      setItems(mapped);
    } catch (e) {
      console.error("Wishlist load error:", e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
    const onUpdate = () => loadWishlist();
    window.addEventListener("storage", onUpdate);
    window.addEventListener("wishlist-updated", onUpdate);
    return () => {
      window.removeEventListener("storage", onUpdate);
      window.removeEventListener("wishlist-updated", onUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeItem = (id) => {
    const list = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const updated = list.filter((x) => x !== id);
    localStorage.setItem("wishlist", JSON.stringify(updated));
    window.dispatchEvent(new Event("wishlist-updated"));
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const clearAll = () => {
    localStorage.removeItem("wishlist");
    window.dispatchEvent(new Event("wishlist-updated"));
    setItems([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "#333" }}>Your Wishlist</h1>
          <p className="text-sm text-gray-600">Items you saved for later</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/products")} className="px-4 py-2 rounded-lg bg-[#008060] text-white">Continue Shopping</button>
          <button onClick={clearAll} className="px-4 py-2 rounded-lg border" disabled={items.length === 0}>Clear All</button>
        </div>
      </div>

      <div>
        {loading ? (
          <div className="text-gray-600">Loading wishlist…</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <p className="mb-4">Your wishlist is empty.</p>
            <Link to="/products" className="px-5 py-3 rounded-lg bg-[#008060] text-white">Browse products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((p) => (
              <div key={p.id} className="relative">
                <ProductCard product={p} />
                <button
                  onClick={() => removeItem(p.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white shadow hover:scale-105 transition"
                  aria-label="Remove from wishlist"
                >
                  ❤️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;