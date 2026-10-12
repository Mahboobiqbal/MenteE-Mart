import React from "react";
import { Link } from "react-router-dom";

const emerald = "#008060";
const _yellow = "#FFD700";
const _white = "#FFFFFF";
const charcoal = "#333333";

const ProductTile = ({ product }) => {
  const { id, name, price, image, rating = 4.5 } = product || {};
  const pricePKR = new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(price || 0);

  return (
    <Link
      to={id ? `/product/${id}` : "#"}
      className="min-w-[260px] max-w-[260px] bg-white rounded-xl border overflow-hidden hover:shadow-sm transition"
      style={{ borderColor: `${charcoal}1a` }}
      onClick={(e) => !id && e.preventDefault()}
    >
      <div className="w-full h-40 bg-gray-50 overflow-hidden">
        <img src={image} alt={name} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="p-3">
        <h4 className="text-sm font-semibold line-clamp-2" style={{ color: charcoal }}>{name}</h4>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[13px]" style={{ color: `${charcoal}b3` }}>⭐ {Number(rating).toFixed(1)}</span>
          <span className="text-sm font-bold" style={{ color: charcoal }}>{pricePKR}</span>
        </div>
      </div>
      <div className="h-1" style={{ backgroundColor: emerald }} />
    </Link>
  );
};

export default ProductTile;