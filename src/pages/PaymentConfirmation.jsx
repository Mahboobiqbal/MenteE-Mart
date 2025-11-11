import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  CheckCircle,
  Copy,
  Phone,
  CreditCard,
  Clock,
  AlertCircle,
} from "lucide-react";

const PaymentConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    if (!location.state || !location.state.order) {
      navigate("/products");
      return;
    }
    setOrderData(location.state.order);
  }, [location.state, navigate]);

  const easypaisaAccountNumber =
    import.meta.env.VITE_EASYPAISA_ACCOUNT_NUMBER || "03XX-XXXXXXX";
  const storeName = import.meta.env.VITE_STORE_NAME || "Your Store";
  const storePhone = import.meta.env.VITE_STORE_PHONE || "03XX-XXXXXXX";

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const paymentInstructions = [
    "Open Easypaisa Mobile App",
    "Go to Send Money",
    `Enter account number: ${easypaisaAccountNumber}`,
    `Enter amount: ₨${Number(orderData?.total_amount || 0).toLocaleString()}`,
    `Add reference: ${orderData?.order_number || "ORD-XXXXXX"}`,
    "Complete the transaction",
    "Take a screenshot of the receipt",
  ];

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-lg text-gray-600">
            Order #{orderData.order_number} has been created and is pending
            payment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Order Details
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-semibold text-gray-900">
                  {orderData.order_number}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span className="text-gray-900">
                  {new Date(orderData.created_at).toLocaleDateString("en-PK", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="text-gray-900">
                  {orderData.customer_first_name} {orderData.customer_last_name}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Contact:</span>
                <span className="text-gray-900">
                  {orderData.customer_phone}
                </span>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Amount:</span>
                  <span className="text-emerald-600">
                    ₨{Number(orderData.total_amount).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Items Ordered
              </h3>
              <div className="space-y-2">
                {orderData.order_items?.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.product_name} (x{item.quantity})
                    </span>
                    <span className="text-gray-900">
                      ₨{Number(item.total_price).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-6 h-6 mr-2 text-emerald-600" />
              Pay with Easypaisa
            </h2>

            {/* Account Details */}
            <div className="bg-emerald-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-emerald-900 mb-2">
                Payment Account
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-700">Account Number:</span>
                  <div className="flex items-center space-x-2">
                    <code className="bg-white px-2 py-1 rounded text-emerald-900 font-mono">
                      {easypaisaAccountNumber}
                    </code>
                    <button
                      onClick={() => copyToClipboard(easypaisaAccountNumber)}
                      className="p-1 text-emerald-600 hover:text-emerald-700"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-700">Account Title:</span>
                  <span className="text-emerald-900 font-semibold">
                    {storeName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-700">Amount to Pay:</span>
                  <span className="text-emerald-900 font-bold text-lg">
                    ₨{Number(orderData.total_amount).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Step by Step Instructions */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">How to Pay:</h3>
              <ol className="space-y-2">
                {paymentInstructions.map((instruction, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 text-sm">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Copy Amount Button */}
            <button
              onClick={() => copyToClipboard(orderData.total_amount.toString())}
              className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-emerald-700 transition-colors mb-4"
            >
              {copied ? "Copied!" : "Copy Amount"}
            </button>

            {/* Important Notes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">
                    Important:
                  </h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Pay the exact amount shown above</li>
                    <li>• Include your order number in the reference</li>
                    <li>• Take a screenshot of the payment receipt</li>
                    <li>• Keep the transaction ID for verification</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-6 h-6 mr-2 text-blue-600" />
            What happens next?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Make Payment</h3>
              <p className="text-sm text-gray-600">
                Pay using Easypaisa following the instructions above
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Contact Us</h3>
              <p className="text-sm text-gray-600">
                Call or WhatsApp us with your payment receipt
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Order Confirmed
              </h3>
              <p className="text-sm text-gray-600">
                We'll verify payment and confirm your order
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-6 bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3 text-center">
            Need Help?
          </h3>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8">
            <a
              href={`tel:${storePhone}`}
              className="flex items-center text-emerald-600 hover:text-emerald-700"
            >
              <Phone className="w-4 h-4 mr-2" />
              {storePhone}
            </a>
            <a
              href={`https://wa.me/${storePhone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-emerald-600 hover:text-emerald-700"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" />
              </svg>
              WhatsApp Us
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <Link
            to="/track-order"
            className="px-6 py-3 border-2 border-emerald-600 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-600 hover:text-white transition-colors text-center"
          >
            Track Your Order
          </Link>
          <Link
            to="/products"
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors text-center"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Success Message */}
        {copied && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
            Copied to clipboard!
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentConfirmation;
