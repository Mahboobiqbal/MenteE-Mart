import React from "react";
import { useNavigate } from "react-router-dom";

const QuickCategories = () => {
  const navigate = useNavigate();

  const categories = [
    {
      name: "Shawals — Men's",
      emoji: "👕",
      color: "#008060",
      description: "Traditional men's wear",
      productCount: 3,
    },
    {
      name: "Shawals — Women's",
      emoji: "👗",
      color: "#FFD700",
      description: "Elegant women's fashion",
      productCount: 4,
    },
    {
      name: "Citrale Caps",
      emoji: "🧢",
      color: "#008060",
      description: "Stylish caps & accessories",
      productCount: 2,
    },
    {
      name: "Peshawar Chappals",
      emoji: "👞",
      color: "#333333",
      description: "Traditional footwear",
      productCount: 4,
    },
  ];

  const handleCategoryClick = (categoryName) => {
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <section className="mt-8">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-[#333333]">Shop by Category</h2>
        <p className="text-sm text-gray-600">
          Find exactly what you're looking for
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => handleCategoryClick(category.name)}
            className="p-6 rounded-xl border-2 border-transparent hover:border-[#008060] transition-all duration-300 group hover:shadow-lg transform hover:-translate-y-1"
            style={{
              background: `linear-gradient(135deg, ${category.color}10 0%, white 50%)`,
            }}
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
              {category.emoji}
            </div>
            <h3
              className="font-bold text-sm leading-tight mb-2"
              style={{ color: category.color }}
            >
              {category.name}
            </h3>
            <p className="text-xs text-gray-600 mb-2">{category.description}</p>
            <div
              className="inline-block px-2 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: `${category.color}20`,
                color: category.color,
              }}
            >
              {category.productCount} products
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default QuickCategories;
