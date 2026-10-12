import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Store,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Users,
  Package,
  Eye,
  MousePointer,
  Settings,
  Plus,
  MessageCircle,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Target,
  BarChart3,
} from "lucide-react";
import supabase from "../utils/supabase";
import { getStoreWhatsAppUrl } from "../utils/storeConfig";

const EnhancedAdminDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
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

      if (ordersError) throw ordersError;

      // Load store configurations
      const { data: storesData } = await supabase
        .from("store_configurations")
        .select("*")
        .eq("is_active", true);

      setOrders(ordersData || []);

      // Default stores if no configurations exist
      if (!storesData || storesData.length === 0) {
        setStores([
          {
            store_name: "Mena Bazar",
            whatsapp_number: "923472886228",
            commission_rate: 5.0,
            is_active: true,
          },
        ]);
      } else {
        setStores(storesData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = () => {
    // Calculate overall analytics
    const totalSales = orders.reduce(
      (sum, order) => sum + Number(order.total_amount || 0),
      0
    );
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(
      (order) => order.status === "pending"
    ).length;
    const confirmedOrders = orders.filter(
      (order) => order.status === "confirmed"
    ).length;
    const deliveredOrders = orders.filter(
      (order) => order.status === "delivered"
    ).length;

    // Calculate commission
    const totalCommission = orders.reduce((sum, order) => {
      const orderStore = order.order_items?.[0]?.product_store || "Default";
      const storeConfig = stores.find((s) => s.store_name === orderStore);
      const commissionRate = storeConfig?.commission_rate || 5.0;
      return sum + (Number(order.total_amount) * commissionRate) / 100;
    }, 0);

    // Store-specific analytics
    const storeAnalytics = {};
    stores.forEach((store) => {
      const storeOrders = orders.filter((order) => {
        const orderStore = order.order_items?.[0]?.product_store || "Default";
        return orderStore === store.store_name;
      });

      const storeSales = storeOrders.reduce(
        (sum, order) => sum + Number(order.total_amount || 0),
        0
      );
      const storeCommission = (storeSales * store.commission_rate) / 100;

      storeAnalytics[store.store_name] = {
        ...store,
        sales: storeSales,
        commission: storeCommission,
        orders: storeOrders.length,
        pendingOrders: storeOrders.filter((o) => o.status === "pending").length,
        averageOrderValue:
          storeOrders.length > 0 ? storeSales / storeOrders.length : 0,
      };
    });

    setAnalytics({
      overall: {
        totalSales,
        totalCommission,
        totalOrders,
        pendingOrders,
        confirmedOrders,
        deliveredOrders,
        averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
      },
      storeAnalytics,
      filteredOrders: orders,
    });
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      case "shipped":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
    const orderStore = order.order_items?.[0]?.product_store || "Mena Bazar";
    const whatsappUrl = getStoreWhatsAppUrl(orderStore, order);
    window.open(whatsappUrl, "_blank");
  };

  const exportData = () => {
    if (!analytics) return;

    const csvData = [
      ["Order Number", "Store", "Customer", "Total Amount", "Status", "Date"],
      ...analytics.filteredOrders.map((order) => [
        order.order_number,
        order.order_items?.[0]?.product_store || "Default",
        `${order.customer_first_name} ${order.customer_last_name}`,
        order.total_amount,
        order.status,
        new Date(order.created_at).toLocaleDateString(),
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orders-export-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors"
              >
                <ArrowUpRight className="w-5 h-5" />
                <span>Back to Store</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Business Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Store management, orders & analytics
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/admin/stores"
                className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Store className="w-4 h-4 mr-2" />
                Store Management
              </Link>
              <Link
                to="/admin/orders"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Orders
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Cards */}
        {analytics && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-emerald-100">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Sales</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₨{analytics.overall.totalSales.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-100">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Commission</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₨{analytics.overall.totalCommission.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-100">
                    <ShoppingCart className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.overall.totalOrders}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-orange-100">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Pending Orders</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.overall.pendingOrders}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Store Performance Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {Object.entries(analytics.storeAnalytics).map(
                ([storeName, data]) => (
                  <div
                    key={storeName}
                    className="bg-white rounded-lg shadow-sm p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-emerald-100">
                          <Store className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {storeName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Commission: {data.commission_rate}%
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleTransferToStore(
                            analytics.filteredOrders.find(
                              (o) =>
                                o.order_items?.[0]?.product_store === storeName
                            )
                          )
                        }
                        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Sales</p>
                        <p className="text-lg font-semibold text-gray-900">
                          ₨{data.sales.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Commission</p>
                        <p className="text-lg font-semibold text-blue-600">
                          ₨{data.commission.toLocaleString()}
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

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">WhatsApp:</span>
                        <span className="text-gray-900">
                          {data.whatsapp_number}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Orders
                  </h3>
                  <button
                    onClick={exportData}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Store
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {analytics.filteredOrders.slice(0, 10).map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-900">
                              {order.order_number}
                            </p>
                            <p className="text-gray-500">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {order.order_items?.[0]?.product_store || "Default"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div>
                            <p className="font-medium">
                              {order.customer_first_name}{" "}
                              {order.customer_last_name}
                            </p>
                            <p className="text-gray-500">
                              {order.customer_phone}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          ₨{Number(order.total_amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(
                              order.status
                            )}`}
                          >
                            {getOrderStatusIcon(order.status)}
                            <span className="ml-1 capitalize">
                              {order.status}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleTransferToStore(order)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;
