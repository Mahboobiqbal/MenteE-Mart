import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Technology", to: "/products" },
    { label: "Location", to: "/location" },
    { label: "About", to: "/about" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/?q=${encodeURIComponent(q)}` : "/");
    setIsOpen(false);
  };

  return (
    <nav className="w-full bg-[#008060] text-[#FFFFFF] shadow-sm sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="text-2xl font-bold">
            MenteE Mart 🌸
          </Link>

          <div className="hidden md:flex flex-1 justify-center px-6">
            <form onSubmit={handleSearch} className="relative w-full max-w-2xl">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full h-11 pl-4 pr-24 rounded-xl bg-[#FFFFFF] text-[#333333] placeholder-[#333333]/60 ring-1 ring-[#333333]/20 focus:ring-2 focus:ring-[#FFD700] outline-none transition"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-1 my-1 px-4 rounded-lg bg-[#FFD700] text-[#333333] font-medium hover:opacity-90 transition"
              >
                Search
              </button>
            </form>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                className="hover:text-[#FFD700] transition"
              >
                {label}
              </Link>
            ))}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-[#008060] hover:bg-[#006B51] transition"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-[#FFFFFF]"
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

        {isOpen && (
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch} className="relative w-full mb-2">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full h-11 pl-4 pr-24 rounded-xl bg-[#FFFFFF] text-[#333333] placeholder-[#333333]/60 ring-1 ring-[#333333]/20 focus:ring-2 focus:ring-[#FFD700] outline-none transition"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-1 my-1 px-4 rounded-lg bg-[#FFD700] text-[#333333] font-medium hover:opacity-90 transition"
              >
                Search
              </button>
            </form>

            <div className="space-y-2 bg-[#008060]/95 border-t border-white/10 rounded-b-2xl p-3">
              {navLinks.map(({ label, to }) => (
                <Link
                  key={label}
                  to={to}
                  className="block px-4 py-3 text-[#FFFFFF] hover:text-[#FFD700] hover:bg-white/10 rounded-xl transition"
                  onClick={() => setIsOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;