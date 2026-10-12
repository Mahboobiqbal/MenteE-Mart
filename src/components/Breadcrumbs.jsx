import React from "react";
import { Link } from "react-router-dom";

const Breadcrumbs = ({ items = [], className = "" }) => {
  if (!items.length) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center flex-wrap gap-2 text-sm text-gray-500 ${className}`}
    >
      <Link to="/" className="hover:text-emerald-600 transition-colors">
        Home
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-2">
            <span className="text-gray-300">/</span>
            {isLast || !item.to ? (
              <span
                className="text-gray-800 font-medium"
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            ) : (
              <Link
                to={item.to}
                className="hover:text-emerald-600 transition-colors"
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
