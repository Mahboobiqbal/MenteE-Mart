import React from 'react';

const emerald = "#008060";
const yellow = "#FFD700";
const white = "#FFFFFF";
const charcoal = "#333333";

const HeroSection = () => {
  return (
    <div className="w-full relative overflow-hidden" style={{ background: `linear-gradient(90deg, ${emerald}20 0%, ${charcoal}05 100%)` }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-12 pointer-events-none">
        <div style={{ background: emerald }} className="absolute top-0 left-0 w-72 h-72 rounded-full mix-blend-soft-light filter blur-3xl animate-blob" />
        <div style={{ background: charcoal }} className="absolute top-0 right-0 w-72 h-72 rounded-full mix-blend-soft-light filter blur-3xl animate-blob animation-delay-2000" />
        <div style={{ background: yellow }} className="absolute bottom-0 left-1/2 w-72 h-72 rounded-full mix-blend-soft-light filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative w-full px-6 md:px-12 lg:px-20 py-20 md:py-28">
        <div className="mx-auto w-full max-w-screen-2xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center md:text-left">
            <div className="inline-block bg-white text-[${charcoal}] px-4 py-1 rounded-full text-sm font-semibold mb-4" style={{ color: emerald, background: white }}>
              New Collection
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight" style={{ color: charcoal }}>
              Discover Your <span style={{ background: `linear-gradient(90deg, ${yellow}, ${emerald})`, WebkitBackgroundClip: 'text', color: 'transparent' }}>Perfect</span> Style
            </h1>

            <p className="mt-6 text-lg md:text-xl text-gray-700 max-w-2xl">
              MenteE Mart brings you the finest selection of premium products curated just for you.
              Elevate your lifestyle with our exclusive collections.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button
                className="px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 ease-in-out"
                style={{ background: yellow, color: charcoal }}
              >
                Shop Now
              </button>
              <button
                className="px-8 py-4 border-2 rounded-full font-bold hover:bg-white hover:text-${charcoal} transition duration-300 ease-in-out"
                style={{ borderColor: yellow, color: yellow, background: 'transparent' }}
              >
                Explore Collections
              </button>
            </div>
          </div>

          {/* Product Showcase */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="transform rotate-3 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80"
                  alt="Watch"
                  className="w-full h-64 object-cover"
                />
              </div>
              <div className="transform -rotate-3 rounded-2xl overflow-hidden shadow-2xl border-4 border-white mt-12">
                <img
                  src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=500&q=80"
                  alt="Smart Watch"
                  className="w-full h-64 object-cover"
                />
              </div>
              <div className="transform -rotate-3 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80"
                  alt="Headphones"
                  className="w-full h-64 object-cover"
                />
              </div>
              <div className="transform rotate-3 rounded-2xl overflow-hidden shadow-2xl border-4 border-white -mt-12">
                <img
                  src="https://images.unsplash.com/photo-1585155770447-2f66e2a397b5?auto=format&fit=crop&w=500&q=80"
                  alt="Perfume"
                  className="w-full h-64 object-cover"
                />
              </div>
            </div>

            {/* Floating Badge */}
            <div
              className="absolute -top-6 -right-6 px-6 py-3 rounded-full shadow-xl font-bold transform rotate-6"
              style={{ background: `linear-gradient(90deg, ${yellow}, ${emerald})`, color: charcoal }}
            >
              Sale 50% Off
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;