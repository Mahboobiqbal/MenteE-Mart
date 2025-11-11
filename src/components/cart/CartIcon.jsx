import React from "react";
import { ShoppingCart, X } from "lucide-react";
import { useCart } from "../../hooks/useCart";

const CartIcon = () => {
  const { totalItems, isOpen, toggleCart, closeCart } = useCart();

  return (
    <div className="relative">
      {/* Cart Button */}
      <button
        onClick={toggleCart}
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

      {/* Mobile Close Button (when cart is open) */}
      {isOpen && (
        <div className="md:hidden fixed top-4 right-4 z-50">
          <button
            onClick={closeCart}
            className="p-2 bg-white rounded-full shadow-lg text-gray-700 hover:text-emerald-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CartIcon;
