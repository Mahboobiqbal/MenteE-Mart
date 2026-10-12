import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import CartIcon from "./cart/CartIcon";
import CartDrawer from "./cart/CartDrawer";
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [wishlistCount, setWishlistCount] = useState(0);
  const navigate = useNavigate();

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Shop", to: "/products" },
    { label: "Stores", to: "/stores" },
    { label: "Categories", to: "/categories" },
    { label: "About", to: "/about" },
    { label: "Team", to: "/team" },
  ];

  useEffect(() => {
    const update = () => {
      try {
        const list = JSON.parse(localStorage.getItem("wishlist") || "[]");
        setWishlistCount(Array.isArray(list) ? list.length : 0);
      } catch {
        setWishlistCount(0);
      }
    };
    update();
    window.addEventListener("storage", update);
    window.addEventListener("wishlist-updated", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("wishlist-updated", update);
    };
  }, []);

  const goToSearch = (raw) => {
    const q = raw.trim();
    setIsOpen(false);
    if (q) {
      navigate(`/products?q=${encodeURIComponent(q)}`);
      setQuery("");
    } else {
      navigate("/products");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    goToSearch(query);
  };

  return (
    <nav className="w-full bg-gradient-to-r from-[#007a5a] to-[#005c4b] text-[#e9f5f0] shadow-lg sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
              <span className="text-[#007a5a] font-bold text-xl">
                <img src={logo} alt="Mena Bazar" />
              </span>
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#ffd700] to-[#ffaa00]">
              Mena Bazar
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                className="px-4 py-2 rounded-lg hover:bg-[#006b51]/50 transition-all duration-300 font-medium"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-6">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full h-11 pl-5 pr-32 rounded-full bg-white/90 text-[#333333] placeholder-[#333333]/70 focus:outline-none focus:ring-2 focus:ring-[#ffd700] transition-all"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 px-6 rounded-r-full bg-gradient-to-r from-[#ffd700] to-[#ffaa00] text-[#333] font-semibold hover:opacity-90 transition-opacity"
              >
                Search
              </button>
            </form>
          </div>

          {/* Cart, Wishlist & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <CartIcon />

            <button
              onClick={() => navigate("/wishlist")}
              className="hidden md:flex items-center p-2 rounded-full hover:bg-[#006b51]/50 transition-colors relative"
              aria-label="Wishlist"
            >
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M20.8 4.6a5.5 5.5 0 00-7.78 0L12 5.6l-1.02-1a5.5 5.5 0 00-7.78 7.78L12 21.1l8.8-8.8a5.5 5.5 0 000-7.7z" />
              </svg>
              <span className="ml-2 text-sm font-medium">{wishlistCount}</span>
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#006b51]/50 transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 text-[#e9f5f0]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-5">
            {/* Mobile Search */}
            <form
              onSubmit={handleSearch}
              className="relative w-full mb-4"
            >
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full h-11 pl-5 pr-32 rounded-full bg-white/90 text-[#333333] placeholder-[#333333]/70 focus:outline-none focus:ring-2 focus:ring-[#ffd700] transition-all"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 px-6 rounded-r-full bg-gradient-to-r from-[#ffd700] to-[#ffaa00] text-[#333] font-semibold"
              >
                Search
              </button>
            </form>

            {/* Mobile Navigation */}
            <div className="space-y-2 bg-[#006b51]/50 rounded-xl p-2">
              {navLinks.map(({ label, to }) => (
                <Link
                  key={label}
                  to={to}
                  className="block px-5 py-3 text-[#e9f5f0] hover:bg-[#005c4b] rounded-lg transition-colors font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {label}
                </Link>
              ))}

              {/* Mobile Wishlist */}
              <div className="px-5 py-3 border-t border-white/10 mt-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/wishlist");
                  }}
                  className="flex items-center w-full text-left"
                >
                  <svg
                    className="w-6 h-6 mr-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path d="M20.8 4.6a5.5 5.5 0 00-7.78 0L12 5.6l-1.02-1a5.5 5.5 0 00-7.78 7.78L12 21.1l8.8-8.8a5.5 5.5 0 000-7.7z" />
                  </svg>
                  <span className="ml-3 font-medium">
                    Wishlist ({wishlistCount})
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cart Drawer */}
        <CartDrawer />
      </div>
    </nav>
  );
};

export default Navbar;
