import React, { useState } from "react";
import { usenavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Package,
  CheckCircle,
  Truck,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import {
  getOrderByNumber,
  getOrderStatusColor,
  getOrderStatusText,
} from "../utils/orderUtils";

const OrderTracking = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = usenavigate();
  const [orderNumber, setOrderNumber] = useState(
    searchParams.get("order") || ""
  );
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      setError("Please enter an order number");
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const orderData = await getOrderByNumber(orderNumber.trim());
      setOrder(orderData);
    } catch (error) {
      console.error("Error fetching order:", error);
      setError(
        "Order not found. Please check your order number and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Package className="w-6 h-6 text-yellow-600" />;
      case "confirmed":
        return <CheckCircle className="w-6 h-6 text-blue-600" />;
      case "processing":
        return <Package className="w-6 h-6 text-purple-600" />;
      case "shipped":
        return <Truck className="w-6 h-6 text-indigo-600" />;
      case "delivered":
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      default:
        return <Package className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusSteps = (currentStatus) => {
    const steps = [
      {
        status: "pending",
        label: "Order Placed",
        description: "Your order has been received",
      },
      {
        status: "confirmed",
        label: "Order Confirmed",
        description: "Payment verified and order confirmed",
      },
      {
        status: "processing",
        label: "Processing",
        description: "Preparing your order for shipment",
      },
      {
        status: "shipped",
        label: "Shipped",
        description: "Order is on its way",
      },
      {
        status: "delivered",
        label: "Delivered",
        description: "Order has been delivered",
      },
    ];

    const statusOrder = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
    ];
    const currentindex = statusOrder.indexOf(currentStatus);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentindex,
      active: index === currentindex,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Track Your Order
          </h1>
          <p className="text-lg text-gray-600">
            Enter your order number to check the status of your purchase
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Number
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Enter your order number (e.g., ORD123456)"
                  className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Searching..." : "Track Order"}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Order Not Found State */}
        {!order && !loading && !error && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Track your order
            </h3>
            <p className="text-gray-500">
              Enter your order number above to see real-time updates on your
              order status
            </p>
          </div>
        )}

        {/* Order Found */}
        {order && (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Order #{order.order_number}
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${getOrderStatusColor(
                    order.status
                  )}`}
                >
                  {getOrderStatusText(order.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(order.created_at).toLocaleDateString("en-PK", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-semibold text-gray-900">
                    ₨{Number(order.total_amount).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {order.payment_method}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Items</p>
                  <p className="font-semibold text-gray-900">
                    {order.order_items?.length || 0} item(s)
                  </p>
                </div>
              </div>
            </div>

            {/* Order Status Timeline */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Order Progress
              </h3>

              <div className="space-y-4">
                {getStatusSteps(order.status).map((step, index) => (
                  <div key={step.status} className="flex items-start space-x-4">
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        step.completed ? "bg-emerald-100" : "bg-gray-100"
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                      ) : (
                        getStatusIcon(step.status)
                      )}
                    </div>

                    <div className="flex-1">
                      <h4
                        className={`font-semibold ${
                          step.completed ? "text-emerald-900" : "text-gray-900"
                        }`}
                      >
                        {step.label}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {step.description}
                      </p>

                      {/* Add specific timestamps for completed steps */}
                      {step.completed && (
                        <p className="text-xs text-gray-500 mt-1">
                          {step.status === "pending" &&
                            new Date(order.created_at).toLocaleString()}
                          {step.status === "confirmed" &&
                            order.confirmed_at &&
                            new Date(order.confirmed_at).toLocaleString()}
                          {step.status === "shipped" &&
                            order.shipped_at &&
                            new Date(order.shipped_at).toLocaleString()}
                          {step.status === "delivered" &&
                            order.delivered_at &&
                            new Date(order.delivered_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Items
              </h3>

              <div className="space-y-4">
                {order.order_items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-16 h-16 bg-white rounded-lg overflow-hidden">
                      {item.product_image_url ? (
                        <img
                          src={item.product_image_url}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {item.product_name}
                      </h4>
                      {item.product_category && (
                        <p className="text-sm text-gray-600">
                          {item.product_category}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity} × ₨
                        {Number(item.unit_price).toLocaleString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ₨{Number(item.total_price).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Delivery Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Customer Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="font-medium">
                        {order.customer_first_name} {order.customer_last_name}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {order.customer_email}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {order.customer_phone}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Shipping Address
                  </h4>
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5" />
                    {order.shipping_address}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            {order.payment_records && order.payment_records.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Payment Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-semibold text-gray-900 capitalize">
                      {order.payment_records[0].payment_method}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <p className="font-semibold text-gray-900 capitalize">
                      {order.payment_records[0].status}
                    </p>
                  </div>
                  {order.payment_records[0].transaction_id && (
                    <div>
                      <p className="text-sm text-gray-600">Transaction ID</p>
                      <p className="font-mono text-sm text-gray-900">
                        {order.payment_records[0].transaction_id}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Amount Paid</p>
                    <p className="font-semibold text-emerald-600">
                      ₨
                      {Number(
                        order.payment_records[0].payment_amount
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Order Notes */}
            {order.order_notes && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Order Notes
                </h3>
                <p className="text-gray-700">{order.order_notes}</p>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-emerald-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-emerald-900 mb-3">
                Need Help?
              </h3>
              <p className="text-emerald-700 mb-4">
                If you have any questions about your order, please contact us:
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0">
                <a
                  href="tel:+923472886228"
                  className="flex items-center text-emerald-600 hover:text-emerald-700"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  +92 300 1234567
                </a>
                <a
                  href="mailto:orders@yourstore.com"
                  className="flex items-center text-emerald-600 hover:text-emerald-700"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  orders@yourstore.com
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;


