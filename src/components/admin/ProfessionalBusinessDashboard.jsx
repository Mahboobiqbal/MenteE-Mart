import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Store,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Users,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Target,
  BarChart3,
  MessageCircle,
  Download,
  Filter,
  RefreshCw,
  ArrowUpRight,
  Eye,
  MoreVertical,
} from "lucide-react";
import supabase from "../../utils/supabase";
import {
  getAllStoreConfigs,
  getStoreWhatsAppUrl,
  calculateStoreAnalytics,
} from "../../utils/storeConfig";
import AdminLayout from "./AdminLayout";

const ProfessionalBusinessDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (orders.length > 0 && stores.length > 0) {
      calculateAnalytics();
    }
  }, [orders, stores]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load orders with related data
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items(*),
          payment_records(*)
        `
        )
        .order("created_at", { ascending: false });

      if (ordersError) {
        console.error("Error loading orders:", ordersError);
        throw ordersError;
      }

      // Load store configurations from database
      const storeConfigs = await getAllStoreConfigs();
      setStores(storeConfigs);
      setOrders(ordersData || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = async () => {
    try {
      const analyticsData = await calculateStoreAnalytics(orders, stores);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error("Error calculating analytics:", error);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "confirmed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "processing":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "shipped":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "delivered":
        return "bg-green-50 text-green-700 border-green-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getOrderStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "processing":
        return <Package className="w-4 h-4" />;
      case "shipped":
        return <TrendingUp className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleTransferToStore = (order) => {
    // Get store name from order items (use product.store from database)
    const orderStore = order.order_items?.[0]?.product_store || "MenteE";
    const whatsappUrl = getStoreWhatsAppUrl(orderStore, order);
    window.open(whatsappUrl, "_blank");
  };

  const exportData = () => {
    if (!analytics) return;

    const csvData = [
      [
        "Order Number",
        "Store",
        "Customer",
        "Phone",
        "Amount",
        "Status",
        "Date",
        "WhatsApp",
      ],
      ...orders.map((order) => {
        const orderStore = order.order_items?.[0]?.product_store || "MenteE";
        const storeConfig = stores.find((s) => s.store_name === orderStore);
        return [
          order.order_number,
          orderStore,
          `${order.customer_first_name} ${order.customer_last_name}`,
          order.customer_phone,
          order.total_amount,
          order.status,
          new Date(order.created_at).toLocaleDateString(),
          storeConfig?.whatsapp_number || "N/A",
        ];
      }),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `business-report-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <AdminLayout title="Business Dashboard">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading business data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Business Dashboard">
      <div className="p-6">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Business Overview
            </h2>
            <p className="text-gray-600 mt-1">
              Real-time analytics for your store network
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <button
              onClick={exportData}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {analytics && (
          <>
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Sales
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(analytics.overall.totalSales)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-emerald-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>All stores combined</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Commission Earned
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(analytics.overall.totalCommission)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-blue-600">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  <span>5% per store</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Orders
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.overall.totalOrders}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-50">
                    <ShoppingCart className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-purple-600">
                  <Package className="w-4 h-4 mr-1" />
                  <span>All store orders</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Pending Orders
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.overall.pendingOrders}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-orange-50">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-orange-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  <span>Require attention</span>
                </div>
              </div>
            </div>

            {/* Store Performance Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {Object.entries(analytics.storeAnalytics).map(
                ([storeName, data]) => (
                  <div
                    key={storeName}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 rounded-lg bg-emerald-50">
                            <Store className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {storeName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Commission: {data.commission_rate}%
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              handleTransferToStore(
                                orders.find(
                                  (o) =>
                                    o.order_items?.[0]?.product_store ===
                                    storeName
                                )
                              )
                            }
                            className="flex items-center px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            WhatsApp
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Sales</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(data.sales)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Commission</p>
                          <p className="text-lg font-semibold text-blue-600">
                            {formatCurrency(data.commission)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Orders</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {data.orders}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Pending</p>
                          <p className="text-lg font-semibold text-orange-600">
                            {data.pendingOrders}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">WhatsApp:</span>
                          <span className="text-gray-900 font-medium">
                            {data.whatsapp_number}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="text-gray-600">Avg Order:</span>
                          <span className="text-gray-900 font-medium">
                            {formatCurrency(data.averageOrderValue)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Recent Orders
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Latest orders across all stores
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Filter className="w-4 h-4 text-gray-400" />
                      <select className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        <option value="all">All Stores</option>
                        {stores.map((store) => (
                          <option
                            key={store.store_name}
                            value={store.store_name}
                          >
                            {store.store_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Link
                      to="/admin/orders"
                      className="flex items-center px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View All
                    </Link>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Store
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
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
                    {orders.slice(0, 10).map((order) => {
                      const orderStore =
                        order.order_items?.[0]?.product_store || "MenteE";

                      return (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-900">
                                {order.order_number}
                              </p>
                              <p className="text-gray-500">
                                {new Date(
                                  order.created_at
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center">
                              <Store className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-gray-900">
                                {orderStore}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-900">
                                {order.customer_first_name}{" "}
                                {order.customer_last_name}
                              </p>
                              <p className="text-gray-500">
                                {order.customer_phone}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {formatCurrency(Number(order.total_amount))}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium border ${getOrderStatusColor(
                                order.status
                              )}`}
                            >
                              {getOrderStatusIcon(order.status)}
                              <span className="ml-1.5 capitalize">
                                {order.status}
                              </span>
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => handleTransferToStore(order)}
                              className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-colors"
                              title="Send to store via WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {orders.length === 0 && (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No orders found</p>
                  <p className="text-gray-400 text-sm">
                    Orders will appear here when customers make purchases
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default ProfessionalBusinessDashboard;
