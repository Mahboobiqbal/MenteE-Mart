import React, { useState, useEffect } from "react";
import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";
import supabase from "../../utils/supabase";

const SidebarAnalyticsSummary = () => {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsSummary();
  }, []);

  const loadAnalyticsSummary = async () => {
    try {
      setLoading(true);

      // Get last 30 days data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const formattedStartDate = thirtyDaysAgo.toISOString();

      // Load basic overview data
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", formattedStartDate);

      if (orders) {
        const totalRevenue = orders.reduce(
          (sum, order) => sum + parseFloat(order.total_amount || 0),
          0
        );
        const totalOrders = orders.length;
        const uniqueCustomers = new Set(
          orders.map((order) => order.customer_id)
        ).size;

        setAnalytics({
          totalRevenue,
          totalOrders,
          totalCustomers: uniqueCustomers,
        });
      }
    } catch (error) {
      console.error("Error loading analytics summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return `₨${Number(price).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="px-3 py-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-4">
      <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Analytics Summary (30d)
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 text-emerald-600 mr-2" />
            <span className="text-sm text-gray-700">Revenue</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {formatPrice(analytics.totalRevenue)}
          </span>
        </div>

        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <ShoppingCart className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm text-gray-700">Orders</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {analytics.totalOrders}
          </span>
        </div>

        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <Users className="h-4 w-4 text-purple-600 mr-2" />
            <span className="text-sm text-gray-700">Customers</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {analytics.totalCustomers}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SidebarAnalyticsSummary;
