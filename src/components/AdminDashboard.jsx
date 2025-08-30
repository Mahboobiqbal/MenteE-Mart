import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaArrowLeft, FaSearch, FaFilter, FaSort, FaEye, FaMousePointer, FaEdit, FaTrash } from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth(); // Use AuthContext instead of localStorage
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("table");
  const [sortBy, setSortBy] = useState("views-high");
  const [productLimit, setProductLimit] = useState(10);

  // Remove the problematic useEffect that was causing the infinite loop
  useEffect(() => {
    fetchProducts();
  }, []); // Only run once on mount

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        setProducts(products.filter(product => product.id !== id));
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout(); // Use AuthContext logout
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      navigate("/");
    }
  };

  const filteredProducts = products
    .filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
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
          return a.name.localeCompare(b.name);
        case "price-high":
          return (b.price || 0) - (a.price || 0);
        case "price-low":
          return (a.price || 0) - (b.price || 0);
        default:
          return 0;
      }
    });

  const topProducts = filteredProducts.slice(0, productLimit);

  const chartData = {
    labels: topProducts.map(product => product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name),
    datasets: [
      {
        label: "Views",
        data: topProducts.map(product => product.views || 0),
        backgroundColor: "rgba(102, 0, 51, 0.6)",
        borderColor: "rgba(102, 0, 51, 1)",
        borderWidth: 1,
      },
      {
        label: "Clicks",
        data: topProducts.map(product => product.clicks || 0),
        backgroundColor: "rgba(168, 85, 247, 0.6)",
        borderColor: "rgba(168, 85, 247, 1)",
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
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: `Top ${productLimit} Products Analytics`,
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11
          },
          maxRotation: 45
        }
      }
    }
  };

  if (loading) {
    return (
  <div className="min-h-screen bg-neutral flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-secondary border-t-primary mx-auto mb-4"></div>
          <p className="text-lg text-primary font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-neutral">
      {/* Header */}
  <header className="bg-neutral/80 backdrop-blur-md border-b border-secondary sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate("/")}
                className="group flex items-center text-secondary hover:text-primary transition-all"
              >
                <FaArrowLeft className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Store</span>
              </button>
              <div>
                <h1 className="text-2xl font-light">
                  Admin <span className="font-medium text-primary">Dashboard</span>
                </h1>
                <p className="text-sm text-secondary">Manage your products and analytics</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-sm text-secondary">
                <span className="block text-xs text-secondary">Signed in as</span>
                <span className="font-medium">{currentUser?.email || 'Admin'}</span>
              </div>
              <Link
                to="/admin/add-product"
                className="bg-gradient-to-r from-primary to-accent text-white px-6 py-2.5 rounded-xl font-medium 
                         hover:shadow-lg hover:shadow-accent/50 transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Add Product
              </Link>
              <button
                onClick={handleLogout}
                className="text-secondary hover:text-primary text-sm font-medium transition-colors px-4 py-2 rounded-lg
                         hover:bg-pink-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Total Products",
              value: products.length,
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
              color: "bg-[#660033]/10 text-[#660033]"
            },
            {
              title: "Total Views",
              value: products.reduce((sum, product) => sum + (product.views || 0), 0).toLocaleString(),
              icon: <FaEye className="w-6 h-6" />,
              color: "bg-green-100 text-green-600"
            },
            {
              title: "Total Clicks",
              value: products.reduce((sum, product) => sum + (product.clicks || 0), 0).toLocaleString(),
              icon: <FaMousePointer className="w-6 h-6" />,
              color: "bg-blue-100 text-blue-600"
            },
            {
              title: "Avg. Views",
              value: products.length ? Math.round(products.reduce((sum, product) => sum + (product.views || 0), 0) / products.length) : 0,
              icon: <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h2a2 2 0 00-2-2z"></path>
                    </svg>,
              color: "bg-purple-100 text-purple-600"
            },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {stat.icon}
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-light mt-1">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("table")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "table"
                    ? "border-[#660033] text-[#660033]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Products Table
              </button>
              <button
                onClick={() => setActiveTab("charts")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "charts"
                    ? "border-[#660033] text-[#660033]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Analytics Chart
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === "table" ? (
              <div>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1 group">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 
                                        group-hover:text-[#660033] transition-colors" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-700
                                 focus:ring-2 focus:ring-[#660033]/20 focus:border-[#660033] transition-all
                                 group-hover:border-[#660033]/50"
                    />
                  </div>
                  <div className="flex gap-3">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#660033] focus:border-transparent"
                    >
                      <option value="views-high">Views (High to Low)</option>
                      <option value="views-low">Views (Low to High)</option>
                      <option value="clicks-high">Clicks (High to Low)</option>
                      <option value="clicks-low">Clicks (Low to High)</option>
                      <option value="name">Name (A-Z)</option>
                      <option value="price-high">Price (High to Low)</option>
                      <option value="price-low">Price (Low to High)</option>
                    </select>
                  </div>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {["Product", "Price", "Analytics", "Status", "Actions"].map((header) => (
                          <th key={header} className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-16 w-16">
                                <img
                                  className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                                  src={product.imageUrl}
                                  alt={product.name}
                                  onError={(e) => {
                                    e.target.src = "https://via.placeholder.com/64x64/F3F4F6/9CA3AF?text=No+Image";
                                  }}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 max-w-xs">
                                  {product.name}
                                </div>
                                <div className="text-sm text-gray-500 max-w-xs truncate">
                                  {product.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              ₨{product.price?.toLocaleString()}
                            </div>
                            {product.salePrice && (
                              <div className="text-xs text-red-600">
                                Sale: ₨{product.salePrice?.toLocaleString()}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center text-sm text-gray-600">
                                <FaEye className="w-3 h-3 mr-1" />
                                {product.views || 0}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <FaMousePointer className="w-3 h-3 mr-1" />
                                {product.clicks || 0}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              product.inStock 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <Link
                                to={`/admin/edit-product/${product.id}`}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                title="Edit Product"
                              >
                                <FaEdit className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded"
                                title="Delete Product"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8v2a1 1 0 01-1 1H7a1 1 0 01-1-1V5a1 1 0 011-1h10a1 1 0 011 1zM8 13h.01M16 13h.01" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                    <p className="mt-1 text-sm text-gray-500">Try adjusting your search terms.</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {/* Chart Controls */}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Product Performance Analytics</h3>
                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">Show Top:</label>
                    <select
                      value={productLimit}
                      onChange={(e) => setProductLimit(Number(e.target.value))}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#660033] focus:border-transparent"
                    >
                      <option value={5}>5 Products</option>
                      <option value={10}>10 Products</option>
                      <option value={15}>15 Products</option>
                      <option value={20}>20 Products</option>
                    </select>
                  </div>
                </div>

                {/* Chart */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-light">
                      Product <span className="font-medium text-[#660033]">Analytics</span>
                    </h3>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-600">Show Top</span>
                      <select
                        value={productLimit}
                        onChange={(e) => setProductLimit(Number(e.target.value))}
                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 
                                 focus:ring-[#660033]/20 focus:border-[#660033] transition-all"
                      >
                        {[5, 10, 15, 20].map(num => (
                          <option key={num} value={num}>{num} Products</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div style={{ height: '500px' }}>
                    <Bar data={chartData} options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          ...chartOptions.plugins.legend,
                          labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                              size: 12,
                              family: "'Inter', sans-serif"
                            }
                          }
                        }
                      }
                    }} />
                  </div>
                </div>

                {/* Chart Legend */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#660033]/10 border border-[#660033]/20 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-[#660033] rounded mr-3"></div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Total Views</h4>
                        <p className="text-2xl font-bold text-[#660033]">
                          {topProducts.reduce((sum, product) => sum + (product.views || 0), 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-purple-500 rounded mr-3"></div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Total Clicks</h4>
                        <p className="text-2xl font-bold text-purple-600">
                          {topProducts.reduce((sum, product) => sum + (product.clicks || 0), 0).toLocaleString()}
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