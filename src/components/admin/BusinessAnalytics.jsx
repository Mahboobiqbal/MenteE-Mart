import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Users,
  Package,
  Truck,
  Calendar,
  BarChart3,
  PieChart,
  Download,
  Filter,
  Search,
  MapPin,
  Clock,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";
import supabase from "../../utils/supabase";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const BusinessAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedStore, setSelectedStore] = useState("all");
  const [analytics, setAnalytics] = useState({
    overview: {
      totalRevenue: 0,
      totalOrders: 0,
      totalCustomers: 0,
      averageOrderValue: 0,
    },
    revenueByDay: [],
    revenueByStore: [],
    topSellingProducts: [],
    customerAcquisition: [],
    shippingAnalytics: {
      totalShippingCost: 0,
      shippingByArea: [],
      shippingVsProductRevenue: 0,
    },
    commissionAnalytics: {
      totalCommission: 0,
      commissionByStore: [],
      commissionRate: 0,
    },
    paymentMethods: [],
    orderStatus: [],
    recentOrders: [],
  });

  useEffect(() => {
    loadAnalytics();
  }, [timeRange, selectedStore]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Get date range
      const now = new Date();
      let startDate;
      switch (timeRange) {
        case "7d":
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "30d":
          startDate = new Date(now.setDate(now.getDate() - 30));
          break;
        case "90d":
          startDate = new Date(now.setDate(now.getDate() - 90));
          break;
        case "1y":
          startDate = new Date(now.setDate(now.getDate() - 365));
          break;
        default:
          startDate = new Date(now.setDate(now.getDate() - 30));
      }

      // Format dates for Supabase
      const formattedStartDate = startDate.toISOString();
      const formattedEndDate = new Date().toISOString();

      // Load overview data (filtered by date range and selected store)
      let ordersQuery = supabase
        .from("orders")
        .select("*")
        .gte("created_at", formattedStartDate)
        .lt("created_at", formattedEndDate);

      if (selectedStore !== "all") {
        ordersQuery = ordersQuery.eq("store_id", selectedStore);
      }

      const { data: orders } = await ordersQuery;

      // Calculate overview metrics
      const totalRevenue =
        orders?.reduce(
          (sum, order) => sum + parseFloat(order.total_amount || 0),
          0
        ) || 0;
      const totalShippingCost =
        orders?.reduce(
          (sum, order) => sum + parseFloat(order.shipping_cost || 0),
          0
        ) || 0;
      const totalOrders = orders?.length || 0;
      const uniqueCustomers = new Set(
        orders?.map((order) => order.customer_id) || []
      ).size;
      const averageOrderValue =
        totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Revenue by day
      const revenueByDay = {};
      orders?.forEach((order) => {
        const date = new Date(order.created_at).toLocaleDateString();
        if (!revenueByDay[date]) {
          revenueByDay[date] = { revenue: 0, orders: 0, shipping: 0 };
        }
        revenueByDay[date].revenue += parseFloat(order.total_amount || 0);
        revenueByDay[date].orders += 1;
        revenueByDay[date].shipping += parseFloat(order.shipping_cost || 0);
      });

      // Revenue by store
      const revenueByStore = {};
      orders?.forEach((order) => {
        const storeName = order.store_name || "Unknown";
        if (!revenueByStore[storeName]) {
          revenueByStore[storeName] = { revenue: 0, orders: 0, commission: 0 };
        }
        revenueByStore[storeName].revenue += parseFloat(
          order.total_amount || 0
        );
        revenueByStore[storeName].orders += 1;
        revenueByStore[storeName].commission += parseFloat(
          order.commission_amount || 0
        );
      });

      // Shipping analytics
      const shippingByArea = {};
      orders?.forEach((order) => {
        if (order.area_id) {
          // Fetch area name
          // For now, we'll use area_id as key
          const areaKey = order.area_id || "Unknown";
          if (!shippingByArea[areaKey]) {
            shippingByArea[areaKey] = { shipping: 0, orders: 0 };
          }
          shippingByArea[areaKey].shipping += parseFloat(
            order.shipping_cost || 0
          );
          shippingByArea[areaKey].orders += 1;
        }
      });

      // Commission analytics
      const totalCommission =
        orders?.reduce(
          (sum, order) => sum + parseFloat(order.commission_amount || 0),
          0
        ) || 0;
      const commissionRate =
        totalRevenue > 0 ? (totalCommission / totalRevenue) * 100 : 0;

      // Payment methods
      const paymentMethods = {};
      orders?.forEach((order) => {
        const method = order.payment_method || "Unknown";
        if (!paymentMethods[method]) {
          paymentMethods[method] = { count: 0, revenue: 0 };
        }
        paymentMethods[method].count += 1;
        paymentMethods[method].revenue += parseFloat(order.total_amount || 0);
      });

      // Order status
      const orderStatus = {};
      orders?.forEach((order) => {
        const status = order.status || "Unknown";
        if (!orderStatus[status]) {
          orderStatus[status] = { count: 0, revenue: 0 };
        }
        orderStatus[status].count += 1;
        orderStatus[status].revenue += parseFloat(order.total_amount || 0);
      });

      // Get recent orders (customer info is denormalized on the order row;
      // there is no FK relationship between orders and customers)
      const { data: recentOrders } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      // Get top selling products
      const { data: orderItems } = await supabase
        .from("order_items")
        .select(
          `
          product_name,
          quantity,
          unit_price,
          total_price,
          orders (
            created_at
          )
        `
        )
        .gte("orders.created_at", formattedStartDate)
        .lt("orders.created_at", formattedEndDate);

      const productSales = {};
      orderItems?.forEach((item) => {
        if (!productSales[item.product_name]) {
          productSales[item.product_name] = { quantity: 0, revenue: 0 };
        }
        productSales[item.product_name].quantity += item.quantity;
        productSales[item.product_name].revenue += parseFloat(
          item.total_price || 0
        );
      });

      const topSellingProducts = Object.entries(productSales)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      setAnalytics({
        overview: {
          totalRevenue,
          totalOrders,
          totalCustomers: uniqueCustomers,
          averageOrderValue,
        },
        revenueByDay: Object.entries(revenueByDay).map(([date, data]) => ({
          date,
          ...data,
        })),
        revenueByStore: Object.entries(revenueByStore).map(([name, data]) => ({
          name,
          ...data,
        })),
        topSellingProducts,
        customerAcquisition: [], // Placeholder for future implementation
        shippingAnalytics: {
          totalShippingCost,
          shippingByArea: Object.entries(shippingByArea).map(
            ([area, data]) => ({ area, ...data })
          ),
          shippingVsProductRevenue:
            (totalShippingCost / (totalRevenue - totalShippingCost)) * 100,
        },
        commissionAnalytics: {
          totalCommission,
          commissionByStore: Object.entries(revenueByStore).map(
            ([name, data]) => ({
              name,
              commission: data.commission,
              revenue: data.revenue,
            })
          ),
          commissionRate,
        },
        paymentMethods: Object.entries(paymentMethods).map(
          ([method, data]) => ({ method, ...data })
        ),
        orderStatus: Object.entries(orderStatus).map(([status, data]) => ({
          status,
          ...data,
        })),
        recentOrders: recentOrders || [],
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return `₨${Number(price).toLocaleString()}`;
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const downloadReport = async () => {
    try {
      // Create CSV report
      let csvContent =
        "Date,Order ID,Customer,Store,Status,Total Amount,Shipping Cost,Commission Amount,Payment Method\n";

      analytics.recentOrders.forEach((order) => {
        const customer =
          order.customer_first_name || order.customer_last_name
            ? `${order.customer_first_name || ""} ${order.customer_last_name || ""}`.trim()
            : order.customer_email || "Unknown";

        csvContent += `${new Date(order.created_at).toLocaleDateString()},${
          order.order_number
        },"${customer}",${order.store_name},${order.status},${
          order.total_amount
        },${order.shipping_cost},${order.commission_amount},${
          order.payment_method
        }\n`;
      });

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `business-analytics-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading report:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Business Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Comprehensive insights into your business performance
          </p>
        </div>
        <div className="mt-4 flex space-x-3">
          <button
            onClick={downloadReport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Range
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
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
              {/* Store options would be loaded here */}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search orders..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatPrice(analytics.overview.totalRevenue)}
              </p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500">12.5%</span>
                <span className="text-sm text-gray-500 ml-2">
                  vs last period
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics.overview.totalOrders}
              </p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500">8.2%</span>
                <span className="text-sm text-gray-500 ml-2">
                  vs last period
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Customers</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics.overview.totalCustomers}
              </p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500">15.3%</span>
                <span className="text-sm text-gray-500 ml-2">
                  vs last period
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Package className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Avg. Order Value
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatPrice(analytics.overview.averageOrderValue)}
              </p>
              <div className="flex items-center mt-1">
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-sm text-red-500">2.1%</span>
                <span className="text-sm text-gray-500 ml-2">
                  vs last period
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue and Shipping Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Revenue Overview
            </h2>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">Daily</span>
            </div>
          </div>

          <div className="h-80">
            <Line
              data={{
                labels: analytics.revenueByDay.map((item) => item.date),
                datasets: [
                  {
                    label: "Revenue",
                    data: analytics.revenueByDay.map((item) => item.revenue),
                    borderColor: "rgb(16, 185, 129)",
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    tension: 0.4,
                  },
                  {
                    label: "Orders",
                    data: analytics.revenueByDay.map((item) => item.orders),
                    borderColor: "rgb(59, 130, 246)",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    yAxisID: "y1",
                    tension: 0.4,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  mode: "index",
                  intersect: false,
                },
                plugins: {
                  legend: {
                    position: "top",
                  },
                  title: {
                    display: true,
                    text: "Revenue & Orders Over Time",
                  },
                },
                scales: {
                  y: {
                    type: "linear",
                    display: true,
                    position: "left",
                    title: {
                      display: true,
                      text: "Revenue (₨)",
                    },
                  },
                  y1: {
                    type: "linear",
                    display: true,
                    position: "right",
                    title: {
                      display: true,
                      text: "Orders",
                    },
                    grid: {
                      drawOnChartArea: false,
                    },
                  },
                },
              }}
            />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Product Revenue</p>
              <p className="text-xl font-semibold text-gray-900 mt-1">
                {formatPrice(
                  analytics.overview.totalRevenue -
                    analytics.shippingAnalytics.totalShippingCost
                )}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Shipping Revenue</p>
              <p className="text-xl font-semibold text-gray-900 mt-1">
                {formatPrice(analytics.shippingAnalytics.totalShippingCost)}
              </p>
            </div>
          </div>
        </div>

        {/* Shipping Analytics */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Shipping Analytics
            </h2>
            <Truck className="h-5 w-5 text-gray-500" />
          </div>

          <div className="h-80">
            <Pie
              data={{
                labels: analytics.shippingAnalytics.shippingByArea.map(
                  (area) => `Area ${area.area}`
                ),
                datasets: [
                  {
                    data: analytics.shippingAnalytics.shippingByArea.map(
                      (area) => area.shipping
                    ),
                    backgroundColor: [
                      "rgba(16, 185, 129, 0.8)",
                      "rgba(59, 130, 246, 0.8)",
                      "rgba(147, 51, 234, 0.8)",
                      "rgba(245, 158, 11, 0.8)",
                      "rgba(239, 68, 68, 0.8)",
                      "rgba(6, 182, 212, 0.8)",
                    ],
                    borderColor: [
                      "rgb(16, 185, 129)",
                      "rgb(59, 130, 246)",
                      "rgb(147, 51, 234)",
                      "rgb(245, 158, 11)",
                      "rgb(239, 68, 68)",
                      "rgb(6, 182, 212)",
                    ],
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom",
                  },
                  title: {
                    display: true,
                    text: "Shipping Cost by Area",
                  },
                },
              }}
            />
          </div>

          <div className="mt-6 space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Shipping vs Product Revenue
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatPercentage(
                    analytics.shippingAnalytics.shippingVsProductRevenue
                  )}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">
                Shipping by Area
              </p>
              <div className="space-y-3">
                {analytics.shippingAnalytics.shippingByArea
                  .slice(0, 5)
                  .map((area, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-700">
                          Area {area.area}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatPrice(area.shipping)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {area.orders} orders
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Commission Analytics */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Commission Analytics
          </h2>
          <div className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">By Store</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Commission</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {formatPrice(analytics.commissionAnalytics.totalCommission)}
              </p>
              <div className="mt-2">
                <p className="text-sm text-gray-600">Average Commission Rate</p>
                <p className="text-xl font-semibold text-gray-900 mt-1">
                  {formatPercentage(
                    analytics.commissionAnalytics.commissionRate
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="h-80">
              <Bar
                data={{
                  labels: analytics.commissionAnalytics.commissionByStore.map(
                    (store) => store.name
                  ),
                  datasets: [
                    {
                      label: "Commission Amount",
                      data: analytics.commissionAnalytics.commissionByStore.map(
                        (store) => store.commission
                      ),
                      backgroundColor: "rgba(16, 185, 129, 0.8)",
                      borderColor: "rgb(16, 185, 129)",
                      borderWidth: 1,
                    },
                    {
                      label: "Revenue",
                      data: analytics.commissionAnalytics.commissionByStore.map(
                        (store) => store.revenue
                      ),
                      backgroundColor: "rgba(59, 130, 246, 0.8)",
                      borderColor: "rgb(59, 130, 246)",
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                    title: {
                      display: true,
                      text: "Commission vs Revenue by Store",
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: "Amount (₨)",
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Commission by Store
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Store
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Revenue
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Commission
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.commissionAnalytics.commissionByStore.map(
                  (store, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {store.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatPrice(store.revenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatPrice(store.commission)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatPercentage(
                          (store.commission / store.revenue) * 100
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Top Selling Products
          </h2>
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">By Revenue</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Product Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Quantity Sold
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.topSellingProducts.map((product, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatPrice(product.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Last 10 orders</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Order ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Customer
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Store
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Total
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.recentOrders.map((order, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.order_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.customer_first_name || order.customer_last_name
                      ? `${order.customer_first_name || ""} ${order.customer_last_name || ""}`.trim()
                      : order.customer_email || "Unknown"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.store_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "confirmed"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "processing"
                          ? "bg-purple-100 text-purple-800"
                          : order.status === "shipped"
                          ? "bg-indigo-100 text-indigo-800"
                          : order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(order.total_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BusinessAnalytics;



