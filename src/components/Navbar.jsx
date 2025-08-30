import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { currentUser, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Shop", to: "/products" },
    { label: "Location", to: "/location" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/products?q=${encodeURIComponent(q)}`);
    else navigate("/products");
    setIsOpen(false);
  };

  return (
    <nav className="w-full bg-[#008060] text-[#FFFFFF] shadow-sm sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Top row */}
        <div className="flex items-center justify-between h-24">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-4 group shrink-0">
            <div className="w-12 h-12 bg-[#008060] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transform group-hover:scale-105 transition-all duration-300">
              <img
                src={logo}
                alt="MenteE Mart logo"
                className="h-full w-full object-cover rounded-2xl p-0.5"
              />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-2xl font-bold text-[#FFFFFF]">
                MenteE Mart 🌸
              </span>
              <span className="text-xs font-semibold tracking-widest text-[#FFD700]">
                Shop Smart. Live Better.
              </span>
            </div>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 justify-center px-6">
            <form onSubmit={handleSearch} className="relative w-full max-w-2xl">
              <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#333333]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 110-15 7.5 7.5 0 010 15z"/>
                </svg>
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full h-12 pl-12 pr-24 rounded-xl bg-[#FFFFFF] text-[#333333] placeholder-[#333333]/60 ring-1 ring-[#333333]/20 focus:ring-2 focus:ring-[#FFD700] outline-none transition"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute inset-y-0 right-1 my-1 px-4 rounded-lg bg-[#FFD700] text-[#333333] font-medium hover:opacity-90 transition"
              >
                Search
              </button>
            </form>
          </div>

          {/* Right side: Nav links (desktop), icons, burger */}
          <div className="flex items-center gap-4">
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map(({ label, to }) => (
                <Link
                  key={label}
                  to={to}
                  className="relative text-[#FFFFFF] hover:text-[#FFD700] transition-colors duration-200 font-medium"
                >
                  {label}
                </Link>
              ))}

              {currentUser && isAdmin && (
                <div className="relative group">
                  <button className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-[#FFD700] text-[#333333] font-medium hover:opacity-90 transition">
                    <span>Admin</span>
                    <svg
                      className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-3 w-56 bg-[#FFFFFF] rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 border border-[#333333]/10">
                    {["Dashboard", "Add Product"].map((item, index) => (
                      <Link
                        key={item}
                        to={`/admin/${item.toLowerCase().replace(" ", "-")}`}
                        className={`block px-6 py-4 text-sm text-[#333333] hover:bg-[#008060] hover:text-[#FFFFFF] transition-colors duration-150 ${
                          index === 0 ? "rounded-t-2xl" : ""
                        }`}
                      >
                        {item}
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-6 py-4 text-sm text-[#333333] hover:bg-[#008060] hover:text-[#FFFFFF] rounded-b-2xl transition-colors duration-150"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}

              {!currentUser && (
                <Link
                  to="/admin/login"
                  className="px-4 py-2 rounded-xl bg-[#FFD700] text-[#333333] font-medium hover:opacity-90 transition"
                >
                  Admin Login
                </Link>
              )}
            </div>

            {/* Action Icons */}
            <div className="flex items-center gap-2 md:gap-3">
              <Link
                to="/products"
                aria-label="Wishlist"
                className="p-2 rounded-lg hover:bg-white/10 text-[#FFFFFF] hover:text-[#FFD700] transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z"/>
                </svg>
              </Link>
              <Link
                to="/products"
                aria-label="Cart"
                className="relative p-2 rounded-lg hover:bg-white/10 text-[#FFFFFF] hover:text-[#FFD700] transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2 9m12-9l2 9M7 22a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z"/>
                </svg>
                <span className="absolute -top-1 -right-1 text-[10px] leading-none px-1.5 py-0.5 rounded-full bg-[#FFD700] text-[#333333] font-bold">
                  2
                </span>
              </Link>
            </div>

            {/* Burger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-[#008060] hover:bg-[#006B51] transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-[#FFFFFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch} className="relative w-full">
            <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#333333]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 110-15 7.5 7.5 0 010 15z"/>
              </svg>
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full h-11 pl-12 pr-24 rounded-xl bg-[#FFFFFF] text-[#333333] placeholder-[#333333]/60 ring-1 ring-[#333333]/20 focus:ring-2 focus:ring-[#FFD700] outline-none transition"
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-1 my-1 px-4 rounded-lg bg-[#FFD700] text-[#333333] font-medium hover:opacity-90 transition"
            >
              Search
            </button>
          </form>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-4 pt-2 pb-6 space-y-3 bg-[#008060]/95 border-t border-[#333333]/10 rounded-b-2xl shadow-xl">
              {navLinks.map(({ label, to }) => (
                <Link
                  key={label}
                  to={to}
                  className="block px-4 py-3 text-[#FFFFFF] hover:text-[#FFD700] hover:bg-white/10 rounded-xl transition-all duration-200 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {label}
                </Link>
              ))}

              {currentUser && isAdmin ? (
                <div className="border-t border-[#333333]/10 mt-4 pt-4 space-y-3">
                  {["Dashboard", "Add Product"].map((item) => (
                    <Link
                      key={item}
                      to={`/admin/${item.toLowerCase().replace(" ", "-")}`}
                      className="block px-4 py-3 text-[#FFFFFF] hover:text-[#FFD700] hover:bg-white/10 rounded-xl transition-all duration-200 font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      {item}
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-[#FFFFFF] hover:text-[#FFD700] hover:bg-white/10 rounded-xl transition-all duration-200 font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/admin/login"
                  className="block mt-4 px-4 py-3 bg-[#FFD700] text-[#333333] rounded-xl font-medium text-center hover:opacity-90 transition"
                  onClick={() => setIsOpen(false)}
                >
                  Admin Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;