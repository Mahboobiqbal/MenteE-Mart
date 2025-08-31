// src/components/ProductCard.jsx
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import supabase from "../utils/supabase";

const emerald = "#008060";
const yellow = "#FFD700";
const white = "#FFFFFF";
const charcoal = "#333333";

const formatPrice = (p) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(Number(p || 0));

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

  const {
    id,
    slug,
    name,
    price,
    compareAtPrice,
    image,
    rating = 4.5,
    reviews = 0,
    category,
    inStock = true,
    isNew = false,
  } = product || {};

  const url = id ? `/product/${slug || id}` : "#";

  const handleProductClick = async () => {
    try {
      if (id) {
        await supabase.rpc("increment_product_clicks", { p_id: id, p_whatsapp: true });
      }
    } catch (e) {
      console.error("increment clicks failed", e);
    } finally {
      const message = `Hi! I'm interested in "${name}" (${formatPrice(price)}).`;
      const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "";
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }
  };

  // ProductDetail page already increments views on load, so just navigate here
  const handleViewDetails = () => {
    if (id) navigate(url);
  };

  return (
    <article
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
        <Link to={url} className="block" onClick={(e) => !id && e.preventDefault()}>
          <h3 className="line-clamp-2 text-base font-semibold" style={{ color: charcoal }}>
            {name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} filled={i + 0.5 < Number(rating)} />
          ))}
          <span className="ml-2 text-xs" style={{ color: `${charcoal}b3` }}>
            {Number(rating).toFixed(1)} • {reviews}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={handleViewDetails}
            className="px-3 h-9 rounded-lg text-sm font-semibold transition"
            style={{ backgroundColor: emerald, color: white }}
            disabled={!inStock}
          >
            View
          </button>
          <button
            onClick={handleProductClick}
            className="px-3 h-9 rounded-lg text-sm font-semibold transition"
            style={{ backgroundColor: emerald, color: white }}
            disabled={!inStock}
          >
            Buy on WhatsApp
          </button>
        </div>
      </div>

      <div
        className="h-1 w-0 group-hover:w-full transition-all duration-300"
        style={{ backgroundColor: emerald }}
      />
    </article>
  );
};

export default ProductCard;
