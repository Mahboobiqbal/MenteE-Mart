import React, { useState, useEffect } from "react";
import {
  Package,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Truck,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Clock,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Store,
} from "lucide-react";
import supabase from "../../utils/supabase";
import {
  getOrderStatusColor,
  getOrderStatusText,
  updateOrderStatus,
  verifyPayment,
} from "../../utils/orderUtils";
import {
  generateWhatsAppUrl,
  getStoreContactUrl,
} from "../../utils/whatsappMessages";

const EnhancedOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [storeFilter, setStoreFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showPaymentVerification, setShowPaymentVerification] = useState(false);
  const [verificationData, setVerificationData] = useState({
    transactionId: "",
    adminNotes: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const statusOptions = [
    { value: "all", label: "All Orders" },
    { value: "pending", label: "Pending Payment" },
    { value: "confirmed", label: "Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  // Available stores from environment or data
  const storeOptions = [
    { value: "all", label: "All Stores" },
    { value: "Mena Bazar", label: "Mena Bazar Store" },
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          customers(*),
          order_items(*),
          payment_records(*)
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      alert("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on search, status, and store
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_first_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.customer_last_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    // Filter by store based on first item's store
    const orderStore = order.order_items?.[0]?.product_store || "Default";
    const matchesStore = storeFilter === "all" || orderStore === storeFilter;

    return matchesSearch && matchesStatus && matchesStore;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const handleStatusUpdate = async (orderId, newStatus, adminNotes = null) => {
    try {
      await updateOrderStatus(orderId, newStatus, adminNotes);
      await fetchOrders();
      alert("Order status updated successfully");
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    }
  };

  const handlePaymentVerification = async (orderId) => {
    if (!verificationData.transactionId.trim()) {
      alert("Transaction ID is required");
      return;
    }

    try {
      await verifyPayment(
        orderId,
        verificationData.transactionId,
        verificationData.adminNotes
      );
      await fetchOrders();
      setShowPaymentVerification(false);
      setVerificationData({ transactionId: "", adminNotes: "" });
      alert("Payment verified and order confirmed successfully");
    } catch (error) {
      console.error("Error verifying payment:", error);
      alert("Failed to verify payment");
    }
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const openPaymentVerification = (order) => {
    setSelectedOrder(order);
    setShowPaymentVerification(true);
  };

  const sendWhatsAppMessage = (order, messageType) => {
    const whatsappUrl = generateWhatsAppUrl(order, messageType);
    window.open(whatsappUrl, "_blank");
  };

  const openStoreContact = (storeName) => {
    const contactUrl = getStoreContactUrl(storeName);
    window.open(contactUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Enhanced Order Management
          </h1>
          <p className="text-gray-600">
            Manage and track all customer orders with store-specific features
          </p>
        </div>

        {/* Store Contact Quick Access */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Store className="w-5 h-5 mr-2" />
            Store Contacts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => openStoreContact("Mena Bazar")}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Store className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Mena Bazar Store</div>
                  <div className="text-sm text-gray-500">923472886228</div>
                </div>
              </div>
              <MessageCircle className="w-5 h-5 text-green-600" />
            </button>

          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {orders.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {orders.filter((o) => o.status === "pending").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {orders.filter((o) => o.status === "delivered").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-emerald-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  ₨
                  {orders
                    .reduce((sum, o) => sum + Number(o.total_amount), 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1); // Reset to first page
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Store Filter */}
              <div className="flex items-center space-x-2">
                <Store className="w-5 h-5 text-gray-400" />
                <select
                  value={storeFilter}
                  onChange={(e) => {
                    setStoreFilter(e.target.value);
                    setCurrentPage(1); // Reset to first page
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {storeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}-
              {Math.min(endIndex, filteredOrders.length)} of{" "}
              {filteredOrders.length} orders
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Store
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentOrders.map((order) => {
                  const orderStore =
                    order.order_items?.[0]?.product_store || "Default";
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            #{order.order_number}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.order_items?.length || 0} item(s)
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.customer_first_name}{" "}
                            {order.customer_last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.customer_email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.customer_phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Store className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {orderStore}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ₨{Number(order.total_amount).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.payment_method}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOrderStatusColor(
                            order.status
                          )}`}
                        >
                          {getOrderStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openOrderDetails(order)}
                            className="text-emerald-600 hover:text-emerald-900"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {order.status === "pending" && (
                            <button
                              onClick={() => openPaymentVerification(order)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Verify Payment"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                          )}

                          {/* WhatsApp Message Buttons */}
                          <div className="relative group">
                            <button
                              className="text-green-600 hover:text-green-900"
                              title="Send WhatsApp Message"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                            <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-40">
                              <button
                                onClick={() =>
                                  sendWhatsAppMessage(order, "confirmed")
                                }
                                className="block w-full text-left px-3 py-1 text-xs hover:bg-gray-100 rounded"
                                disabled={order.status !== "confirmed"}
                              >
                                Confirm Order
                              </button>
                              <button
                                onClick={() =>
                                  sendWhatsAppMessage(order, "processing")
                                }
                                className="block w-full text-left px-3 py-1 text-xs hover:bg-gray-100 rounded"
                                disabled={order.status !== "processing"}
                              >
                                Processing
                              </button>
                              <button
                                onClick={() =>
                                  sendWhatsAppMessage(order, "shipped")
                                }
                                className="block w-full text-left px-3 py-1 text-xs hover:bg-gray-100 rounded"
                                disabled={order.status !== "shipped"}
                              >
                                Shipped
                              </button>
                              <button
                                onClick={() =>
                                  sendWhatsAppMessage(order, "delivered")
                                }
                                className="block w-full text-left px-3 py-1 text-xs hover:bg-gray-100 rounded"
                                disabled={order.status !== "delivered"}
                              >
                                Delivered
                              </button>
                            </div>
                          </div>

                          {/* Status Update */}
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusUpdate(order.id, e.target.value)
                            }
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 border rounded-lg text-sm font-medium ${
                      currentPage === pageNum
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== "all" || storeFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Orders will appear here when customers place them"}
            </p>
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setShowOrderDetails(false)}
            onWhatsAppMessage={sendWhatsAppMessage}
          />
        )}

        {/* Payment Verification Modal */}
        {showPaymentVerification && selectedOrder && (
          <PaymentVerificationModal
            order={selectedOrder}
            verificationData={verificationData}
            setVerificationData={setVerificationData}
            onVerify={handlePaymentVerification}
            onClose={() => {
              setShowPaymentVerification(false);
              setVerificationData({ transactionId: "", adminNotes: "" });
            }}
          />
        )}
      </div>
    </div>
  );
};

// Order Details Modal Component (Enhanced with WhatsApp)
const OrderDetailsModal = ({ order, onClose, onWhatsAppMessage }) => {
  const orderStore = order.order_items?.[0]?.product_store || "Default";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Order #{order.order_number}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          {/* WhatsApp Quick Actions */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-green-600" />
              Quick WhatsApp Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                onClick={() => onWhatsAppMessage(order, "confirmed")}
                disabled={order.status !== "confirmed"}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm
              </button>
              <button
                onClick={() => onWhatsAppMessage(order, "processing")}
                disabled={order.status !== "processing"}
                className="px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Processing
              </button>
              <button
                onClick={() => onWhatsAppMessage(order, "shipped")}
                disabled={order.status !== "shipped"}
                className="px-3 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Shipped
              </button>
              <button
                onClick={() => onWhatsAppMessage(order, "delivered")}
                disabled={order.status !== "delivered"}
                className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delivered
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Customer Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="font-medium">
                    {order.customer_first_name} {order.customer_last_name}
                  </span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{order.customer_email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{order.customer_phone}</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                  <span>{order.shipping_address}</span>
                </div>
              </div>
            </div>

            {/* Order Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Order Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date:</span>
                  <span>{new Date(order.created_at).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Store:</span>
                  <span className="flex items-center">
                    <Store className="w-4 h-4 mr-1" />
                    {orderStore}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getOrderStatusColor(
                      order.status
                    )}`}
                  >
                    {getOrderStatusText(order.status)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span>{order.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className="capitalize">{order.payment_status}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-900">Total Amount:</span>
                  <span className="text-emerald-600">
                    ₨{Number(order.total_amount).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Store
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.order_items?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {item.product_name}
                        </div>
                        {item.product_category && (
                          <div className="text-xs text-gray-500">
                            {item.product_category}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div className="flex items-center">
                          <Store className="w-3 h-3 mr-1" />
                          {item.product_store}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        ₨{Number(item.unit_price).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        ₨{Number(item.total_price).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Notes */}
          {order.order_notes && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-2">Order Notes</h3>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                {order.order_notes}
              </p>
            </div>
          )}

          {/* Admin Notes */}
          {order.admin_notes && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Admin Notes</h3>
              <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                {order.admin_notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Payment Verification Modal Component (unchanged)
const PaymentVerificationModal = ({
  order,
  verificationData,
  setVerificationData,
  onVerify,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Verify Payment</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Order #{order.order_number} - ₨
              {Number(order.total_amount).toLocaleString()}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction ID *
              </label>
              <input
                type="text"
                value={verificationData.transactionId}
                onChange={(e) =>
                  setVerificationData((prev) => ({
                    ...prev,
                    transactionId: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter transaction ID"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes (Optional)
              </label>
              <textarea
                value={verificationData.adminNotes}
                onChange={(e) =>
                  setVerificationData((prev) => ({
                    ...prev,
                    adminNotes: e.target.value,
                  }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Any additional notes..."
              />
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onVerify(order.id)}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Verify Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedOrderManagement;
