import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const footerCategories = [
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Beauty",
];

const Footer = () => {
  const rawWhatsApp = (import.meta.env.VITE_WHATSAPP_NUMBER || "923472886228").replace(
    /\D/g,
    ""
  );
  const waLink = `https://wa.me/${rawWhatsApp}`;
  const displayPhone = `+${rawWhatsApp}`;

  return (
  <footer className="w-full bg-gradient-to-br from-[#007a5a] to-[#005c4b] text-[#e9f5f0] mt-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand Column */}
        <div className="space-y-5">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-lg">
              <img
                src={logo}
                alt="Mena Bazar logo"
                className="h-8 w-8 object-contain"
              />
            </div>
            <div>
              <span className="block text-2xl font-bold text-white">
                Mena Bazar
              </span>
              <span className="block text-xs text-[#a0d9c1] font-medium tracking-wider">
                Shop Smart. Live Better.
              </span>
            </div>
          </div>
          <p className="text-[#d1f0e2] text-sm leading-relaxed max-w-xs">
            Curated essentials for everyday life. Trusted quality, fair prices,
            fast delivery across Pakistan.
          </p>
          <div className="pt-2">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-[#25D366] text-white rounded-full text-sm font-medium hover:bg-[#128C7E] transition-colors duration-300 shadow-md"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.04 2.875 1.186 3.074.149.198 2.05 3.127 4.974 4.266.695.299 1.234.477 1.656.611.696.222 1.33.191 1.83.116.558-.083 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.07 4.849-.07zm0-2.163C8.741 0 8.332.013 7.052.072 2.668.272.273 2.668.072 7.052.013 8.332 0 8.741 0 12c0 3.259.013 3.668.072 4.948.201 4.384 2.596 6.78 6.98 6.98C8.332 23.987 8.741 24 12 24c3.259 0 3.668-.013 4.948-.072 4.384-.201 6.78-2.596 6.98-6.98.059-1.28.072-1.689.072-4.948 0-3.259-.013-3.668-.072-4.948-.201-4.354-2.596-6.78-6.98-6.98C15.668.013 15.259 0 12 0z" />
              </svg>
              Chat with us
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-5">
          <h3 className="text-white font-bold uppercase tracking-wider text-sm border-b border-[#00a884] pb-2 inline-block">
            Quick Links
          </h3>
          <ul className="space-y-3">
            {[
              { label: "Home", to: "/" },
              { label: "Shop", to: "/products" },
              { label: "Stores", to: "/stores" },
              { label: "About Us", to: "/about" },
              { label: "Contact", to: "/contact" },
              { label: "Track Order", to: "/track-order" },
            ].map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="text-[#d1f0e2] hover:text-white transition-colors flex items-center group"
                >
                  <span className="mr-2 text-[#00a884] group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div className="space-y-5">
          <h3 className="text-white font-bold uppercase tracking-wider text-sm border-b border-[#00a884] pb-2 inline-block">
            Top Categories
          </h3>
          <ul className="space-y-3">
            {footerCategories.map((category) => (
              <li key={category} className="flex items-center">
                <span className="w-2 h-2 bg-[#00a884] rounded-full mr-3"></span>
                <Link
                  to={`/products?category=${encodeURIComponent(category)}`}
                  className="text-[#d1f0e2] hover:text-white transition-colors"
                >
                  {category}
                </Link>
              </li>
            ))}
            <li className="flex items-center pt-1">
              <Link
                to="/categories"
                className="text-white font-medium hover:underline transition-colors"
              >
                View all categories →
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact & Info */}
        <div className="space-y-5">
          <h3 className="text-white font-bold uppercase tracking-wider text-sm border-b border-[#00a884] pb-2 inline-block">
            Contact Info
          </h3>
          <ul className="space-y-4">
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-[#00a884] mt-0.5 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-[#d1f0e2] text-sm">
                Swat, KPK, Pakistan
              </span>
            </li>
            <li className="flex items-center">
              <svg
                className="w-5 h-5 text-[#00a884] mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span className="text-[#d1f0e2] text-sm">{displayPhone}</span>
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-[#00a884] mt-0.5 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="text-[#d1f0e2] text-sm">
                info@menabazar.com
              </span>
            </li>
          </ul>

          <div className="pt-2">
            <h4 className="text-white font-medium text-sm mb-3">Follow Us</h4>
            <div className="flex space-x-4">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#d1f0e2] hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.04 2.875 1.186 3.074.149.198 2.05 3.127 4.974 4.266.695.299 1.234.477 1.656.611.696.222 1.33.191 1.83.116.558-.083 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.07 4.849-.07zm0-2.163C8.741 0 8.332.013 7.052.072 2.668.272.273 2.668.072 7.052.013 8.332 0 8.741 0 12c0 3.259.013 3.668.072 4.948.201 4.384 2.596 6.78 6.98 6.98C8.332 23.987 8.741 24 12 24c3.259 0 3.668-.013 4.948-.072 4.384-.201 6.78-2.596 6.98-6.98.059-1.28.072-1.689.072-4.948 0-3.259-.013-3.668-.072-4.948-.201-4.354-2.596-6.78-6.98-6.98C15.668.013 15.259 0 12 0z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/menabazar"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#d1f0e2] hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.07 4.849-.07zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@menabazar"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#d1f0e2] hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M16.5 3a1 1 0 0 1 1 1c0 2.485 2.015 4.5 4.5 4.5a1 1 0 1 1 0 2c-2.019 0-3.813-.97-4.89-2.47V16a5.5 5.5 0 1 1-5.5-5.5 1 1 0 1 1 0 2A3.5 3.5 0 1 0 15 16V2.999a1 1 0 0 1 1-1h.5z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#00a884]/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p className="text-[#a0d9c1] text-sm text-center md:text-left">
          © {new Date().getFullYear()} Mena Bazar. All rights reserved.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-4 md:mt-0">
          {[
            { label: "Privacy Policy", to: "/privacy" },
            { label: "Terms of Service", to: "/terms" },
            { label: "FAQs", to: "/faq" },
            { label: "Shipping Info", to: "/shipping" },
          ].map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-[#a0d9c1] hover:text-white text-sm transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="mt-4 md:mt-0">
          <p className="text-[#a0d9c1] text-sm">
            Developed by{" "}
            <a
              className="text-white hover:underline"
              href="https://github.com/Mahboobiqbal"
              target="_blank"
              rel="noopener noreferrer"
            >
              Mahboob Iqbal
            </a>
          </p>
        </div>
      </div>
    </div>
  </footer>
  );
};

export default Footer;
