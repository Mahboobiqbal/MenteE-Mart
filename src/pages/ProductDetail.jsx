import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import supabase from "../utils/supabase";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import RecommendedProducts from "../components/RecommendedProducts";
import WriteReview from "../components/WriteReview";

const ProductDetail = () => {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const productId = id || slug;
  const imageRef = useRef(null);

  // State management
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [recommended, setRecommended] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [reviews, setReviews] = useState([]);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const parseReviewList = (raw) => {
    if (!raw) return [];

    const normalizeEntry = (entry, index) => {
      if (!entry) return null;
      const message =
        typeof entry.message === "string"
          ? entry.message.trim()
          : typeof entry.comment === "string"
          ? entry.comment.trim()
          : "";
      if (!message) return null;

      const authorRaw =
        typeof entry.author === "string"
          ? entry.author
          : typeof entry.user_name === "string"
          ? entry.user_name
          : "";

      const fallbackId = `${
        entry.created_at || entry.createdAt || "review"
      }-${index}`;

      return {
        id: entry.id || entry.review_id || fallbackId,
        author: authorRaw.trim() || "Anonymous",
        message,
        created_at:
          entry.created_at || entry.createdAt || new Date().toISOString(),
      };
    };

    if (Array.isArray(raw)) {
      return raw.map(normalizeEntry).filter(Boolean);
    }

    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed)
          ? parsed.map(normalizeEntry).filter(Boolean)
          : [];
      } catch (error) {
        console.warn("Failed to parse product reviews JSON:", error);
        return [];
      }
    }

    return [];
  };

  // Enhanced product fetch with better error handling
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const isUuid =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            productId
          );
        let query = supabase.from("products").select("*");

        query = isUuid
          ? query.eq("id", productId)
          : query.eq("slug", productId);

        const { data, error } = await query.single();
        if (error) throw error;
        if (!data) return navigate("/products", { replace: true });

        const parsedReviews = parseReviewList(data.review);
        const hydrated = {
          ...data,
          review: parsedReviews,
          reviews: parsedReviews.length ?? data.reviews ?? 0,
        };

        setProduct(hydrated);
        setReviews(parsedReviews);

        // Check wishlist status
        const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
        setIsWishlisted(wishlist.includes(data.id));

        // Track views
        await supabase.rpc("increment_product_views", { p_id: data.id });
        addToViewedHistory(data);
      } catch (err) {
        console.error("Failed to load product:", err);
        navigate("/products", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchProduct();
    else navigate("/products");
  }, [productId, navigate]);

  // Enhanced recommended products fetch
  useEffect(() => {
    const fetchRecommended = async () => {
      if (!product?.category || !product.id) return;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", product.category)
        .neq("id", product.id)
        .eq("in_stock", true)
        .order("rating", { ascending: false })
        .limit(6);

      if (error) console.error("Recommended fetch error:", error);
      else setRecommended(data || []);
    };
    fetchRecommended();
  }, [product]);

  const addToViewedHistory = (prod) => {
    const history = JSON.parse(localStorage.getItem("viewedProducts") || "[]");
    const filtered = history.filter((p) => p.id !== prod.id);
    localStorage.setItem(
      "viewedProducts",
      JSON.stringify([prod, ...filtered].slice(0, 10))
    );
  };

  const toggleWishlist = () => {
    const list = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const newWishlist = isWishlisted
      ? list.filter((id) => id !== product.id)
      : [...list, product.id];

    localStorage.setItem("wishlist", JSON.stringify(newWishlist));
    setIsWishlisted(!isWishlisted);
    window.dispatchEvent(new Event("wishlist-updated"));
  };

  const handleOrder = async () => {
    if (!product.in_stock) return;

    await supabase.rpc("increment_product_clicks", {
      p_id: product.id,
      p_whatsapp: true,
    });

    const price = product.sale_price ?? product.price;
    const message = `Hello! I'm interested in *${product.name}* (₨${Number(
      price * quantity
    ).toLocaleString()}) - Quantity: ${quantity}`;
    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/product/${
      product.slug || product.id
    }`;

    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out this amazing product: ${product.name}`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        // Show toast notification
        showToast("🔗 Link copied to clipboard!");
      });
    }
  };

  // Toast notification system
  const showToast = (message) => {
    const toast = document.createElement("div");
    toast.className =
      "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full";
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove("translate-x-full");
    }, 100);

    setTimeout(() => {
      toast.classList.add("translate-x-full");
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  const handleReviewCreated = (newReview) => {
    if (!newReview) return;

    setReviews((prev) => [newReview, ...prev]);
    setProduct((prev) => {
      if (!prev) return prev;
      const existing = Array.isArray(prev.review) ? prev.review : [];
      return {
        ...prev,
        review: [newReview, ...existing],
        reviews: (prev.reviews || existing.length || 0) + 1,
      };
    });
    showToast("Review submitted successfully!");
  };

  // Star Rating Component with animations
  const StarRating = ({
    rating,
    interactive = false,
    onRate,
    size = "text-lg",
  }) => {
    return (
      <motion.div
        className="flex items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            onClick={interactive ? () => onRate(star) : null}
            className={`${size} transition-all duration-200 hover:scale-110 ${
              interactive ? "cursor-pointer hover:drop-shadow-sm" : ""
            } ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
            whileHover={interactive ? { scale: 1.1 } : {}}
            whileTap={interactive ? { scale: 0.9 } : {}}
            disabled={!interactive}
          >
            ⭐
          </motion.button>
        ))}
      </motion.div>
    );
  };

  // Quantity Selector with modern styling
  const QuantitySelector = () => (
    <motion.div
      className="flex items-center gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <label className="text-sm font-medium text-gray-700 min-w-[80px]">
        Quantity:
      </label>
      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-1">
        <motion.button
          type="button"
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/30"
          whileTap={{ scale: 0.95 }}
          disabled={quantity <= 1}
        >
          −
        </motion.button>
        <span className="w-8 h-8 flex items-center justify-center font-semibold text-gray-800">
          {quantity}
        </span>
        <motion.button
          type="button"
          onClick={() => setQuantity(quantity + 1)}
          className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/30"
          whileTap={{ scale: 0.95 }}
        >
          +
        </motion.button>
      </div>
    </motion.div>
  );

  // Enhanced Image Gallery Component
  const ProductGallery = () => {
    const images = [
      product.image_url,
      ...(product.additional_images || []),
    ].filter(Boolean);

    return (
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Main Image with Zoom */}
        <div className="relative aspect-[4/3] bg-gray-50 rounded-2xl overflow-hidden shadow-lg group">
          <motion.img
            ref={imageRef}
            src={images[selectedImage]}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-300"
            onClick={() => setShowImageModal(true)}
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/600x450/F9FAFB/6B7280?text=No+Image";
            }}
          />

          {/* Sale Badge */}
          {product.sale_price && (
            <motion.div
              className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              Save{" "}
              {Math.round(
                (1 - product.sale_price / product.regular_price) * 100
              )}
              %
            </motion.div>
          )}

          {/* Quick Actions Overlay */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.button
              onClick={toggleWishlist}
              className={`p-2 rounded-full shadow-lg backdrop-blur-sm transition-colors ${
                isWishlisted
                  ? "bg-red-500 text-white"
                  : "bg-white/80 text-gray-700 hover:bg-white"
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ❤️
            </motion.button>
            <motion.button
              onClick={handleShare}
              className="p-2 rounded-full bg-white/80 text-gray-700 shadow-lg hover:bg-white backdrop-blur-sm transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              📤
            </motion.button>
          </div>
        </div>

        {/* Thumbnail Gallery */}
        {images.length > 1 && (
          <motion.div
            className="flex gap-3 overflow-x-auto pb-2 px-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {images.map((img, idx) => (
              <motion.button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`w-16 h-16 rounded-xl border-2 flex-shrink-0 transition-all duration-200 ${
                  selectedImage === idx
                    ? "border-purple-500 ring-2 ring-purple-200"
                    : "border-gray-200 hover:border-gray-400 hover:shadow-md"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src={img}
                  alt={`Thumb ${idx}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              </motion.button>
            ))}
          </motion.div>
        )}
      </motion.div>
    );
  };

  // Image Modal for full-screen viewing
  const ImageModal = () => {
    const images = [
      product.image_url,
      ...(product.additional_images || []),
    ].filter(Boolean);

    return (
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              className="relative max-w-4xl max-h-full"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 text-white text-2xl p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  if (loading) return <ProductSkeleton />;

  if (!product) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 px-6 text-center"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.img
          src="https://img.freepik.com/free-vector/page-found-concept-illustration_114360-1951.jpg"
          alt="Not Found"
          className="w-64 mb-6"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        />
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Product Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          We couldn't find the product you're looking for.
        </p>
        <motion.button
          onClick={() => navigate("/products")}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🛍️ Browse Products
        </motion.button>
      </motion.div>
    );
  }

  const images = [
    product.image_url,
    ...(product.additional_images || []),
  ].filter(Boolean);
  const finalPrice = product.sale_price ?? product.price;
  const savings = product.sale_price
    ? Math.round(
        ((product.regular_price - product.sale_price) / product.regular_price) *
          100
      )
    : 0;

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* SEO & Social Meta */}
      <title>{product.name} | MenteE Mart</title>
      <meta
        name="description"
        content={product.description?.substring(0, 160)}
      />
      <meta property="og:image" content={images[0]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Breadcrumb */}
        <motion.nav
          className="text-sm text-gray-500 mb-6 flex items-center gap-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.button
            onClick={() => navigate("/")}
            className="hover:text-purple-600 cursor-pointer transition-colors font-medium"
            whileHover={{ x: -2 }}
          >
            Home
          </motion.button>
          <span>→</span>
          <motion.button
            onClick={() => navigate("/products")}
            className="hover:text-purple-600 cursor-pointer transition-colors font-medium"
            whileHover={{ x: -2 }}
          >
            Products
          </motion.button>
          <span>→</span>
          <span className="text-gray-800 font-semibold">{product.name}</span>
        </motion.nav>

        {/* Main Product Section */}
        <div className="lg:flex gap-8 lg:gap-12 items-start mb-16">
          {/* Product Gallery */}
          <div className="lg:w-1/2">
            <ProductGallery />
          </div>

          {/* Enhanced Product Info */}
          <motion.div
            className="lg:w-1/2 mt-8 lg:mt-0 space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Category & Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold uppercase tracking-wide">
                {product.category}
              </span>
              {product.featured && (
                <motion.span
                  className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  ✨ Featured
                </motion.span>
              )}
            </div>

            {/* Product Title */}
            <motion.h1
              className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {product.name}
            </motion.h1>

            {/* Rating */}
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <StarRating rating={Math.round(product.rating || 0)} />
              <span className="text-gray-600 font-medium">
                {product.rating?.toFixed(1) || 0} ({product.reviews || 0}{" "}
                reviews)
              </span>
            </motion.div>

            {/* Enhanced Price Section */}
            <motion.div
              className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {product.sale_price ? (
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-purple-600">
                      ₨{Number(product.sale_price).toLocaleString()}
                    </span>
                    <span className="text-xl text-gray-500 line-through">
                      ₨{Number(product.regular_price).toLocaleString()}
                    </span>
                  </div>
                  <motion.div
                    className="inline-flex items-center bg-green-100 text-green-800 text-sm font-bold px-3 py-1 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    You save ₨
                    {Number(
                      (product.regular_price - product.sale_price) * quantity
                    ).toLocaleString()}{" "}
                    ({savings}%)
                  </motion.div>
                </div>
              ) : (
                <span className="text-4xl font-bold text-gray-900">
                  ₨{Number(finalPrice).toLocaleString()}
                </span>
              )}
              <p className="text-sm text-gray-600 mt-1">
                ✓ Inclusive of all taxes
              </p>
            </motion.div>

            {/* Stock Status */}
            <motion.div
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                product.in_stock
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div
                className={`w-2 h-2 rounded-full mr-2 ${
                  product.in_stock ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              ></div>
              {product.in_stock ? "✅ In Stock" : "❌ Out of Stock"}
            </motion.div>

            {/* Quantity Selector */}
            <QuantitySelector />

            {/* Total Price Display */}
            <motion.div
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">
                  Total:
                </span>
                <span className="text-2xl font-bold text-purple-600">
                  ₨{Number(finalPrice * quantity).toLocaleString()}
                </span>
              </div>
            </motion.div>

            {/* Enhanced Action Buttons */}
            <div className="space-y-4">
              <motion.button
                onClick={handleOrder}
                disabled={!product.in_stock}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all shadow-lg ${
                  product.in_stock
                    ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transform hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                whileHover={product.in_stock ? { scale: 1.02 } : {}}
                whileTap={product.in_stock ? { scale: 0.98 } : {}}
              >
                <span className="flex items-center justify-center gap-2">
                  💬 Order via WhatsApp
                  <span>₨{Number(finalPrice * quantity).toLocaleString()}</span>
                </span>
              </motion.button>

              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  onClick={toggleWishlist}
                  className={`py-3 border rounded-xl font-medium transition-all ${
                    isWishlisted
                      ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isWishlisted ? "❤️" : "🤍"} Wishlist
                </motion.button>

                <motion.button
                  onClick={handleShare}
                  className="py-3 border border-gray-200 rounded-xl bg-white text-gray-700 hover:bg-gray-50 transition font-medium"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  📤 Share
                </motion.button>
              </div>
            </div>

            {/* Product Benefits */}
            <motion.div
              className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                ✨ Why Choose This Product
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Premium quality ingredients",
                  "Dermatologist tested",
                  "Made in Pakistan",
                  "Cruelty-free",
                ].map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-center gap-2 text-sm text-gray-700"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1.2 + idx * 0.1 }}
                  >
                    <span className="text-green-500">✓</span>
                    {benefit}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Collaboration with Nainzaka Aesthetic */}
        <motion.section
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
        </motion.section>

        {/* Enhanced Tabs Section */}
        <motion.div
          className="mt-16 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {[
                { id: "description", label: "Description", icon: "📝" },
                { id: "reviews", label: "Reviews", icon: "⭐" },
                { id: "specifications", label: "Specifications", icon: "📊" },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === "description" && (
                <motion.div
                  key="description"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    skipHtml={false}
                    components={{
                      h1: ({ ...props }) => (
                        <h1
                          className="text-2xl font-bold text-purple-600 mt-6 mb-3"
                          {...props}
                        />
                      ),
                      h2: ({ ...props }) => (
                        <h2
                          className="text-xl font-semibold text-gray-800 mt-5 mb-2"
                          {...props}
                        />
                      ),
                      h3: ({ ...props }) => (
                        <h3
                          className="text-lg font-medium text-gray-700 mt-4 mb-2"
                          {...props}
                        />
                      ),
                      p: ({ ...props }) => (
                        <p
                          className="text-gray-700 leading-relaxed mb-3"
                          {...props}
                        />
                      ),
                      ul: ({ ...props }) => (
                        <ul
                          className="list-disc pl-6 text-gray-700 space-y-1 mb-3"
                          {...props}
                        />
                      ),
                      li: ({ ...props }) => (
                        <li className="text-gray-700" {...props} />
                      ),
                      strong: ({ ...props }) => (
                        <strong
                          className="text-purple-600 font-semibold"
                          {...props}
                        />
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 underline hover:text-purple-700 transition-colors"
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {product.description || "No description available."}
                  </ReactMarkdown>
                </motion.div>
              )}

              {activeTab === "reviews" && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Customer Reviews
                    </h3>
                    <motion.button
                      onClick={() => setShowWriteReview(true)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Write a Review
                    </motion.button>
                  </div>

                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review, idx) => (
                        <motion.div
                          key={review.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.4,
                            delay: Math.min(idx * 0.1, 0.4),
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-800">
                              {review.author || "Anonymous"}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(review.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-line">
                            {review.message}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      className="text-center py-12"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="text-6xl mb-4">⭐</div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        No reviews yet
                      </h4>
                      <p className="text-gray-600">
                        Be the first to share your thoughts about this product.
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {activeTab === "specifications" && (
                <motion.div
                  key="specifications"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      {[
                        { label: "Product ID", value: product.id },
                        { label: "Category", value: product.category },
                        { label: "Weight", value: "250g" },
                        { label: "Origin", value: "Made in Pakistan" },
                      ].map((spec, idx) => (
                        <motion.div
                          key={spec.label}
                          className="flex justify-between py-3 border-b border-gray-100"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: idx * 0.1 }}
                        >
                          <span className="font-medium text-gray-700">
                            {spec.label}
                          </span>
                          <span className="text-gray-600">{spec.value}</span>
                        </motion.div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      {[
                        { label: "Skin Type", value: "All Skin Types" },
                        { label: "Usage", value: "Daily Use" },
                        { label: "Shelf Life", value: "24 Months" },
                        { label: "Expiry Date", value: "See Packaging" },
                      ].map((spec, idx) => (
                        <motion.div
                          key={spec.label}
                          className="flex justify-between py-3 border-b border-gray-100"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: (idx + 4) * 0.1 }}
                        >
                          <span className="font-medium text-gray-700">
                            {spec.label}
                          </span>
                          <span className="text-gray-600">{spec.value}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Enhanced Recommended Products */}
        {recommended.length > 0 && (
          <motion.section
            className="mt-20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.3 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                You Might Also Love
              </h2>
              <p className="text-gray-600 text-lg">
                Discover more amazing products from our collection
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommended.map((rec, idx) => (
                <motion.div
                  key={rec.id}
                  onClick={() => navigate(`/product/${rec.slug || rec.id}`)}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-100 cursor-pointer group"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    <motion.img
                      src={rec.image_url}
                      alt={rec.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/300x300/F9FAFB/6B7280?text=No+Image";
                      }}
                    />
                    {rec.sale_price && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        SALE
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                      {rec.name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                      {rec.description}
                    </p>

                    <div className="flex items-center gap-2 mb-4">
                      <StarRating
                        rating={Math.round(rec.rating || 0)}
                        size="text-sm"
                      />
                      <span className="text-sm text-gray-600">
                        ({rec.reviews || 0})
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        {rec.sale_price ? (
                          <>
                            <span className="font-bold text-purple-600 text-lg">
                              ₨{Number(rec.sale_price).toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-500 line-through ml-2">
                              ₨
                              {Number(
                                rec.regular_price || rec.price
                              ).toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-gray-900 text-lg">
                            ₨{Number(rec.price || 0).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-purple-600 font-medium group-hover:underline">
                        View Details →
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Recently Viewed Section */}
        <motion.section
          className="mt-16 bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl p-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              Recently Viewed
            </h3>
            <motion.button
              onClick={() => {
                localStorage.removeItem("viewedProducts");
                showToast("History cleared!");
              }}
              className="text-sm text-gray-600 hover:text-gray-800 font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear History
            </motion.button>
          </div>
          <div className="text-center text-gray-600">
            <p className="text-lg">
              Keep browsing to see your recently viewed products here!
            </p>
          </div>
        </motion.section>
      </div>

      {/* Enhanced Image Modal */}
      <ImageModal />

      {/* Write Review Modal */}
      <AnimatePresence>
        {showWriteReview && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
            >
              <WriteReview
                productId={product?.id}
                productName={product?.name}
                onClose={() => setShowWriteReview(false)}
                onSuccess={(created) => {
                  handleReviewCreated(created);
                  setShowWriteReview(false);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Enhanced Skeleton Loader
const ProductSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 animate-pulse">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
      <div className="lg:flex gap-12 items-start">
        <div className="lg:w-1/2 space-y-4">
          <div className="aspect-[4/3] bg-gray-200 rounded-2xl"></div>
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-16 h-16 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
        <div className="lg:w-1/2 space-y-6 mt-8 lg:mt-0">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded w-3/4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-24 bg-gray-200 rounded w-full"></div>
          <div className="h-16 bg-gray-200 rounded w-full"></div>
          <div className="h-12 bg-gray-200 rounded w-full"></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ProductDetail;
