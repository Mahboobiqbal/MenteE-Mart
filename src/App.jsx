// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./components/Home";
import About from "./pages/About";
import ProductCard from "./components/ProductCard"; // if you have ProductDetails, import that instead
import AddProduct from "./components/AddProduct";
import EditProduct from "./components/EditProduct";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminGate from "./components/AdminGate";
import AdminDashboard from "./components/AdminDashboard";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Wishlist from "./pages/Wishlist";
import { CartProvider } from "./context/CartContext";
import CartDrawer from "./components/cart/CartDrawer";
import CheckoutForm from "./components/checkout/CheckoutForm";
import PaymentConfirmation from "./pages/PaymentConfirmation";
import EnhancedOrderTracking from "./pages/EnhancedOrderTracking";
import UnifiedAdminLayout from "./components/admin/UnifiedAdminLayout";
import UnifiedDashboard from "./components/admin/UnifiedDashboard";
import StoreManagement from "./components/admin/StoreManagement";
import StoreProductManagement from "./components/admin/StoreProductManagement";
import OrderManagement from "./components/admin/OrderManagement";
import CategoryManagement from "./components/admin/CategoryManagement";
import "./App.css";

// Component to always render Navbar and Footer (no admin routes)
const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
};

const App = () => {
  return (
    <CartProvider>
      <Router>
        <CartDrawer />
        <Routes>
          <Route
            path="/"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
          <Route
            path="/about"
            element={
              <Layout>
                <About />
              </Layout>
            }
          />

          {/* Admin Routes - Unified System */}
          <Route
            path="/admin/enter"
            element={
              <Layout>
                <AdminGate />
              </Layout>
            }
          />

          {/* Unified Admin System Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <UnifiedAdminLayout title="Dashboard">
                  <UnifiedDashboard />
                </UnifiedAdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/stores"
            element={
              <ProtectedRoute>
                <UnifiedAdminLayout title="Store Management">
                  <StoreManagement />
                </UnifiedAdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/stores/:storeId/products"
            element={
              <ProtectedRoute>
                <UnifiedAdminLayout title="Product Management">
                  <StoreProductManagement />
                </UnifiedAdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute>
                <UnifiedAdminLayout title="Category Management">
                  <CategoryManagement />
                </UnifiedAdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/stores/:storeId/orders"
            element={
              <ProtectedRoute>
                <UnifiedAdminLayout title="Order Management">
                  <OrderManagement />
                </UnifiedAdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute>
                <UnifiedAdminLayout title="Order Management">
                  <OrderManagement />
                </UnifiedAdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/products"
            element={
              <ProtectedRoute>
                <UnifiedAdminLayout title="Product Management">
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      All Products
                    </h1>
                    <p className="text-gray-600 mb-4">
                      Select a store to manage its products.
                    </p>
                    <a
                      href="/admin/stores"
                      className="text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Browse Stores →
                    </a>
                  </div>
                </UnifiedAdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute>
                <UnifiedAdminLayout title="Analytics">
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      Business Analytics
                    </h1>
                    <p className="text-gray-600 mb-4">
                      Detailed reports and commission tracking coming soon.
                    </p>
                    <a
                      href="/admin"
                      className="text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Back to Dashboard →
                    </a>
                  </div>
                </UnifiedAdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <UnifiedAdminLayout title="Settings">
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      System Settings
                    </h1>
                    <p className="text-gray-600 mb-4">
                      Configure your business settings and preferences.
                    </p>
                    <a
                      href="/admin"
                      className="text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Back to Dashboard →
                    </a>
                  </div>
                </UnifiedAdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Legacy routes for backward compatibility */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <UnifiedAdminLayout title="Dashboard">
                  <UnifiedDashboard />
                </UnifiedAdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-product"
            element={
              <ProtectedRoute>
                <UnifiedAdminLayout title="Add Product">
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      Add New Product
                    </h1>
                    <p className="text-gray-600 mb-4">
                      Please select a store to add products to.
                    </p>
                    <a
                      href="/admin/stores"
                      className="text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Browse Stores →
                    </a>
                  </div>
                </UnifiedAdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Public catalog routes */}
          <Route
            path="/products"
            element={
              <Layout>
                <Products />
              </Layout>
            }
          />
          <Route
            path="/product/:id"
            element={
              <Layout>
                <ProductDetail />
              </Layout>
            }
          />
          {/* Also allow slug-based route */}
          <Route
            path="/p/:slug"
            element={
              <Layout>
                <ProductDetail />
              </Layout>
            }
          />
          <Route
            path="/wishlist"
            element={
              <Layout>
                <Wishlist />
              </Layout>
            }
          />

          {/* Checkout routes */}
          <Route
            path="/checkout"
            element={
              <Layout>
                <CheckoutForm />
              </Layout>
            }
          />
          <Route
            path="/payment-confirmation"
            element={
              <Layout>
                <PaymentConfirmation />
              </Layout>
            }
          />
          <Route
            path="/track-order"
            element={
              <Layout>
                <EnhancedOrderTracking />
              </Layout>
            }
          />
          <Route
            path="/order-tracking"
            element={
              <Layout>
                <EnhancedOrderTracking />
              </Layout>
            }
          />

          <Route
            path="*"
            element={
              <Layout>
                <div className="max-w-7xl mx-auto p-6">Not Found</div>
              </Layout>
            }
          />
        </Routes>
      </Router>
    </CartProvider>
  );
};

export default App;
