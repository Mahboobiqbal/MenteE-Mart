import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../utils/supabase";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DOMPurify from "dompurify";
import RecommendedProducts from "../components/RecommendedProducts";
const emerald = "#008060";
const yellow = "#FFD700";
const white = "#FFFFFF";
const charcoal = "#333333";

const ProductDetail = () => {
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const productId = id || slug;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [recommended, setRecommended] = useState([]);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    average: 0,
    total: 0,
    distribution: [0, 0, 0, 0, 0]
  });

  // Enhanced product fetch
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
        let query = supabase.from("products").select(`
          *,
          product_reviews (
            id,
            rating,
            comment,
            user_name,
            created_at,
            helpful_count
          )
        `);

        query = isUuid ? query.eq("id", productId) : query.eq("slug", productId);

        const { data, error } = await query.single();
        if (error) throw error;
        if (!data) return navigate("/products", { replace: true });

        setProduct(data);
        setIsWishlisted(JSON.parse(localStorage.getItem("wishlist") || "[]").includes(data.id));

        // Process reviews
        const productReviews = data.product_reviews || [];
        setReviews(productReviews);
        
        if (productReviews.length > 0) {
          const avg = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
          const dist = [5,4,3,2,1].map(rating => 
            productReviews.filter(r => r.rating === rating).length
          ).reverse();
          setReviewStats({
            average: avg,
            total: productReviews.length,
            distribution: dist
          });
        }

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
    localStorage.setItem("viewedProducts", JSON.stringify([prod, ...filtered].slice(0, 10)));
  };

  const toggleWishlist = () => {
    const list = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const newWishlist = isWishlisted
      ? list.filter((id) => id !== product.id)
      : [...list, product.id];
    localStorage.setItem("wishlist", JSON.stringify(newWishlist));
    setIsWishlisted(!isWishlisted);
  };

  const handleOrder = async () => {
    if (!product.in_stock) return;
    await supabase.rpc("increment_product_clicks", { p_id: product.id, p_whatsapp: true });
    const price = product.sale_price ?? product.price;
    const message = `Hello! I'm interested in *${product.name}* (₨${Number(price * quantity).toLocaleString()}) - Quantity: ${quantity}`;
    const url = `https://wa.me/923404430083?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/product/${product.slug || product.id}`;
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out this amazing product: ${product.name}`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl).then(() =>
        alert("🔗 Link copied to clipboard!")
      );
    }
  };

  const StarRating = ({ rating, interactive = false, onRate }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={interactive ? () => onRate(star) : null}
            className={`text-lg ${interactive ? 'cursor-pointer hover:scale-110 transition' : ''}`}
          >
            {star <= rating ? '⭐' : '☆'}
          </button>
        ))}
      </div>
    );
  };

  if (loading) return <ProductSkeleton />;

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-pink-50 px-6 text-center">
        <img src="https://img.freepik.com/free-vector/page-found-concept-illustration_114360-1951.jpg" alt="Not Found" className="w-64 mb-6" />
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Product Not Found</h2>
        <p className="text-gray-600 mb-6">We couldn't find the product you're looking for.</p>
        <button
          onClick={() => navigate("/products")}
          className="bg-[#660033] hover:bg-[#4A0025] text-white px-8 py-3 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg"
        >
          🛍️ Browse Products
        </button>
      </div>
    );
  }

  const images = [product.image_url, ...(product.additional_images || [])].filter(Boolean);
  const finalPrice = product.sale_price ?? product.price;
  const savings = product.sale_price ? ((product.regular_price - product.sale_price) / product.regular_price * 100).toFixed(0) : 0;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* SEO & Social */}
      <title>{product.name} | MenteE Mart</title>
      <meta name="description" content={product.description?.substring(0, 160)} />
      <meta property="og:image" content={images[0]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Enhanced Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <button onClick={() => navigate("/")} className="hover:text-[#660033] cursor-pointer transition">Home</button>
          <span>/</span>
          <button onClick={() => navigate("/products")} className="hover:text-[#660033] cursor-pointer transition">Products</button>
          <span>/</span>
          <span className="text-gray-800 font-medium">{product.name}</span>
        </nav>

        {/* Main Product Section */}
        <div className="lg:flex gap-12 items-start mb-16">
          {/* Enhanced Image Gallery */}
          <div className="lg:w-1/2 space-y-4">
            <div className="aspect-[4/3] bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
                onError={(e) => (e.target.src = "https://via.placeholder.com/600x450/F9FAFB/6B7280?text=No+Image")}
              />
              {product.sale_price && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  Save {savings}%
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 px-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-xl border-2 flex-shrink-0 transition-all transform hover:scale-105 ${
                      selectedImage === idx ? "border-[#660033] ring-2 ring-[#660033]/30" : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover rounded-lg" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Enhanced Product Info */}
{/* Enhanced Product Info */}
<div className="lg:w-1/2 mt-8 lg:mt-0">
  {/* Category & Featured Badge */}
  <div className="flex flex-wrap items-center gap-3 mb-4">
    <span className="bg-[#660033]/10 text-[#660033] px-3 py-1 rounded-full text-sm font-medium uppercase tracking-wide">
      {product.category}
    </span>
    {product.featured && (
      <span className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
        ✨ <span>Featured</span>
      </span>
    )}
  </div>

  {/* Product Title */}
  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-3">
    {product.name}
  </h1>

  {/* Rating */}
  <div className="flex items-center gap-2 mb-5">
    <StarRating rating={Math.round(product.rating || 0)} />
    <span className="text-gray-600 text-sm">
      {product.rating?.toFixed(1) || 0} ({product.reviews || 0} reviews)
    </span>
  </div>

  {/* Price Section */}
  <div className="mb-5">
    {product.sale_price ? (
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <span className="text-4xl font-bold text-[#660033]">₨{Number(product.sale_price).toLocaleString()}</span>
        <span className="text-xl text-gray-500 line-through">₨{Number(product.regular_price).toLocaleString()}</span>
        <span className="bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap">
          Save {Math.round((1 - product.sale_price / product.regular_price) * 100)}%
        </span>
      </div>
    ) : (
      <span className="text-4xl font-bold text-gray-900">₨{Number(finalPrice).toLocaleString()}</span>
    )}
    <p className="text-sm text-gray-600 mt-1">Inclusive of all taxes</p>
  </div>

  {/* Stock Status */}
  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-6 ${
    product.in_stock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }`}>
    <div className={`w-2 h-2 rounded-full mr-2 ${product.in_stock ? "bg-green-500" : "bg-red-500"}`}></div>
    {product.in_stock ? "✅ In Stock" : "❌ Out of Stock"}
  </div>

  {/* Quantity Selector - Inline */}
  <div className="flex items-center gap-4 mb-6">
    <label htmlFor="quantity" className="text-sm font-medium text-gray-700 min-w-[80px]">
      Quantity:
    </label>
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => setQuantity(Math.max(1, quantity - 1))}
        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:border-[#660033] hover:bg-[#660033]/5 active:bg-[#660033]/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#660033]/30"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span
        id="quantity"
        className="w-12 h-10 border border-gray-300 rounded-lg flex items-center justify-center font-semibold text-gray-800 bg-white"
      >
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => setQuantity(quantity + 1)}
        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:border-[#660033] hover:bg-[#660033]/5 active:bg-[#660033]/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#660033]/30"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  </div>

  {/* Total Price Box */}
  <div className="p-5 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl mb-6 shadow-sm">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
      <span className="text-lg font-semibold text-gray-800">
        Total: <span className="font-bold text-[#660033]">₨{Number(finalPrice * quantity).toLocaleString()}</span>
      </span>
      {product.sale_price && (
        <span className="text-green-600 text-sm font-medium text-center sm:text-left">
          You save ₨{Number((product.regular_price - product.sale_price) * quantity).toLocaleString()}
        </span>
      )}
    </div>
  </div>

  {/* Action Buttons */}
  <div className="space-y-3 mb-8">
    <button
      onClick={handleOrder}
      disabled={!product.in_stock}
      className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
        product.in_stock
          ? "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          : "bg-gray-300 text-gray-500 cursor-not-allowed"
      }`}
    >
      💬 Order via WhatsApp • ₨{Number(finalPrice * quantity).toLocaleString()}
    </button>

    <div className="flex gap-3">
      <button
        onClick={toggleWishlist}
        className={`flex-1 py-3 border rounded-xl transition-all text-sm font-medium ${
          isWishlisted
            ? "bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
      >
        {isWishlisted ? "❤️ Wishlisted" : "🤍 Add to Wishlist"}
      </button>
      <button
        onClick={handleShare}
        className="flex-1 py-3 border border-gray-300 rounded-xl bg-white text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
      >
        🌐 Share
      </button>
    </div>
  </div>

  {/* Product Highlights */}
  <div className="border-t pt-6">
    <h3 className="font-bold text-gray-900 text-lg mb-4">✨ Why You'll Love It</h3>
    <ul className="space-y-2.5 text-sm text-gray-700">
      <li className="flex items-start gap-2">
        <span className="text-green-500 mt-1 flex-shrink-0">✓</span>
        <span>Premium quality ingredients for lasting results</span>
      </li>
      <li className="flex items-start gap-2">
        <span className="text-green-500 mt-1 flex-shrink-0">✓</span>
        <span>Dermatologist tested & skin-safe formula</span>
      </li>
      <li className="flex items-start gap-2">
        <span className="text-green-500 mt-1 flex-shrink-0">✓</span>
        <span>Proudly made in Pakistan with care</span>
      </li>
      <li className="flex items-start gap-2">
        <span className="text-green-500 mt-1 flex-shrink-0">✓</span>
        <span>Cruelty-free & ethically produced</span>
      </li>
    </ul>
  </div>
</div>



        </div>

        {/* Enhanced Tabs Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              {[
                { id: "description", label: "Description", icon: "📝" },
                { id: "reviews", label: "Reviews", icon: "⭐" },
                { id: "specifications", label: "Specifications", icon: "📊" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                    activeTab === tab.id
                      ? "text-[#660033] border-b-2 border-[#660033] bg-[#660033]/5"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === "description" && (
              <div className="max-w-none">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">About This Product</h3>

  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    skipHtml={false}
    components={{
      h1: ({ node, ...props }) => (
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#660033', marginTop: '1.5rem', marginBottom: '0.75rem' }} {...props} />
      ),
      h2: ({ node, ...props }) => (
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginTop: '1.25rem', marginBottom: '0.5rem' }} {...props} />
      ),
      h3: ({ node, ...props }) => (
        <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#374151', marginTop: '1rem', marginBottom: '0.5rem' }} {...props} />
      ),
      ul: ({ node, ...props }) => (
        <ul
          style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', marginBottom: '0.5rem', textAlign: 'justify' }}
          className="list-disc text-gray-700 text-sm"
          {...props}
        />
      ),
      li: ({ node, ...props }) => (
        <li style={{ marginBottom: '0.25rem', textAlign: 'justify' }} className="text-gray-700" {...props} />
      ),
      strong: ({ node, ...props }) => (
        <strong style={{ color: '#660033', fontWeight: '600' }} {...props} />
      ),
      em: ({ node, ...props }) => (
        <em style={{ color: '#4b5563', fontStyle: 'italic' }} {...props} />
      ),
      p: ({ node, ...props }) => (
        <p
          style={{ marginBottom: '0.75rem', textAlign: 'justify' }}
          className="text-gray-700 text-sm leading-relaxed"
          {...props}
        />
      ),
      a: ({ href, children }) => (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#660033] underline hover:text-[#4A0025] transition-colors">
          {children}
        </a>
      ),
    }}
  >
    {product.description || "No description available."}
  </ReactMarkdown>

  {/* Show More Button */}
  {product.description && product.description.length > 200 && (
    <button
      onClick={() => setShowFullDescription(!showFullDescription)}
      className="text-[#660033] hover:text-[#4A0025] text-sm font-medium mt-4 inline-flex items-center gap-1"
    >
      {showFullDescription ? "Show Less" : "See More Details"}
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )}
</div>
            )}

            {activeTab === "reviews" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
                  <button className="bg-[#660033] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#4A0025] transition">
                    Write a Review
                  </button>
                </div>

                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <div className="text-center p-4 bg-gray-50 rounded-xl">
                          <div className="text-4xl font-bold text-[#660033] mb-2">
                            {reviewStats.average.toFixed(1)}
                          </div>
                          <StarRating rating={Math.round(reviewStats.average)} />
                          <p className="text-sm text-gray-600 mt-2">
                            Based on {reviewStats.total} reviews
                          </p>
                        </div>
                      </div>
                      <div>
                        {[5,4,3,2,1].map((rating, idx) => (
                          <div key={rating} className="flex items-center gap-3 mb-2">
                            <span className="text-sm w-8">{rating}★</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-[#660033] h-2 rounded-full transition-all"
                                style={{ width: `${(reviewStats.distribution[idx] / reviewStats.total) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-8">
                              {reviewStats.distribution[idx]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <StarRating rating={review.rating} />
                              <span className="font-medium">{review.user_name}</span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">⭐</div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h4>
                    <p className="text-gray-600">Be the first to review this product!</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "specifications" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Specifications</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-700">Product ID</span>
                      <span className="text-gray-600">{product.id}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-700">Category</span>
                      <span className="text-gray-600">{product.category}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-700">Weight</span>
                      <span className="text-gray-600">250g</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-700">Origin</span>
                      <span className="text-gray-600">Made in Pakistan</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-700">Skin Type</span>
                      <span className="text-gray-600">All Skin Types</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-700">Usage</span>
                      <span className="text-gray-600">Daily Use</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-700">Shelf Life</span>
                      <span className="text-gray-600">24 Months</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-700">Expiry Date</span>
                      <span className="text-gray-600">See Packaging</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Recommended Products */}
        {recommended.length > 0 && (
          <section className="mt-20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">You Might Also Love</h2>
              <p className="text-gray-600 text-lg">Discover more products from our collection</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommended.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => navigate(`/product/${rec.slug || rec.id}`)}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-gray-100 cursor-pointer transform hover:-translate-y-2 group"
                >
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    <img
                      src={rec.image_url}
                      alt={rec.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => (e.target.src = "https://via.placeholder.com/300x300/F9FAFB/6B7280?text=No+Image")}
                    />
                    {rec.sale_price && (
                      <div className="absolute top-3 left-3 bg-[#660033] text-white text-xs font-bold px-2 py-1 rounded-full">
                        SALE
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#660033] transition-colors">
                      {rec.name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{rec.description}</p>

                    <div className="flex items-center gap-2 mb-3">
                      <StarRating rating={Math.round(rec.rating || 0)} />
                      <span className="text-sm text-gray-600">({rec.reviews || 0})</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        {rec.sale_price ? (
                          <>
                            <span className="font-bold text-[#660033] text-lg">
                              ₨{Number(rec.sale_price).toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-500 line-through ml-2">
                              ₨{Number(rec.regular_price || rec.price).toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-gray-900 text-lg">
                            ₨{Number(rec.price || 0).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-[#660033] font-medium group-hover:underline">
                        View Details →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        <section>
          <RecommendedProducts />
        </section>

        {/* Recently Viewed */}
        <section className="mt-16 bg-gray-50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Recently Viewed</h3>
            <button 
              onClick={() => localStorage.removeItem("viewedProducts")}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Clear History
            </button>
          </div>
          <div className="text-center text-gray-600">
            <p>Keep browsing to see your recently viewed products here!</p>
          </div>
        </section>
      </div>
    </div>
  );
};

// Enhanced Skeleton Loader
const ProductSkeleton = () => (
  <div className="animate-pulse bg-gradient-to-br from-gray-50 to-white min-h-screen">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
      <div className="lg:flex gap-12 items-start">
        <div className="lg:w-1/2 space-y-4">
          <div className="aspect-[4/3] bg-gray-200 rounded-2xl"></div>
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
        <div className="lg:w-1/2 space-y-4 mt-8 lg:mt-0">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded w-3/4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-32 bg-gray-200 rounded w-full"></div>
          <div className="h-12 bg-gray-200 rounded w-full"></div>
          <div className="flex gap-3">
            <div className="h-12 bg-gray-200 rounded w-1/2"></div>
            <div className="h-12 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ProductDetail;