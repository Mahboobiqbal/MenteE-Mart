import { useContext } from "react";
import CartContext from "../context/CartContext";

// Custom hook to use cart context
export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}

export default useCart;
