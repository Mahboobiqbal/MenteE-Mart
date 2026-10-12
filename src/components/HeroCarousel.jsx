import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import img1 from "../assets/1.jpg";
import img2 from "../assets/2.png";
import img3 from "../assets/3.jpg";
import img4 from "../assets/4.jpg";

const slides = [
  {
    image: img1,
    eyebrow: "Mena Bazar",
    title: "Mega Sale is Live!",
    subtitle: "Up to 40% off on selected products across every store",
    cta: { label: "Shop the Sale", to: "/products?sort=discount" },
    overlay: "from-[#00483a]/85 via-[#00483a]/60 to-transparent",
  },
  {
    image: img2,
    eyebrow: "New Arrivals",
    title: "Fresh This Week",
    subtitle: "Discover the latest products added by our partner stores",
    cta: { label: "Explore New Arrivals", to: "/products?sort=newest" },
    overlay: "from-[#00382d]/85 via-[#00382d]/55 to-transparent",
  },
  {
    image: img3,
    eyebrow: "Top Rated",
    title: "Customer Favourites",
    subtitle: "Best sellers loved by shoppers across Pakistan",
    cta: { label: "View Best Sellers", to: "/products?sort=rating" },
    overlay: "from-[#0b3b30]/85 via-[#0b3b30]/55 to-transparent",
  },
  {
    image: img4,
    eyebrow: "Shop by Store",
    title: "Order Direct on WhatsApp",
    subtitle: "Browse products from every store and place your order in seconds",
    cta: { label: "Browse Stores", to: "/stores" },
    overlay: "from-[#123a31]/85 via-[#123a31]/55 to-transparent",
  },
];

const HeroCarousel = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer.current);
  }, [paused]);

  const go = (next) => {
    setIndex((next + slides.length) % slides.length);
  };

  return (
    <section
      className="relative w-full overflow-hidden rounded-2xl shadow-lg"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <div className="relative h-[320px] sm:h-[400px] lg:h-[460px]">
        {slides.map((slide, i) => (
          <div
            key={slide.title}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === index ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            aria-hidden={i !== index}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div
              className={`absolute inset-0 bg-gradient-to-r ${slide.overlay}`}
            />
            <div className="absolute inset-0 flex items-center">
              <div className="px-6 sm:px-12 lg:px-16 max-w-2xl text-white">
                <span className="inline-block bg-[#ffd700] text-[#333] text-xs sm:text-sm font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
                  {slide.eyebrow}
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-3">
                  {slide.title}
                </h1>
                <p className="text-sm sm:text-lg text-white/90 mb-6 max-w-xl">
                  {slide.subtitle}
                </p>
                <Link
                  to={slide.cta.to}
                  className="inline-block bg-[#ffd700] text-[#333] font-bold px-7 py-3 rounded-full hover:bg-white transition-colors shadow-md"
                >
                  {slide.cta.label}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Prev / Next */}
      <button
        onClick={() => go(index - 1)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow-md transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => go(index + 1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow-md transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.title}
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2.5 rounded-full transition-all ${
              i === index ? "w-7 bg-[#ffd700]" : "w-2.5 bg-white/70 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
