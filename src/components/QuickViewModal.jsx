import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";

const QuickViewModal = ({ product, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [recentReviews, setRecentReviews] = useState([]);

  // Check if product is in wishlist
  useEffect(() => {
    if (product && isOpen) {
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setIsWishlisted(wishlist.includes(product.id));

      // Fetch recent reviews for this product
      fetchRecentReviews();
    }
  }, [product, isOpen]);

  const fetchRecentReviews = async () => {
    if (!product?.id) return;

    try {
      const { data, error } = await supabase
        .from("product_reviews")
        .select("rating, comment, user_name, created_at")
        .eq("product_id", product.id)
        .order("created_at", { ascending: false })
        .limit(2);

      if (!error && data) {
        setRecentReviews(data);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const images = [product?.image_url, product?.additional_images]
    .flat()
    .filter(Boolean);

  const finalPrice = product?.sale_price || product?.price || 0;
  const originalPrice = product?.sale_price ? product?.price : null;
  const savings = product?.sale_price
    ? (((product.price - product.sale_price) / product.price) * 100).toFixed(0)
    : 0;

  const toggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const newWishlist = isWishlisted
      ? wishlist.filter((id) => id !== product.id)
      : [...wishlist, product.id];

    localStorage.setItem("wishlist", JSON.stringify(newWishlist));
    setIsWishlisted(!isWishlisted);

    // Notify other components
    window.dispatchEvent(new Event("wishlist-updated"));
  };

  const handleWhatsAppOrder = () => {
    if (!product?.in_stock) return;

    const price = finalPrice * quantity;
    const message = `Hello! I'm interested in *${
      product.name
    }* (₨${price.toLocaleString()}) - Quantity: ${quantity}`;
    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleViewDetails = () => {
    onClose();
    navigate(`/product/${product.slug || product.id}`);
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Quick View</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row max-h-[calc(90vh-120px)]">
          {/* Image Section */}
          <div className="lg:w-1/2 p-6">
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-contain"
                  onError={(e) =>
                    (e.target.src =
                      "https://via.placeholder.com/600x600/F9FAFB/6B7280?text=No+Image")
                  }
                />

                {/* Sale Badge */}
                {product.sale_price && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                    Save {savings}%
                  </div>
                )}

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
              </div>

              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-16 h-16 rounded-lg border-2 flex-shrink-0 transition-all ${
                        selectedImage === index
                          ? "border-[#008060]"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Info Section */}
          <div className="lg:w-1/2 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Category & Brand */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#008060]/10 text-[#008060] px-3 py-1 rounded-full text-sm font-medium">
                  {product.category}
                </span>
                {product.featured && (
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    ⭐ Featured
                  </span>
                )}
              </div>

              {/* Product Name */}
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-lg ${
                        star <= Math.round(product.rating || 0)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {(product.rating || 0).toFixed(1)} ({product.reviews || 0}{" "}
                  reviews)
                </span>
              </div>

              {/* Price */}
              <div className="space-y-2">
                {product.sale_price ? (
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-[#008060]">
                      ₨{Number(finalPrice).toLocaleString()}
                    </span>
                    <span className="text-xl text-gray-500 line-through">
                      ₨{Number(originalPrice).toLocaleString()}
                    </span>
                    <span className="bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full">
                      Save {savings}%
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">
                    ₨{Number(finalPrice).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed">
                {product.description || "No description available."}
              </p>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">
                  Quantity:
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:border-[#008060] transition-colors"
                  >
                    −
                  </button>
                  <span className="w-12 h-8 border border-gray-300 rounded-lg flex items-center justify-center font-semibold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:border-[#008060] transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total Price */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-[#008060]">
                    ₨{(finalPrice * quantity).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleWhatsAppOrder}
                  disabled={!product.in_stock}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    product.in_stock
                      ? "bg-green-600 hover:bg-green-700 text-white shadow-lg"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  💬 Order via WhatsApp
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={toggleWishlist}
                    className={`py-2 border rounded-lg font-medium transition-all ${
                      isWishlisted
                        ? "bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {isWishlisted ? "❤️ Wishlisted" : "🤍 Wishlist"}
                  </button>
                  <button
                    onClick={handleViewDetails}
                    className="py-2 border border-[#008060] text-[#008060] rounded-lg font-medium hover:bg-[#008060]/10 transition-all"
                  >
                    View Details
                  </button>
                </div>
              </div>

              {/* Recent Reviews Preview */}
              {recentReviews.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Recent Reviews
                  </h3>
                  <div className="space-y-3">
                    {recentReviews.map((review, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`text-sm ${
                                  star <= review.rating
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              >
                                ⭐
                              </span>
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            {review.user_name}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
