import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Eye,
  ShoppingCart,
  Star,
  Zap,
  Tag,
  Package,
  Plus,
} from "lucide-react";
import supabase from "../utils/supabase";
import { useCart } from "../hooks/useCart";

const ProductCard = ({
  product,
  onQuickView,
  showQuickView = true,
  loading = false,
}) => {
  const navigate = useNavigate();
  const { addToCart, isInCart, openCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [showAddAnimation, setShowAddAnimation] = useState(false);
  const cardRef = useRef(null);

  // Product data extraction with defaults
  const {
    id,
    slug,
    name,
    price,
    sale_price,
    original_price,
    image,
    image_url,
    additional_images,
    rating = 4.5,
    reviews = 0,
    category,
    store, // NEW: Store information
    in_stock = true,
    featured = false,
    is_new = false,
    is_trending = false,
    description,
    click_count = 0,
    view_count = 0,
  } = product || {};

  const productImages = [
    image || image_url,
    ...(additional_images || []),
  ].filter(Boolean);

  const currentImage =
    productImages[currentImageIndex] ||
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center";

  // Wishlist management
  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setIsWishlisted(wishlist.includes(id));
  }, [id]);

  // Image cycling for multiple images
  useEffect(() => {
    if (productImages.length > 1 && isHovered) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isHovered, productImages.length]);

  // Click tracking
  const trackClick = async (type) => {
    try {
      await supabase.rpc("increment_product_clicks", {
        p_id: id,
        p_whatsapp: type === "whatsapp",
      });
    } catch (error) {
      console.error("Error tracking click:", error);
    }
  };

  // Wishlist toggle with animation
  const toggleWishlist = (e) => {
    e.stopPropagation();
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const newWishlist = isWishlisted
      ? wishlist.filter((productId) => productId !== id)
      : [...wishlist, id];

    localStorage.setItem("wishlist", JSON.stringify(newWishlist));
    setIsWishlisted(!isWishlisted);
    setShowLikeAnimation(true);
    setTimeout(() => setShowLikeAnimation(false), 600);

    // Notify other components
    window.dispatchEvent(new Event("wishlist-updated"));
  };

  // Quick view handler
  const handleQuickView = (e) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  // Product click handler
  const handleProductClick = () => {
    trackClick("view");
    navigate(`/product/${slug || id}`);
  };

  // Add to Cart handler
  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!in_stock) return;

    addToCart(product, 1);
    setShowAddAnimation(true);
    setTimeout(() => setShowAddAnimation(false), 1000);
    openCart(); // Open cart drawer to show the added item
  };



  // Price calculations
  const finalPrice = sale_price || price || 0;
  const originalPrice = original_price || price;
  const discount =
    sale_price && price ? Math.round(((price - sale_price) / price) * 100) : 0;

  // Loading skeleton component
  if (loading) {
    return (
      <div className="group bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-lg shadow-black/5 overflow-hidden animate-pulse">
        <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10"></div>
        </div>
        <div className="p-6 space-y-4">
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-3/4"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-1/2"></div>
          <div className="h-6 bg-gradient-to-r from-emerald-200 to-emerald-300 rounded-full w-2/3"></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
            <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article
      ref={cardRef}
      className="group relative bg-white/90 backdrop-blur-xl rounded-xl border border-white/30 shadow-md shadow-black/5 overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-black/10 hover:scale-[1.01] cursor-pointer"
      onClick={handleProductClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background gradient animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Image Section */}
      <div className="relative aspect-[2/3] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <img
          src={currentImage}
          alt={name}
          className={`w-full h-full object-cover transition-all duration-700 ${
            imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-110"
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          loading="lazy"
        />

        {/* Image loading placeholder */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse"></div>
        )}

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {discount > 0 && (
            <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-bounce">
              -{discount}%
            </span>
          )}
          {featured && (
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              ⭐ Featured
            </span>
          )}
          {is_new && (
            <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              New
            </span>
          )}
          {is_trending && (
            <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              🔥 Trending
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="absolute top-4 right-4 z-10">
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm ${
              in_stock
                ? "bg-green-100/80 text-green-800 border border-green-200/50"
                : "bg-red-100/80 text-red-800 border border-red-200/50"
            }`}
          >
            {in_stock ? (
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                In Stock
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                Out of Stock
              </div>
            )}
          </div>
        </div>

        {/* Category Badge */}
        {category && (
          <div className="absolute bottom-4 left-4 z-10">
            <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">
              {category}
            </span>
          </div>
        )}

        {/* Image indicators for multiple images */}
        {productImages.length > 1 && (
          <div className="absolute bottom-4 right-4 flex gap-1 z-10">
            {productImages.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentImageIndex
                    ? "bg-white/80 scale-125"
                    : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}

        {/* Action Buttons Overlay */}
        <div
          className={`absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center gap-3 transition-all duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          {showQuickView && onQuickView && (
            <button
              onClick={handleQuickView}
              className="bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-xl font-semibold hover:bg-white transition-all transform hover:scale-105 shadow-lg"
            >
              <Eye className="w-4 h-4 inline mr-2" />
              Quick View
            </button>
          )}

          <button
            onClick={toggleWishlist}
            className={`p-3 rounded-full transition-all transform hover:scale-110 ${
              isWishlisted
                ? "bg-red-500 text-white"
                : "bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white"
            }`}
          >
            <Heart
              className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""} ${
                showLikeAnimation ? "animate-pulse" : ""
              }`}
            />
          </button>
        </div>

        {/* Click statistics (visible on hover) */}
        {isHovered && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 text-xs text-white/80">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {view_count || 0}
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {click_count || 0}
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-3 space-y-1.5 relative z-10">
        {/* Product Name */}
        <h3 className="font-bold text-gray-900 line-clamp-1 text-xs leading-tight group-hover:text-emerald-700 transition-colors">
          {name}
        </h3>

        {/* Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(rating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {Number(rating).toFixed(1)} ({reviews})
            </span>
          </div>

          {/* Quick stats */}
          <div className="text-xs text-gray-400">
            {reviews > 50 && "🔥 Popular"}
          </div>
        </div>

        {/* Price */}
        <div className="space-y-2">
          {sale_price ? (
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                ₨{Number(finalPrice).toLocaleString()}
              </span>
              <span className="text-lg text-gray-400 line-through">
                ₨{Number(originalPrice).toLocaleString()}
              </span>
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                Save {discount}%
              </span>
            </div>
          ) : (
            <span className="text-2xl font-bold text-gray-900">
              ₨{Number(finalPrice).toLocaleString()}
            </span>
          )}

          {/* EMI suggestion for expensive items */}
          {finalPrice > 10000 && (
            <div className="text-xs text-emerald-600 font-medium">
              💳 Or from ₨{Math.round(finalPrice / 12).toLocaleString()}/month
            </div>
          )}
        </div>

        {/* Description Preview */}
        {description && (
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-2 pt-1">
          <button
            onClick={handleAddToCart}
            disabled={!in_stock}
            className={`py-1.5 px-2.5 rounded-md text-xs font-medium transition-all transform hover:scale-[1.02] ${
              in_stock
                ? `bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg ${
                    showAddAnimation ? "animate-bounce" : ""
                  }`
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Plus className="w-3 h-3 inline mr-1.5" />
            {showAddAnimation ? "Added!" : "Add to Cart"}
          </button>

          <button
            onClick={handleProductClick}
            className="py-1.5 px-2.5 border border-emerald-600 text-emerald-600 rounded-md text-xs font-medium hover:bg-emerald-600 hover:text-white transition-all transform hover:scale-[1.02]"
          >
            <Tag className="w-3 h-3 inline mr-1.5" />
            Details
          </button>
        </div>
      </div>

      {/* Hover effect border */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </article>
  );
};

export default ProductCard;
