// src/components/ProductCard.jsx
import React from "react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

const emerald = "#008060";
const yellow = "#FFD700";
const white = "#FFFFFF";
const charcoal = "#333333";

const Star = ({ filled }) => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 20 20"
    fill={filled ? yellow : "none"}
    stroke={filled ? yellow : `${charcoal}99`}
    strokeWidth="1.2"
  >
    <path d="M10 1.8l2.47 5.01 5.53.8-4 3.9.95 5.51L10 14.8l-4.95 2.22.95-5.51-4-3.9 5.53-.8L10 1.8z" />
  </svg>
);

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleProductClick = async () => {
    try {
      const productRef = doc(db, "products", product.id);
      await updateDoc(productRef, {
        clicks: increment(1),
        views: increment(1)
      });
      // Open WhatsApp
      const message = `Hi! I'm interested in ${product.name} (₨${product.price.toLocaleString()})`;
      const whatsappUrl = `https://wa.me/923404430083?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error("Error updating product stats:", error);
    }
  };

  const handleViewDetails = async () => {
    try {
      const productRef = doc(db, "products", product.id);
      await updateDoc(productRef, {
        views: increment(1)
      });
      navigate(`/product/${product.id}`);
    } catch (error) {
      console.error("Error updating product views:", error);
      // Still navigate even if update fails
      navigate(`/product/${product.id}`);
    }
  };

  const {
    id,
    name,
    price,
    image,
    rating = 4.5,
    reviews = 0,
    category,
    inStock = true,
  } = product || {};

  return (
    <div
      className="group rounded-xl overflow-hidden transition border"
      style={{
        backgroundColor: white,
        borderColor: `${charcoal}1a`,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div className="relative">
        <img
          src={image}
          alt={name}
          className="w-full h-56 object-cover"
          loading="lazy"
        />
        {!inStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
            <span className="px-3 py-1.5 rounded-lg text-sm font-semibold" style={{ backgroundColor: `${charcoal}e6`, color: white }}>
              Out of stock
            </span>
          </div>
        )}
        {category && (
          <span
            className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-medium"
            style={{ backgroundColor: yellow, color: charcoal }}
          >
            {category}
          </span>
        )}
      </div>

      <div className="p-4">
        <Link to={`/product/${id}`} className="block">
          <h3 className="line-clamp-2 text-base font-semibold" style={{ color: charcoal }}>
            {name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} filled={i + 0.5 < rating} />
          ))}
          <span className="ml-2 text-xs" style={{ color: `${charcoal}b3` }}>
            {rating.toFixed(1)} • {reviews}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold" style={{ color: charcoal }}>
            ${Number(price).toFixed(2)}
          </span>

          <div className="flex items-center gap-2">
            <button
              className="px-3 h-9 rounded-lg text-sm font-semibold transition"
              style={{
                backgroundColor: emerald,
                color: white,
              }}
              disabled={!inStock}
            >
              Add to Cart
            </button>
            <button
              className="w-9 h-9 rounded-lg flex items-center justify-center transition border"
              aria-label="Wishlist"
              style={{
                backgroundColor: white,
                color: charcoal,
                borderColor: `${charcoal}26`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = emerald;
                e.currentTarget.style.color = emerald;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${charcoal}26`;
                e.currentTarget.style.color = charcoal;
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 21s-6.716-4.284-9.192-7.2C.667 10.773 2.01 7 5.455 7c2.025 0 3.148 1.133 3.94 2.243C10.187 8.133 11.31 7 13.334 7c3.445 0 4.788 3.773 2.647 6.8C18.716 16.716 12 21 12 21z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div
        className="h-1 w-0 group-hover:w-full transition-all duration-300"
        style={{ backgroundColor: emerald }}
      />
    </div>
  );
};

export default ProductCard;
