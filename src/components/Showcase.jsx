import React, { useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const emerald = "#008060";
const white = "#FFFFFF";
const charcoal = "#333333";
const yellow = "#FFD700";
const lightEmerald = "#007a5a";

const Showcase = ({ showcase = [], topFallback = null, loadingTop = false, scIndex, setScIndex }) => {
  const scTimer = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!showcase || showcase.length <= 1) return;
    scTimer.current = setInterval(() => setScIndex(i => (i + 1) % showcase.length), 7000);
    return () => clearInterval(scTimer.current);
  }, [showcase, setScIndex]);

  const scPrev = () => {
    if (!showcase.length) return;
    clearInterval(scTimer.current);
    setScIndex(i => (i - 1 + showcase.length) % showcase.length);
  };
  const scNext = () => {
    if (!showcase.length) return;
    clearInterval(scTimer.current);
    setScIndex(i => (i + 1) % showcase.length);
  };

  // Helper render for the big panel
  const renderItem = (item) => (
    <div className="relative rounded-2xl overflow-hidden shadow-xl w-full" style={{ background: `linear-gradient(90deg, ${emerald}10 0%, ${white} 60%)` }}>
      {/* Featured badge pinned to top-left of the panel */}
      <div className="absolute top-4 left-4 z-30">
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-full font-semibold shadow-sm"
          style={{ background: yellow, color: charcoal, boxShadow: "0 4px 10px rgba(2,6,23,0.06)" }}
        >
          <span style={{ width: 8, height: 8, borderRadius: 9999, background: emerald, display: "inline-block" }} />
          <span className="text-xs">{item.badge ? String(item.badge).replace(/_/g, " ").toUpperCase() : "SPECIAL"}</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center">
        <div className="flex-1 p-8 md:p-14">
          {/* add a little top padding so content doesn't overlap the badge */}
          <div className="pt-2" />

          <h2 className="text-left text-3xl md:text-4xl font-extrabold leading-tight mb-4" style={{ color: charcoal }}>
            {item.name}
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div>
              <div className="text-3xl font-bold" style={{ color: emerald }}>
                ₨{Number(item.price).toLocaleString()}
              </div>
              {item.regular_price && (
                <div className="text-sm text-gray-500 line-through">₨{Number(item.regular_price).toLocaleString()}</div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate(`/product/${item.id}`)}
                className="px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                style={{ background: `linear-gradient(90deg, ${emerald}, ${lightEmerald})`, color: white }}
              >
                View Details
              </button>

              <button
                onClick={() => window.location.href = `/product/${item.id}#buy`}
                className="px-5 py-3 rounded-xl font-bold border-2 transition-all duration-300 hover:bg-[#008060]/10"
                style={{ border: `2px solid ${emerald}`, color: emerald }}
              >
                Quick Buy
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: "#4B5563" }}>
            <span className={`px-3 py-1 rounded-full font-medium ${item.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {item.in_stock ? "In Stock" : "Out of Stock"}
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              {(item.views || 0).toLocaleString()} views
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              {(item.clicks || 0).toLocaleString()} clicks
            </span>
          </div>
        </div>

        <div className="w-full md:w-2/5 p-4 flex items-center justify-center">
          <div className="w-full h-72 md:h-80 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg border-4 border-white" style={{ background: "linear-gradient(45deg, #f0f9f6, #e6f4f1)" }}>
            <img
              src={item.image || item.image_url || "https://via.placeholder.com/600x600?text=Product+Image"}
              alt={item.name}
              className="object-contain w-full h-full transition-transform duration-700 hover:scale-105"
            />
          </div>
        </div>
      </div>

      {showcase.length > 1 && (
        <>
          <button 
            onClick={scPrev} 
            aria-label="Previous" 
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform duration-300"
            style={{ border: `1px solid ${emerald}` }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={scNext} 
            aria-label="Next" 
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform duration-300"
            style={{ border: `1px solid ${emerald}` }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {showcase.map((_, i) => (
              <button 
                key={i} 
                onClick={() => { clearInterval(scTimer.current); setScIndex(i); }} 
                className={`w-3 h-3 rounded-full transition-all duration-300 ${i === scIndex ? 'bg-[#008060] w-6' : 'bg-white/60'}`} 
                style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }} 
                aria-label={`Go to slide ${i + 1}`} 
              />
            ))}
          </div>
        </>
      )}
    </div>
  );

  // Render normal showcase or fallback
  if (showcase && showcase.length > 0) {
    const item = showcase[scIndex];
    return renderItem(item);
  }

  // fallback (top viewed)
  return (
    <div className="p-6 md:p-10 rounded-3xl shadow-xl" style={{ background: "linear-gradient(135deg, #f0f9f6, #e6f4f1)" }}>
      {loadingTop ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#008060]"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading featured product…</p>
        </div>
      ) : topFallback ? (
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full mb-4" style={{ background: `linear-gradient(90deg, ${yellow}, #FFAA00)`, color: charcoal, fontWeight: 700 }}>
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              MOST POPULAR
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold" style={{ color: emerald }}>Crowd Favorite — Most Viewed Right Now</h3>
            <p className="mt-2 text-gray-600 max-w-2xl mx-auto">See what everyone's loving — limited stock. Grab it before it's gone!</p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 bg-white rounded-2xl shadow-lg p-6 border border-[#008060]/10">
            <div className="w-full md:w-2/5 flex justify-center">
              <div className="w-48 h-48 rounded-xl overflow-hidden shadow-md border-4 border-white">
                <img 
                  src={topFallback.image || topFallback.image_url || "https://via.placeholder.com/300"} 
                  alt={topFallback.name} 
                  className="object-contain w-full h-full" 
                />
              </div>
            </div>

            <div className="flex-1 text-left">
              <div className="text-sm font-semibold mb-2 px-3 py-1 rounded-full inline-block" style={{ background: `${emerald}10`, color: emerald }}>
                TOP VIEWED PRODUCT
              </div>
              <h4 className="text-2xl font-bold mb-3" style={{ color: charcoal }}>{topFallback.name}</h4>
              <p className="text-gray-600 mb-5 leading-relaxed">
                {topFallback.description || "This product is the most popular right now. Don't miss out on this trending item!"}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="text-2xl font-bold" style={{ color: emerald }}>
                  ₨{Number(topFallback.price).toLocaleString()}
                </div>
                <button 
                  onClick={() => navigate(`/product/${topFallback.id}`)} 
                  className="px-5 py-2.5 rounded-lg font-bold shadow transition-all hover:shadow-md"
                  style={{ background: `linear-gradient(90deg, ${emerald}, ${lightEmerald})`, color: white }}
                >
                  View Product
                </button>
              </div>
              
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${topFallback.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <span className="w-2 h-2 rounded-full mr-2 bg-current"></span>
                {topFallback.in_stock ? "In Stock" : "Out of Stock"}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🛍️</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No featured items right now</h3>
          <p className="text-gray-600 mb-6">Check out our amazing collection of products</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/products" 
              className="px-6 py-3 rounded-lg font-bold shadow transition-all hover:shadow-md"
              style={{ background: `linear-gradient(90deg, ${emerald}, ${lightEmerald})`, color: white }}
            >
              Browse All Products
            </Link>
            <a 
              href="https://wa.me/923001234567" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-lg font-bold shadow transition-all hover:shadow-md flex items-center"
              style={{ background: `linear-gradient(90deg, #25D366, #128C7E)`, color: white }}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.04 2.875 1.186 3.074.149.198 2.05 3.127 4.974 4.266.695.299 1.234.477 1.656.611.696.222 1.33.191 1.83.116.558-.083 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.07 4.849-.07zm0-2.163C8.741 0 8.332.013 7.052.072 2.668.272.273 2.668.072 7.052.013 8.332 0 8.741 0 12c0 3.259.013 3.668.072 4.948.201 4.384 2.596 6.78 6.98 6.98C8.332 23.987 8.741 24 12 24c3.259 0 3.668-.013 4.948-.072 4.384-.201 6.78-2.596 6.98-6.98.059-1.28.072-1.689.072-4.948 0-3.259-.013-3.668-.072-4.948-.201-4.354-2.596-6.78-6.98-6.98C15.668.013 15.259 0 12 0z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Showcase;