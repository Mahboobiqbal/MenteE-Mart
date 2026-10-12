import React, { useState, useEffect } from "react";
import {
  Store,
  MessageCircle,
  DollarSign,
  TrendingUp,
  Users,
  Package,
  Settings,
  Edit,
  Plus,
  Filter,
  Calendar,
  Download,
  Target,
  Award,
  BarChart3,
} from "lucide-react";
import {
  getStoreWhatsAppUrl,
  generateCommissionReport,
  saveStoreConfiguration,
} from "../../utils/storeConfig";
import supabase from "../../utils/supabase";

const StoreManagementDashboard = () => {
  const [stores, setStores] = useState([]);
  const [orders, setOrders] = useState([]);
  const [storeAnalytics, setStoreAnalytics] = useState({});
  const [commissionReport, setCommissionReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStoreConfig, setShowStoreConfig] = useState(false);
  const [showCommissionReport, setShowCommissionReport] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [newStoreConfig, setNewStoreConfig] = useState({
    storeName: "",
    whatsappNumber: "",
    commissionRate: 5.0,
    commissionType: "percentage",
    storeAddress: "",
    storeEmail: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      calculateAnalytics();
    }
  }, [orders, dateRange]);

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

      setOrders(ordersData || []);

      // Load store configurations
      const { data: configsData } = await supabase
        .from("store_configurations")
        .select("*")
        .eq("is_active", true);

      if (configsData) {
        setStores(configsData);
      } else {
        // Default stores if no configurations exist
        const defaultStores = [
          {
            store_name: "Mena Bazar",
            whatsapp_number: "923472886228",
            commission_rate: 5.0,
            commission_type: "percentage",
            store_address: "Mena Bazar Store Location",
            store_contact_email: "menabazar@yourstore.com",
            is_active: true,
          },
        ];
        setStores(defaultStores);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = () => {
    const analytics = {};
    const report = generateCommissionReport(
      orders,
      dateRange.startDate,
      dateRange.endDate
    );

    // Individual store analytics
    Object.keys(report.storeAnalytics).forEach((storeName) => {
      analytics[storeName] = report.storeAnalytics[storeName];
    });

    setStoreAnalytics(analytics);
    setCommissionReport(report);
  };

  const handleStoreOrderTransfer = (order) => {
    const orderStore = order.order_items?.[0]?.product_store || "Mena Bazar";
    const whatsappUrl = getStoreWhatsAppUrl(orderStore, order);
    window.open(whatsappUrl, "_blank");
  };

  const handleStoreConfigSave = async () => {
    try {
      if (!newStoreConfig.storeName || !newStoreConfig.whatsappNumber) {
        alert("Store name and WhatsApp number are required");
        return;
      }

      await saveStoreConfiguration(newStoreConfig.storeName, newStoreConfig);
      await loadData();
      setShowStoreConfig(false);
      setNewStoreConfig({
        storeName: "",
        whatsappNumber: "",
        commissionRate: 5.0,
        commissionType: "percentage",
        storeAddress: "",
        storeEmail: "",
      });
      alert("Store configuration saved successfully");
    } catch (error) {
      console.error("Error saving store configuration:", error);
      alert("Failed to save store configuration");
    }
  };

  const exportCommissionReport = () => {
    if (!commissionReport) return;

    const csvData = [
      [
        "Store Name",
        "Total Sales",
        "Total Commission",
        "Total Orders",
        "Average Order Value",
      ],
      ...Object.entries(commissionReport.storeAnalytics).map(
        ([storeName, data]) => [
          storeName,
          data.totalSales,
          data.totalCommission,
          data.totalOrders,
          data.averageOrderValue,
        ]
      ),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `commission-report-${
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
          <p className="text-gray-600">Loading store data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Store Management Dashboard
            </h1>
            <p className="text-gray-600">
              Manage stores, track commissions, and analyze store performance
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowStoreConfig(true)}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Store
            </button>
            <button
              onClick={() => setShowCommissionReport(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Commission Report
            </button>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Analytics Period
            </h3>
            <div className="flex space-x-4">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
              <span className="self-center text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Overall Statistics */}
        {commissionReport && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-emerald-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Sales
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ₨{commissionReport.overallStats.totalSales.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <Target className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Commission
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ₨
                    {commissionReport.overallStats.totalCommission.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Orders
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {commissionReport.overallStats.totalOrders}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Avg Order Value
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ₨
                    {(
                      commissionReport.overallStats.totalSales /
                        commissionReport.overallStats.totalOrders || 0
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Store Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {stores.map((store) => {
            const analytics = storeAnalytics[store.store_name] || {
              totalSales: 0,
              totalCommission: 0,
              totalOrders: 0,
              pendingOrders: 0,
              averageOrderValue: 0,
            };

            return (
              <div
                key={store.store_name}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
                      <Store className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {store.store_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Commission: {store.commission_rate}%
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleStoreOrderTransfer(
                        orders.find(
                          (o) =>
                            o.order_items?.[0]?.product_store ===
                            store.store_name
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
                    <p className="text-sm text-gray-600">Total Sales</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ₨{analytics.totalSales.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Commission</p>
                    <p className="text-lg font-semibold text-blue-600">
                      ₨{analytics.totalCommission.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Orders</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {analytics.totalOrders}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-lg font-semibold text-orange-600">
                      {analytics.pendingOrders}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">WhatsApp:</span>
                    <span className="text-gray-900">
                      {store.whatsapp_number}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600">Contact:</span>
                    <span className="text-gray-900">
                      {store.store_contact_email}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Store Configuration Modal */}
        {showStoreConfig && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Add Store</h2>
                  <button
                    onClick={() => setShowStoreConfig(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Name *
                    </label>
                    <input
                      type="text"
                      value={newStoreConfig.storeName}
                      onChange={(e) =>
                        setNewStoreConfig((prev) => ({
                          ...prev,
                          storeName: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Enter store name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp Number *
                    </label>
                    <input
                      type="text"
                      value={newStoreConfig.whatsappNumber}
                      onChange={(e) =>
                        setNewStoreConfig((prev) => ({
                          ...prev,
                          whatsappNumber: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="923472886228"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commission Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newStoreConfig.commissionRate}
                      onChange={(e) =>
                        setNewStoreConfig((prev) => ({
                          ...prev,
                          commissionRate: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Email
                    </label>
                    <input
                      type="email"
                      value={newStoreConfig.storeEmail}
                      onChange={(e) =>
                        setNewStoreConfig((prev) => ({
                          ...prev,
                          storeEmail: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="store@yourstore.com"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setShowStoreConfig(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStoreConfigSave}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Save Store
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Commission Report Modal */}
        {showCommissionReport && commissionReport && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Commission Report
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={exportCommissionReport}
                      className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </button>
                    <button
                      onClick={() => setShowCommissionReport(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-900">
                      Total Sales
                    </h3>
                    <p className="text-2xl font-bold text-emerald-700">
                      ₨
                      {commissionReport.overallStats.totalSales.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900">
                      Total Commission
                    </h3>
                    <p className="text-2xl font-bold text-blue-700">
                      ₨
                      {commissionReport.overallStats.totalCommission.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-900">
                      Total Orders
                    </h3>
                    <p className="text-2xl font-bold text-purple-700">
                      {commissionReport.overallStats.totalOrders}
                    </p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Store
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Sales
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Commission
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Orders
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(commissionReport.storeAnalytics).map(
                        ([storeName, data]) => (
                          <tr key={storeName}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {storeName}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              ₨{data.totalSales.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-blue-600 font-semibold">
                              ₨{data.totalCommission.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {data.totalOrders}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {data.commissionRate}%
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreManagementDashboard;
