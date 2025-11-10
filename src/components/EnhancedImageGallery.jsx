import React, { useState } from "react";

const EnhancedImageGallery = ({ images, productName, onImageChange }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const handleImageSelect = (index) => {
    setSelectedImage(index);
    if (onImageChange) {
      onImageChange(index);
    }
  };

  const handleMouseMove = (e) => {
    if (!isZoomed) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x, y });
  };

  const currentImage =
    images?.[selectedImage] ||
    "https://via.placeholder.com/600x600/F9FAFB/6B7280?text=No+Image";

  return (
    <div className="space-y-4">
      {/* Main Image with Zoom */}
      <div className="relative">
        <div
          className="relative aspect-square bg-white rounded-2xl overflow-hidden cursor-zoom-in border border-gray-200"
          onClick={() => setIsZoomed(!isZoomed)}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setIsZoomed(false)}
        >
          <img
            src={currentImage}
            alt={`${productName} - Image ${selectedImage + 1}`}
            className={`w-full h-full object-contain transition-all duration-300 ${
              isZoomed ? "scale-150" : "scale-100"
            }`}
            style={{
              transformOrigin: isZoomed
                ? `${zoomPosition.x}% ${zoomPosition.y}%`
                : "center",
            }}
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/600x600/F9FAFB/6B7280?text=No+Image";
            }}
          />

          {/* Zoom Icon */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg">
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
              />
            </svg>
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
            {selectedImage + 1} / {images?.length || 1}
          </div>
        </div>

        {/* Full Screen View Modal */}
        {isZoomed && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setIsZoomed(false)}
          >
            <div className="relative max-w-4xl max-h-[90vh] w-full">
              <img
                src={currentImage}
                alt={`${productName} - Full View`}
                className="w-full h-full object-contain"
              />

              {/* Close Button */}
              <button
                onClick={() => setIsZoomed(false)}
                className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
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

              {/* Navigation Arrows */}
              {images?.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newIndex =
                        selectedImage > 0
                          ? selectedImage - 1
                          : images.length - 1;
                      handleImageSelect(newIndex);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors"
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
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newIndex =
                        selectedImage < images.length - 1
                          ? selectedImage + 1
                          : 0;
                      handleImageSelect(newIndex);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors"
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Thumbnail Grid */}
      {images?.length > 1 && (
        <div className="grid grid-cols-4 lg:grid-cols-6 gap-3">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => handleImageSelect(index)}
              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                selectedImage === index
                  ? "border-[#008060] ring-2 ring-[#008060]/30"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <img
                src={image}
                alt={`${productName} Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/100x100/F9FAFB/6B7280?text=No+Image";
                }}
              />

              {/* Selection Indicator */}
              {selectedImage === index && (
                <div className="absolute inset-0 bg-[#008060]/20 flex items-center justify-center">
                  <div className="w-6 h-6 bg-[#008060] rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Image Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Click image to {isZoomed ? "exit" : "zoom"} • Use arrows to navigate
        </div>

        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: productName,
                text: `Check out this product: ${productName}`,
                url: window.location.href,
              });
            } else {
              navigator.clipboard.writeText(window.location.href);
              alert("Link copied to clipboard!");
            }
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
            />
          </svg>
          Share
        </button>
      </div>
    </div>
  );
};

export default EnhancedImageGallery;
