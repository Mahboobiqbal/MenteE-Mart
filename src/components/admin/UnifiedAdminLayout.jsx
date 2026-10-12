import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import supabase from "../../utils/supabase";
import { AuthContext } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Plus,
  Building2,
  PieChart,
  Tags,
  Truck,
  ChevronDown,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { getAllStores } from "../../utils/storeManagement";
import SidebarAnalyticsSummary from "./SidebarAnalyticsSummary";

const UnifiedAdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stores, setStores] = useState([]);
  const [storesExpanded, setStoresExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useContext(AuthContext);

  useEffect(() => {
    loadStores();
  }, []);

  // Close drawer + scroll to top on route change
  useEffect(() => {
    setSidebarOpen(false);
    const main = document.getElementById("admin-main-scroll");
    if (main) main.scrollTop = 0;
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

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
      name: "Stores",
      href: "/admin/stores",
      icon: Store,
      current: location.pathname.startsWith("/admin/stores"),
      hasSubmenu: true,
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

  const handleExitAdmin = async () => {
    try {
      sessionStorage.removeItem("admin_passcode_verified");
      sessionStorage.removeItem("admin_ok");
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/");
    } catch (err) {
      console.error("Error signing out:", err);
      navigate("/");
    }
  };

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-gray-200/80">
        <Link to="/admin" className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm shadow-emerald-200 shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-gray-900 truncate">
              Mena Bazar
            </h1>
            <p className="text-[11px] text-gray-500 truncate">
              Admin Panel
            </p>
          </div>
        </Link>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const showSubmenu =
            item.hasSubmenu &&
            (storesExpanded || item.current) &&
            stores.length > 0;

          return (
            <div key={item.name}>
              <div
                className={`group flex items-center rounded-lg transition-colors ${
                  item.current
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Link
                  to={item.href}
                  className="flex items-center flex-1 px-3 py-2.5 text-sm font-medium min-w-0"
                >
                  <Icon
                    className={`mr-3 h-[18px] w-[18px] shrink-0 ${
                      item.current
                        ? "text-emerald-600"
                        : "text-gray-400 group-hover:text-gray-600"
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
                {item.hasSubmenu && (
                  <button
                    onClick={() => setStoresExpanded((v) => !v)}
                    className="p-2 mr-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 transition-colors"
                    aria-label="Toggle store list"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        storesExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                )}
              </div>

              {/* Store submenu */}
              {showSubmenu && (
                <div className="ml-5 mt-1 space-y-0.5 pl-3 border-l border-gray-200">
                  {stores.slice(0, 6).map((store) => (
                    <Link
                      key={store.id}
                      to={`/admin/stores/${store.id}/products`}
                      className="flex items-center px-3 py-1.5 text-[13px] text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                    >
                      <Store className="mr-2 h-3.5 w-3.5 shrink-0 text-gray-400" />
                      <span className="truncate">{store.name}</span>
                      {store.commission_rate != null && (
                        <span className="ml-auto text-[11px] text-gray-400 pl-2">
                          {store.commission_rate}%
                        </span>
                      )}
                    </Link>
                  ))}
                  {stores.length > 6 && (
                    <Link
                      to="/admin/stores"
                      className="block px-3 py-1.5 text-[13px] text-emerald-600 hover:text-emerald-800 rounded-md"
                    >
                      View all {stores.length} stores →
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Analytics Summary */}
        <div className="pt-3 mt-3 border-t border-gray-200/80">
          <SidebarAnalyticsSummary />
        </div>
      </nav>

      {/* Footer actions */}
      <div className="p-3 border-t border-gray-200/80 space-y-1">
        <Link
          to="/"
          className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ExternalLink className="w-4 h-4 mr-3 text-gray-400" />
          View Storefront
        </Link>
        <button
          onClick={handleExitAdmin}
          className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Exit Admin
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white shadow-2xl lg:hidden flex flex-col animate-[slide-in_0.25s_ease-out]">
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3 h-16 px-4 sm:px-6">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Search (desktop) */}
            <div className="hidden md:block relative w-56 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search stores, products..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="flex-1" />

            {/* Quick actions */}
            <div className="flex items-center gap-2">
              <Link
                to="/admin/stores"
                className="hidden sm:inline-flex items-center px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <Plus className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Store</span>
              </Link>
              <Link
                to="/admin/categories"
                className="hidden sm:inline-flex items-center px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-100 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Tags className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Category</span>
              </Link>
              <Link
                to="/admin/products"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm shadow-emerald-200 transition-colors"
              >
                <Plus className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Product</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Read-only warning when there is no database session */}
        {!session && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-6 py-2 flex items-start sm:items-center gap-2 text-xs sm:text-[13px] text-amber-800 shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0" />
            <span>
              <strong>Read-only mode</strong> — no database session, so saving
              and image uploads will fail. Set{" "}
              <code className="px-1 py-0.5 bg-amber-100 rounded">
                VITE_ADMIN_PASSWORD
              </code>{" "}
              in <code className="px-1 py-0.5 bg-amber-100 rounded">.env</code>,
              restart the dev server, then exit and re-enter the admin passcode.
            </span>
          </div>
        )}

        {/* Page content */}
        <main
          id="admin-main-scroll"
          className="flex-1 overflow-y-auto bg-gray-100 custom-scrollbar"
        >
          {children}
        </main>
      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default UnifiedAdminLayout;
