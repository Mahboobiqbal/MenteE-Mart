import React from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../../hooks/useCart";

const CartIcon = () => {
  const { totalItems, openCart } = useCart();

  return (
    <div className="relative">
      {/* Cart Button */}
      <button
        onClick={openCart}
        className="relative p-2 text-gray-700 hover:text-emerald-600 transition-colors"
        aria-label={`Shopping cart with ${totalItems} items`}
      >
        <ShoppingCart className="w-6 h-6" />

        {/* Cart Item Count Badge */}
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {totalItems > 99 ? "99+" : totalItems}
          </span>
        )}
      </button>


    </div>
  );
};

export default CartIcon;
