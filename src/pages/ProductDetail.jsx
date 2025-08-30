import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, increment, collection, getDocs } from "firebase/firestore";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [recommended, setRecommended] = useState([]);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...docSnap.data() };
          setProduct(productData);
          
          // Increment views
          await updateDoc(docRef, {
            views: increment(1)
          });
        } else {
          console.log("No such product!");
          navigate("/products");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsData = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(p => p.id !== id && p.category === product?.category)
          .slice(0, 4);
        setRecommended(productsData);
      } catch (error) {
        console.error("Error fetching recommended products:", error);
      }
    };
    if (product) fetchRecommended();
  }, [id, product]);

  const handleOrderClick = async () => {
    try {
      const productRef = doc(db, "products", id);
      await updateDoc(productRef, {
        clicks: increment(1)
      });
      
      const price = product.salePrice || product.price;
      const message = `Hi Nainzaka Aesthetics! I'm interested in ${product.name} (₨${price.toLocaleString()})`;
      const whatsappUrl = `https://wa.me/923404430083?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error("Error updating product clicks:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#660033] mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="text-center max-w-md p-8">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate("/products")}
            className="bg-[#660033] hover:bg-[#4A0025] text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const images = [product.imageUrl, ...(product.additionalImages || [])].filter(Boolean);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <button
                onClick={() => navigate("/")}
                className="text-gray-500 hover:text-[#660033] transition-colors"
              >
                Home
              </button>
            </li>
            <li>
              <span className="text-gray-400 mx-2">/</span>
              <button
                onClick={() => navigate("/products")}
                className="text-gray-500 hover:text-[#660033] transition-colors"
              >
                Products
              </button>
            </li>
            <li>
              <span className="text-gray-400 mx-2">/</span>
              <span className="text-gray-900">{product.name}</span>
            </li>
          </ol>
        </nav>

        {/* Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-3">
            {/* Main Image - Smaller size */}
            <div className="aspect-[4/3] bg-gray-50 rounded-lg overflow-hidden border border-gray-200 max-w-md mx-auto">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-300"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/600x450/F9FAFB/6B7280?text=No+Image";
                }}
              />
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex gap-2 justify-center">
                {images.slice(0, 4).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square w-16 rounded-md overflow-hidden border-2 transition-all ${
                      selectedImage === index 
                        ? 'border-[#660033] ring-1 ring-[#660033]/20' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/150x150/F9FAFB/6B7280?text=No+Image";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:pl-6">
            <div className="sticky top-8">
              {/* Category */}
              {product.category && (
                <div className="mb-3">
                  <span className="inline-block bg-[#660033]/10 text-[#660033] text-xs font-medium px-2 py-0.5 rounded-full uppercase tracking-wide">
                    {product.category}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-center mb-5">
                {product.salePrice ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-[#660033]">
                      ₨{product.salePrice.toLocaleString()}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      ₨{product.price.toLocaleString()}
                    </span>
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                      {Math.round((1 - product.salePrice / product.price) * 100)}% OFF
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-gray-900">
                    ₨{product.price?.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="text-gray-600 mb-5">
                <h3 className="text-base font-medium text-gray-900 mb-2">Description</h3>
                <p
                  className={`text-base leading-relaxed text-left whitespace-pre-line ${
                    showFullDescription ? "" : "line-clamp-3"
                  }`}
                >
                  {product.description.replace(/\*\*/g, "").trim()}
                </p>
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-[#660033] hover:text-[#4A0025] text-sm font-medium mt-2"
                >
                  {showFullDescription ? "Show Less" : "See More"}
                </button>
              </div>

              {/* Product Details */}
              <div className="mb-5">
                <h3 className="text-base font-medium text-gray-900 mb-3"></h3>
                <div className="bg-gray-50 rounded-md p-3 space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Category:</span>
                    <span className="text-gray-900 font-medium">{product.category}</span>
                  </div>
                  {product.subCategory && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Sub Category:</span>
                      <span className="text-gray-900 font-medium">{product.subCategory}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Stock Status:</span>
                    <div className={`flex items-center space-x-2 ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                      <div className={`w-2.5 h-2.5 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="font-medium">
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Button */}
              <div>
                <button
                  onClick={handleOrderClick}
                  disabled={!product.inStock}
                  className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-base transition-all ${
                    product.inStock 
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transform hover:scale-105' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  {product.inStock ? 'Order via WhatsApp' : 'Out of Stock'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Products */}
        {recommended.length > 0 && (
          <div className="border-t border-gray-200 pt-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">You May Also Like</h2>
              <p className="text-gray-600 text-lg">Discover more products from the same category</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {recommended.map(rec => (
                <div 
                  key={rec.id} 
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 cursor-pointer transform hover:-translate-y-2"
                  onClick={() => navigate(`/product/${rec.id}`)}
                >
                  {/* Product Image */}
                  <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    <img
                      src={rec.imageUrl}
                      alt={rec.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={e => { e.target.src = "https://via.placeholder.com/300x300/F3F4F6/9CA3AF?text=No+Image"; }}
                    />
                    {!rec.inStock && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                        Out of Stock
                      </div>
                    )}
                    {rec.salePrice && (
                      <div className="absolute top-3 left-3 bg-[#660033] text-white text-xs font-medium px-2 py-1 rounded-full">
                        Sale
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#660033] transition-colors">{rec.name}</h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{rec.description}</p>
                    
                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {rec.salePrice ? (
                          <>
                            <span className="font-bold text-[#660033] text-lg">
                              ₨{rec.salePrice?.toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              ₨{rec.price?.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-gray-900 text-lg">
                            ₨{rec.price?.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <button className="text-sm text-[#660033] hover:text-[#4A0025] font-medium flex items-center">
                        View
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;