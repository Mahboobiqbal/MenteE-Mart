import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  MessageCircle,
  CheckCircle,
  Clock,
  Package,
  Truck,
  XCircle,
  Eye,
  Edit,
  Phone,
  MapPin,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import {
  getAllOrders,
  getOrdersByStore,
  getStoreById,
  updateOrderStatus,
  getStoreWhatsAppUrl,
} from "../../utils/storeManagement";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    loadOrdersAndStores();
  }, [selectedStore]);

  const loadOrdersAndStores = async () => {
    try {
      setLoading(true);
      let ordersData, storesData;

      if (selectedStore === "all") {
        ordersData = await getAllOrders();
        // Get unique stores from orders
        const uniqueStores = [
          ...new Set(
            ordersData
              .map((order) =>
                order.stores
                  ? {
                      id: order.stores.id,
                      name: order.stores.name,
                      whatsapp_number: order.stores.whatsapp_number,
                    }
                  : null
              )
              .filter(Boolean)
          ),
        ];
        setStores(uniqueStores);
      } else {
        ordersData = await getOrdersByStore(selectedStore);
        const storeData = await getStoreById(selectedStore);
        setStores(storeData ? [storeData] : []);
      }

      setOrders(ordersData);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      await loadOrdersAndStores();
    } catch (error) {
      alert("Error updating order status: " + error.message);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_first_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.customer_last_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.customer_phone.includes(searchTerm) ||
      order.stores?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount) => {
    return `₨${Number(amount).toLocaleString()}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "confirmed":
      case "processing":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "shipped":
        return <Truck className="w-4 h-4 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusCounts = () => {
    return orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
  };

  const showOrderDetailsModal = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600">
            {selectedStore === "all"
              ? "Manage orders across all stores"
              : `Orders for ${stores[0]?.name}`}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">
            {filteredOrders.length} orders
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Orders
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Order number, customer, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store
            </label>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Stores</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          "pending",
          "confirmed",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
        ].map((status) => {
          const count = getStatusCounts()[status] || 0;
          return (
            <div
              key={status}
              onClick={() =>
                setStatusFilter(statusFilter === status ? "all" : status)
              }
              className={`bg-white rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                statusFilter === status
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                {getStatusIcon(status)}
                <span className="text-2xl font-bold text-gray-900">
                  {count}
                </span>
              </div>
              <p className="text-sm text-gray-600 capitalize">{status}</p>
            </div>
          );
        })}
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Orders</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Order Info */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-900">
                        {order.order_number}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()} at{" "}
                      {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Store: {order.stores?.name}
                    </p>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {order.customer_first_name} {order.customer_last_name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {order.customer_phone}
                      </span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="text-sm text-gray-600 line-clamp-2">
                        {order.shipping_address}
                      </span>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      {order.order_items?.length || 0} item(s)
                    </p>
                    <div className="space-y-1">
                      {order.order_items?.slice(0, 2).map((item, index) => (
                        <p key={index} className="text-sm text-gray-700">
                          {item.products?.name} × {item.quantity}
                        </p>
                      ))}
                      {order.order_items?.length > 2 && (
                        <p className="text-sm text-gray-500">
                          +{order.order_items.length - 2} more items
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Amount & Actions */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 mb-2">
                      {formatCurrency(order.total_amount)}
                    </p>
                    <p className="text-sm text-gray-500 mb-3">
                      Commission: {formatCurrency(order.commission_amount)}
                    </p>
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => showOrderDetailsModal(order)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <a
                        href={getStoreWhatsAppUrl(order.stores, order)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Message store"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                      <div className="relative group">
                        <button className="p-2 text-gray-400 hover:text-emerald-600 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                          <div className="p-2">
                            <p className="text-xs text-gray-500 mb-2">
                              Update Status
                            </p>
                            {[
                              "pending",
                              "confirmed",
                              "processing",
                              "shipped",
                              "delivered",
                              "cancelled",
                            ].map((status) => (
                              <button
                                key={status}
                                onClick={() =>
                                  handleStatusUpdate(order.id, status)
                                }
                                className={`block w-full text-left px-3 py-1 text-sm rounded transition-colors ${
                                  order.status === status
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "text-gray-700 hover:bg-gray-100"
                                }`}
                                disabled={order.status === status}
                              >
                                {status.charAt(0).toUpperCase() +
                                  status.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== "all"
                ? "No orders match your current filters."
                : "Orders will appear here when customers place them."}
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Order Details - {selectedOrder.order_number}
                </h2>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">
                      {selectedOrder.customer_first_name}{" "}
                      {selectedOrder.customer_last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">
                      {selectedOrder.customer_phone}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">
                      {selectedOrder.shipping_address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Order Items
                </h3>
                <div className="space-y-3">
                  {selectedOrder.order_items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {item.products?.image_url && (
                          <img
                            src={item.products.image_url}
                            alt={item.products.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium">{item.products?.name}</p>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-medium">
                        {formatCurrency(item.total_price)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Payment Summary
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commission ({selectedOrder.commission_rate}%):</span>
                    <span className="text-emerald-600 font-medium">
                      {formatCurrency(selectedOrder.commission_amount)}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.order_notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Order Notes
                  </h3>
                  <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg">
                    {selectedOrder.order_notes}
                  </p>
                </div>
              )}

              {selectedOrder.admin_notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Admin Notes
                  </h3>
                  <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                    {selectedOrder.admin_notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
