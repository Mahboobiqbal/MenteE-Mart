import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const emerald = "#008060";
const yellow = "#FFD700";
const white = "#FFFFFF";

const EnhancedProductCard = ({
  product,
  onQuickView,
  showQuickView = true,
  showCompare = false,
  onCompare = null,
}) => {
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Check if product is in wishlist
  React.useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setIsWishlisted(wishlist.includes(product.id));
  }, [product.id]);

  const toggleWishlist = (e) => {
    e.stopPropagation();
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const newWishlist = isWishlisted
      ? wishlist.filter((id) => id !== product.id)
      : [...wishlist, product.id];

    localStorage.setItem("wishlist", JSON.stringify(newWishlist));
    setIsWishlisted(!isWishlisted);

    // Notify other components
    window.dispatchEvent(new Event("wishlist-updated"));
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const handleCompare = (e) => {
    e.stopPropagation();
    if (onCompare) {
      onCompare(product);
    }
  };

  const handleProductClick = () => {
    navigate(`/product/${product.slug || product.id}`);
  };

  const handleWhatsAppOrder = (e) => {
    e.stopPropagation();
    if (!product.in_stock) return;

    const finalPrice = product.sale_price || product.price || 0;
    const message = `Hello! I'm interested in *${
      product.name
    }* (₨${finalPrice.toLocaleString()})`;
    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const finalPrice = product.sale_price || product.price || 0;
  const originalPrice = product.sale_price ? product.price : null;
  const savings = product.sale_price
    ? (((product.price - product.sale_price) / product.price) * 100).toFixed(0)
    : 0;

  return (
    <div
      className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={handleProductClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <img
          src={
            product.image ||
            "https://via.placeholder.com/400x400/F9FAFB/6B7280?text=No+Image"
          }
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.src =
              "https://via.placeholder.com/400x400/F9FAFB/6B7280?text=No+Image";
          }}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.sale_price && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{savings}%
            </span>
          )}
          {product.featured && (
            <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              ⭐ Featured
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div
          className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${
            product.in_stock
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {product.in_stock ? "✅ In Stock" : "❌ Out of Stock"}
        </div>

        {/* Action Buttons Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex gap-3">
              {showQuickView && (
                <button
                  onClick={handleQuickView}
                  className="px-4 py-2 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                >
                  👁️ Quick View
                </button>
              )}

              {showCompare && onCompare && (
                <button
                  onClick={handleCompare}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
                >
                  ⚖️ Compare
                </button>
              )}
            </div>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={toggleWishlist}
          className={`absolute bottom-3 right-3 p-2 rounded-full transition-all ${
            isWishlisted
              ? "bg-red-500 text-white"
              : "bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill={isWishlisted ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <div className="text-xs text-gray-500 font-medium">
          {product.category}
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-sm ${
                  star <= Math.round(product.rating || 0)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
              >
                ⭐
              </span>
            ))}
          </div>
          <span className="text-xs text-gray-500">
            {product.reviews || 0} reviews
          </span>
        </div>

        {/* Price */}
        <div className="space-y-1">
          {product.sale_price ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-emerald-600">
                ₨{Number(finalPrice).toLocaleString()}
              </span>
              <span className="text-sm text-gray-500 line-through">
                ₨{Number(originalPrice).toLocaleString()}
              </span>
            </div>
          ) : (
            <span className="text-lg font-bold text-gray-900">
              ₨{Number(finalPrice).toLocaleString()}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={handleWhatsAppOrder}
            disabled={!product.in_stock}
            className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
              product.in_stock
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            💬 Order
          </button>

          <button
            onClick={handleProductClick}
            className="py-2 px-3 border border-emerald-600 text-emerald-600 rounded-lg text-sm font-semibold hover:bg-emerald-600 hover:text-white transition-all"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductCard;
