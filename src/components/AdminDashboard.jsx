import React, { useState, useEffect } from "react";
import supabase from "../utils/supabase";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaSearch,
  FaEye,
  FaMousePointer,
  FaEdit,
  FaTrash,
  FaSignOutAlt,
  FaPlus,
  FaShoppingCart,
} from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import OrderManagement from "./admin/OrderManagement";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const emerald = "#008060";
const yellow = "#FFD700";
const charcoal = "#333333";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("table");
  const [sortBy, setSortBy] = useState("views-high");
  const [productLimit, setProductLimit] = useState(10);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (!window.confirm("Delete this product?")) return;
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product.");
    }
  };

  const handleExitAdmin = () => {
    sessionStorage.removeItem("admin_ok");
    navigate("/");
  };

  const filteredProducts = products
    .filter((product) => {
      const name = String(product.name || "").toLowerCase();
      const desc = String(product.description || "").toLowerCase();
      const term = searchTerm.toLowerCase();
      return name.includes(term) || desc.includes(term);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "views-high":
          return (b.views || 0) - (a.views || 0);
        case "views-low":
          return (a.views || 0) - (b.views || 0);
        case "clicks-high":
          return (b.clicks || 0) - (a.clicks || 0);
        case "clicks-low":
          return (a.clicks || 0) - (b.clicks || 0);
        case "name":
          return String(a.name || "").localeCompare(String(b.name || ""));
        case "price-high":
          return (Number(b.price) || 0) - (Number(a.price) || 0);
        case "price-low":
          return (Number(a.price) || 0) - (Number(b.price) || 0);
        default:
          return 0;
      }
    });

  // Use filteredProducts if any filter applied, otherwise show all products
  const tableRows = filteredProducts.length ? filteredProducts : products;
  const topProducts = tableRows.slice(0, productLimit);

  const chartData = {
    labels: topProducts.map((p) =>
      String(p.name || "").length > 15
        ? `${String(p.name).slice(0, 15)}…`
        : String(p.name || "")
    ),
    datasets: [
      {
        label: "Views",
        data: topProducts.map((p) => p.views || 0),
        backgroundColor: `${emerald}99`,
        borderColor: emerald,
        borderWidth: 1,
      },
      {
        label: "Clicks",
        data: topProducts.map((p) => p.clicks || 0),
        backgroundColor: `${yellow}99`,
        borderColor: yellow,
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12 },
          color: charcoal,
        },
      },
      title: {
        display: true,
        text: `Top ${productLimit} Products Analytics`,
        color: charcoal,
        font: { size: 16, weight: "bold" },
      },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.08)" },
        ticks: { color: charcoal, font: { size: 11 } },
      },
      x: {
        grid: { display: false },
        ticks: { color: charcoal, font: { size: 11 }, maxRotation: 45 },
      },
    },
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex justify-center items-center"
        style={{ background: "#f5f7f6" }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-16 w-16 border-4 mx-auto mb-4"
            style={{ borderColor: `${emerald}55`, borderTopColor: emerald }}
          />
          <p className="text-lg font-medium" style={{ color: charcoal }}>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f5f7f6" }}>
      {/* Header / Navbar */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: "#ffffffcc",
          backdropFilter: "saturate(180%) blur(6px)",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-3"
                style={{ color: charcoal }}
                aria-label="Go to store"
              >
                <FaArrowLeft className="w-4 h-4" />
                <div>
                  <div className="text-sm" style={{ color: charcoal }}>
                    Store
                  </div>
                  <div
                    className="text-lg font-semibold"
                    style={{ color: emerald }}
                  >
                    Admin
                  </div>
                </div>
              </button>
              <div>
                <h1 className="text-2xl font-light" style={{ color: charcoal }}>
                  Dashboard{" "}
                  <span className="font-semibold" style={{ color: emerald }}>
                    Manager
                  </span>
                </h1>
                <p className="text-sm" style={{ color: `${charcoal}99` }}>
                  Manage products and analytics
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/add-product"
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition"
                style={{ background: emerald, color: "#fff" }}
                title="Add new product"
              >
                <FaPlus /> Add Product
              </Link>

              <button
                onClick={handleExitAdmin}
                className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
                style={{
                  color: charcoal,
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                }}
                title="Exit admin mode"
              >
                <FaSignOutAlt />
                Exit
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Total Products",
              value: products.length.toLocaleString(),
              color: emerald,
              icon: (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
                  />
                </svg>
              ),
            },
            {
              title: "Total Views",
              value: products
                .reduce((s, p) => s + (p.views || 0), 0)
                .toLocaleString(),
              color: emerald,
              icon: <FaEye className="w-6 h-6" />,
            },
            {
              title: "Total Clicks",
              value: products
                .reduce((s, p) => s + (p.clicks || 0), 0)
                .toLocaleString(),
              color: yellow,
              icon: <FaMousePointer className="w-6 h-6" />,
            },
            {
              title: "Avg. Views",
              value: products.length
                ? Math.round(
                    products.reduce((s, p) => s + (p.views || 0), 0) /
                      products.length
                  ).toLocaleString()
                : "0",
              color: charcoal,
              icon: (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke={charcoal}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10"
                  />
                </svg>
              ),
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border p-6 hover:shadow transition"
              style={{ borderColor: "#e5e7eb" }}
            >
              <div className="flex items-center">
                <div
                  className="p-3 rounded-xl"
                  style={{ background: `${stat.color}1A`, color: stat.color }}
                >
                  {stat.icon}
                </div>
                <div className="ml-4">
                  <p
                    className="text-sm font-medium"
                    style={{ color: `${charcoal}99` }}
                  >
                    {stat.title}
                  </p>
                  <p
                    className="text-3xl font-light"
                    style={{ color: charcoal }}
                  >
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div
          className="bg-white rounded-lg border mb-6"
          style={{ borderColor: "#e5e7eb" }}
        >
          <div className="border-b" style={{ borderColor: "#e5e7eb" }}>
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("table")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "table"
                    ? "border-[#008060]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                style={{ color: activeTab === "table" ? emerald : charcoal }}
              >
                Products Table
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "orders"
                    ? "border-[#008060]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                style={{ color: activeTab === "orders" ? emerald : charcoal }}
              >
                <FaShoppingCart className="w-4 h-4 inline mr-2" />
                Order Management
              </button>
              <button
                onClick={() => setActiveTab("charts")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "charts"
                    ? "border-[#008060]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                style={{ color: activeTab === "charts" ? emerald : charcoal }}
              >
                Analytics Chart
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "table" ? (
              <div>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1 group">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border rounded-xl text-gray-700 focus:ring-2"
                      style={{ borderColor: "#e5e7eb", outline: "none" }}
                    />
                  </div>
                  <div className="flex gap-3">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 border rounded-lg focus:ring-2"
                      style={{ borderColor: "#e5e7eb", outline: "none" }}
                    >
                      <option value="views-high">Views (High to Low)</option>
                      <option value="views-low">Views (Low to High)</option>
                      <option value="clicks-high">Clicks (High to Low)</option>
                      <option value="clicks-low">Clicks (Low to High)</option>
                      <option value="name">Name (A–Z)</option>
                      <option value="price-high">Price (High to Low)</option>
                      <option value="price-low">Price (Low to High)</option>
                    </select>
                  </div>
                </div>

                {/* Products Table */}
                <div
                  className="bg-white rounded-2xl border shadow-sm overflow-x-auto"
                  style={{ borderColor: "#e5e7eb" }}
                >
                  <table className="min-w-full divide-y divide-gray-200 table-fixed">
                    <thead className="bg-gray-50">
                      <tr>
                        {[
                          "Product",
                          "Price",
                          "Analytics",
                          "Status",
                          "Actions",
                        ].map((header) => (
                          <th
                            key={header}
                            className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {tableRows.length > 0 ? (
                        tableRows.map((row) => {
                          const img =
                            row.image_url ||
                            (Array.isArray(row.additional_images) &&
                              row.additional_images[0]) ||
                            "";
                          return (
                            <tr
                              key={row.id}
                              className="hover:bg-gray-50/50 transition-colors"
                            >
                              <td
                                className="px-6 py-4 whitespace-nowrap align-top"
                                style={{ verticalAlign: "top", maxWidth: 420 }}
                              >
                                <div className="flex items-start">
                                  <div className="flex-shrink-0 h-16 w-16">
                                    <img
                                      className="h-16 w-16 rounded-lg object-cover border"
                                      style={{ borderColor: "#e5e7eb" }}
                                      src={
                                        img ||
                                        "https://via.placeholder.com/64x64/F3F4F6/9CA3AF?text=No+Image"
                                      }
                                      alt={row.name}
                                    />
                                  </div>
                                  <div className="ml-4">
                                    <div
                                      className="text-sm font-medium text-gray-900"
                                      style={{ maxWidth: 380 }}
                                    >
                                      {row.name}
                                    </div>
                                    <div
                                      className="text-sm text-gray-500 mt-1"
                                      style={{
                                        maxWidth: 380,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                      }}
                                    >
                                      {row.description || ""}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap align-top">
                                <div className="text-sm font-medium text-gray-900">
                                  ₨
                                  {Number(
                                    row.price || row.sale_price || 0
                                  ).toLocaleString()}
                                </div>
                                {row.sale_price ? (
                                  <div className="text-xs text-red-600">
                                    Sale: ₨
                                    {Number(row.sale_price).toLocaleString()}
                                  </div>
                                ) : null}
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap align-top">
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center text-sm text-gray-600">
                                    <FaEye className="w-3 h-3 mr-1" />
                                    {row.views || 0}
                                  </div>
                                  <div className="flex items-center text-sm text-gray-600">
                                    <FaMousePointer className="w-3 h-3 mr-1" />
                                    {row.clicks || 0}
                                  </div>
                                </div>
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap align-top">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    row.in_stock
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {row.in_stock ? "In Stock" : "Out of Stock"}
                                </span>
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium align-top">
                                <div className="flex justify-end space-x-2">
                                  <Link
                                    to={`/admin/edit-product/${row.id}`}
                                    className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                    title="Edit Product"
                                  >
                                    <FaEdit className="w-4 h-4" />
                                  </Link>
                                  <button
                                    onClick={() => handleDelete(row.id)}
                                    className="text-red-600 hover:text-red-900 p-1 rounded"
                                    title="Delete Product"
                                  >
                                    <FaTrash className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-12 text-center text-sm text-gray-500"
                          >
                            No products found. Try adjusting your search or add
                            a new product.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : activeTab === "orders" ? (
              <OrderManagement />
            ) : (
              <div>
                {/* Chart Controls */}
                <div className="flex justify-between items-center mb-6">
                  <h3
                    className="text-lg font-medium"
                    style={{ color: charcoal }}
                  >
                    Product Performance Analytics
                  </h3>
                  <div className="flex items-center space-x-4">
                    <label
                      className="text-sm font-medium"
                      style={{ color: charcoal }}
                    >
                      Show Top:
                    </label>
                    <select
                      value={productLimit}
                      onChange={(e) => setProductLimit(Number(e.target.value))}
                      className="px-3 py-1 border rounded-md text-sm focus:ring-2"
                      style={{ borderColor: "#e5e7eb", outline: "none" }}
                    >
                      <option value={5}>5 Products</option>
                      <option value={10}>10 Products</option>
                      <option value={15}>15 Products</option>
                      <option value={20}>20 Products</option>
                    </select>
                  </div>
                </div>

                {/* Chart */}
                <div
                  className="bg-white rounded-2xl border p-8 shadow-sm"
                  style={{ borderColor: "#e5e7eb" }}
                >
                  <div className="flex justify-between items-center mb-8">
                    <h3
                      className="text-2xl font-light"
                      style={{ color: charcoal }}
                    >
                      Product{" "}
                      <span className="font-medium" style={{ color: emerald }}>
                        Analytics
                      </span>
                    </h3>
                  </div>

                  <div style={{ height: 500 }}>
                    <Bar data={chartData} options={chartOptions} />
                  </div>
                </div>

                {/* Totals */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className="rounded-lg p-4"
                    style={{
                      background: `${emerald}1A`,
                      border: `1px solid ${emerald}33`,
                    }}
                  >
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded mr-3"
                        style={{ background: emerald }}
                      ></div>
                      <div>
                        <h4
                          className="text-sm font-medium"
                          style={{ color: charcoal }}
                        >
                          Total Views
                        </h4>
                        <p
                          className="text-2xl font-bold"
                          style={{ color: emerald }}
                        >
                          {topProducts
                            .reduce((sum, p) => sum + (p.views || 0), 0)
                            .toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className="rounded-lg p-4"
                    style={{
                      background: `${yellow}1A`,
                      border: `1px solid ${yellow}66`,
                    }}
                  >
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded mr-3"
                        style={{ background: yellow }}
                      ></div>
                      <div>
                        <h4
                          className="text-sm font-medium"
                          style={{ color: charcoal }}
                        >
                          Total Clicks
                        </h4>
                        <p
                          className="text-2xl font-bold"
                          style={{ color: charcoal }}
                        >
                          {topProducts
                            .reduce((sum, p) => sum + (p.clicks || 0), 0)
                            .toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
