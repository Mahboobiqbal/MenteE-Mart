import React from "react";
import { useCart } from "../../hooks/useCart";
import { ShoppingBag, Package, Truck, Shield } from "lucide-react";

const CartSummary = () => {
  const { items, totalItems, totalPrice } = useCart();

  const formatPrice = (price) => {
    return `₨${Number(price).toLocaleString()}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <ShoppingBag className="w-5 h-5 mr-2 text-emerald-600" />
        Order Summary
      </h3>

      {/* Cart Items */}
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.id} className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Package className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {item.name}
              </h4>
              <p className="text-sm text-gray-500">
                Qty: {item.quantity} × {formatPrice(item.price)}
              </p>
              {item.category && (
                <p className="text-xs text-gray-400">{item.category}</p>
              )}
            </div>

            <div className="text-sm font-medium text-gray-900">
              {formatPrice(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Breakdown */}
      <div className="border-t border-gray-200 pt-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal ({totalItems} items)</span>
          <span className="text-gray-900">{formatPrice(totalPrice)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="text-green-600 font-medium">Free</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="text-gray-600">Included</span>
        </div>

        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span className="text-emerald-600">{formatPrice(totalPrice)}</span>
          </div>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
        <div className="flex items-start space-x-3">
          <Truck className="w-5 h-5 text-emerald-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-emerald-900">
              Delivery Information
            </h4>
            <p className="text-xs text-emerald-700 mt-1">
              • Free delivery across Pakistan
              <br />
              • Estimated delivery: 2-5 business days
              <br />• Cash on Delivery available in major cities
            </p>
          </div>
        </div>
      </div>

      {/* Security Badge */}
      <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-500">
        <Shield className="w-4 h-4" />
        <span>Secure checkout with SSL encryption</span>
      </div>

      {/* Payment Method Notice */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-1">
          Payment Method
        </h4>
        <p className="text-xs text-blue-700">
          You will receive Easypaisa payment instructions after placing your
          order. Pay securely using your mobile wallet or bank account.
        </p>
      </div>

      {/* Continue Shopping Link */}
      <div className="mt-6 text-center">
        <a
          href="/products"
          className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
        >
          Continue Shopping
        </a>
      </div>
    </div>
  );
};

export default CartSummary;
