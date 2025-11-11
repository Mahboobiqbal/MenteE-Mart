import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import CustomerForm from "./CustomerForm";
import CartSummary from "./CartSummary";
import { createOrder } from "../../utils/orderUtils";

const CheckoutForm = () => {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState({
    customer: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      alternatePhone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      stateProvince: "",
      postalCode: "",
      country: "Pakistan",
      areaId: "",
    },
    orderNotes: "",
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate("/products");
    }
  }, [items, navigate]);

  const handleCustomerFormSubmit = (customerData) => {
    setOrderData((prev) => ({
      ...prev,
      customer: customerData,
    }));
    setStep(2);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    try {
      const order = await createOrder({
        items,
        customer: orderData.customer,
        orderNotes: orderData.orderNotes,
        totalAmount: totalPrice,
        totalItems,
        areaId: orderData.customer.areaId,
      });

      // Clear cart and redirect to payment confirmation
      clearCart();
      navigate("/payment-confirmation", {
        state: {
          order,
          orderNumber: order.order_number,
        },
      });
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setStep(1);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-8">
            Add some products to your cart to proceed with checkout.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <div className="flex items-center space-x-4">
            <div
              className={`flex items-center space-x-2 ${
                step >= 1 ? "text-emerald-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= 1 ? "bg-emerald-600 text-white" : "bg-gray-200"
                }`}
              >
                1
              </div>
              <span>Delivery Information</span>
            </div>
            <div
              className={`w-8 h-0.5 ${
                step >= 2 ? "bg-emerald-600" : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`flex items-center space-x-2 ${
                step >= 2 ? "text-emerald-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= 2 ? "bg-emerald-600 text-white" : "bg-gray-200"
                }`}
              >
                2
              </div>
              <span>Review & Pay</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Delivery Information
                </h2>
                <CustomerForm onSubmit={handleCustomerFormSubmit} />
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Review Your Order
                  </h2>
                  <button
                    onClick={goBack}
                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    ← Edit Information
                  </button>
                </div>

                <form onSubmit={handlePlaceOrder} className="space-y-6">
                  {/* Order Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      value={orderData.orderNotes}
                      onChange={(e) =>
                        setOrderData((prev) => ({
                          ...prev,
                          orderNotes: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Any special instructions for delivery..."
                    />
                  </div>

                  {/* Customer Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Delivery Details
                    </h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        {orderData.customer.firstName}{" "}
                        {orderData.customer.lastName}
                      </p>
                      <p>{orderData.customer.email}</p>
                      <p>{orderData.customer.phone}</p>
                      <p>{orderData.customer.addressLine1}</p>
                      {orderData.customer.addressLine2 && (
                        <p>{orderData.customer.addressLine2}</p>
                      )}
                      <p>
                        {orderData.customer.city},{" "}
                        {orderData.customer.stateProvince}
                      </p>
                      {orderData.customer.postalCode && (
                        <p>{orderData.customer.postalCode}</p>
                      )}
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? "Processing Order..."
                      : `Place Order - ₨${Number(totalPrice).toLocaleString()}`}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    By placing this order, you agree to our terms and
                    conditions. You will be provided with payment instructions
                    after order confirmation.
                  </p>
                </form>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <CartSummary areaId={orderData.customer.areaId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
