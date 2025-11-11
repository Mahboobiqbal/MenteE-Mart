import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Plus,
  MessageCircle,
  Building2,
  PieChart,
  Tags,
  Truck,
} from "lucide-react";
import { getAllStores } from "../../utils/storeManagement";
import SidebarAnalyticsSummary from "./SidebarAnalyticsSummary";

const UnifiedAdminLayout = ({ children, title = "Dashboard" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stores, setStores] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const storeList = await getAllStores();
      setStores(storeList);
    } catch (error) {
      console.error("Error loading stores:", error);
    }
  };

  const menuItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      current: location.pathname === "/admin",
    },
    {
      name: "Store Management",
      href: "/admin/stores",
      icon: Store,
      current: location.pathname.startsWith("/admin/stores"),
      submenu: stores,
    },
    {
      name: "Categories",
      href: "/admin/categories",
      icon: Tags,
      current: location.pathname.startsWith("/admin/categories"),
    },
    {
      name: "Shipping Areas",
      href: "/admin/shipping-areas",
      icon: Truck,
      current: location.pathname.startsWith("/admin/shipping-areas"),
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: Package,
      current: location.pathname.startsWith("/admin/products"),
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: ShoppingCart,
      current: location.pathname.startsWith("/admin/orders"),
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: TrendingUp,
      current: location.pathname.startsWith("/admin/analytics"),
    },
    {
      name: "Business Analytics",
      href: "/admin/business-analytics",
      icon: PieChart,
      current: location.pathname.startsWith("/admin/business-analytics"),
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
      current: location.pathname.startsWith("/admin/settings"),
    },
  ];

  const handleExitAdmin = () => {
    sessionStorage.removeItem("admin_ok");
    navigate("/");
  };

  const getPageDescription = (pathname) => {
    switch (pathname) {
      case "/admin":
        return "Monitor your business performance and store metrics";
      case "/admin/stores":
        return "Manage your store partners, commission rates, and WhatsApp contacts";
      case "/admin/products":
        return "Organize products for each store and track inventory";
      case "/admin/orders":
        return "Process orders and communicate with store owners";
      case "/admin/analytics":
        return "View detailed reports and commission tracking";
      default:
        return "Manage your multi-store e-commerce business";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Unified Admin</h1>
              <p className="text-xs text-gray-500">Multi-Store Management</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 flex-1 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const hasSubmenu = item.submenu && item.submenu.length > 0;

              return (
                <div key={item.name}>
                  <Link
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      item.current
                        ? "bg-emerald-50 text-emerald-700 border-r-2 border-emerald-600"
                        : "text-gray-700 hover:text-emerald-700 hover:bg-gray-50"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 ${
                        item.current
                          ? "text-emerald-600"
                          : "text-gray-400 group-hover:text-emerald-600"
                      }`}
                    />
                    {item.name}
                    {hasSubmenu && (
                      <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        {item.submenu.length}
                      </span>
                    )}
                  </Link>

                  {/* Store submenu */}
                  {hasSubmenu && item.current && (
                    <div className="ml-8 mt-2 space-y-1">
                      {item.submenu.map((store) => (
                        <Link
                          key={store.id}
                          to={`/admin/stores/${store.id}/products`}
                          className="flex items-center px-2 py-1 text-sm text-gray-600 hover:text-emerald-700 transition-colors"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <Store className="mr-2 h-3 w-3" />
                          {store.name}
                          {store.commission_rate && (
                            <span className="ml-auto text-xs text-gray-400">
                              {store.commission_rate}%
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Active Stores Section */}
          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Active Stores ({stores.length})
            </h3>
            <div className="mt-2 space-y-1">
              {stores.slice(0, 5).map((store) => (
                <div
                  key={store.id}
                  className="flex items-center px-3 py-2 text-sm"
                >
                  <Store className="mr-3 h-4 w-4 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {store.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {store.commission_rate}% commission
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/${store.whatsapp_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-500 hover:text-green-700 ml-2"
                    title="Message store owner"
                  >
                    <MessageCircle className="w-3 h-3" />
                  </a>
                </div>
              ))}
              {stores.length > 5 && (
                <Link
                  to="/admin/stores"
                  className="block px-3 py-1 text-xs text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  View all stores →
                </Link>
              )}
            </div>
          </div>

          {/* Analytics Summary */}
          <SidebarAnalyticsSummary />
        </nav>

        {/* Exit Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleExitAdmin}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Exit Admin
          </button>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Page title */}
            <div className="flex-1 lg:flex lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                <p className="text-sm text-gray-600">
                  {getPageDescription(location.pathname)}
                </p>
              </div>
            </div>

            {/* Header actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden sm:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search stores, products..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700">
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 block w-2 h-2 bg-red-400 rounded-full"></span>
              </button>

              {/* Quick actions */}
              <div className="flex items-center space-x-2">
                <Link
                  to="/admin/stores"
                  className="flex items-center px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Store
                </Link>
                <Link
                  to="/admin/categories"
                  className="flex items-center px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Tags className="w-4 h-4 mr-2" />
                  Add Category
                </Link>
                <Link
                  to="/admin/products"
                  className="flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Add Product
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="h-full">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default UnifiedAdminLayout;
