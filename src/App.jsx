// src/App.jsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
const Home = lazy(() => import("./components/Home"));
const About = lazy(() => import("./pages/About"));
const ProductCard = lazy(() => import("./components/ProductCard")); // if you have ProductDetails, import that instead
const AddProduct = lazy(() => import("./components/AddProduct"));
const EditProduct = lazy(() => import("./components/EditProduct"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const AdminGate = lazy(() => import("./components/AdminGate"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const Products = lazy(() => import("./pages/Products"));
const Categories = lazy(() => import("./pages/Categories"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
import { CartProvider } from "./context/CartContext";
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutForm = lazy(() => import("./components/checkout/CheckoutForm"));
const PaymentConfirmation = lazy(() => import("./pages/PaymentConfirmation"));
const EnhancedOrderTracking = lazy(() =>
  import("./pages/EnhancedOrderTracking")
);
const UnifiedAdminLayout = lazy(() =>
  import("./components/admin/UnifiedAdminLayout")
);
const UnifiedDashboard = lazy(() =>
  import("./components/admin/UnifiedDashboard")
);
const StoreManagement = lazy(() =>
  import("./components/admin/StoreManagement")
);
const StoreProductManagement = lazy(() =>
  import("./components/admin/StoreProductManagement")
);
const OrderManagement = lazy(() =>
  import("./components/admin/OrderManagement")
);
const CategoryManagement = lazy(() =>
  import("./components/admin/CategoryManagement")
);
const ShippingAreasManagement = lazy(() =>
  import("./components/admin/ShippingAreasManagement")
);
const BusinessAnalytics = lazy(() =>
  import("./components/admin/BusinessAnalytics")
);
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
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              Loading...
            </div>
          }
        >
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
              path="/admin/shipping-areas"
              element={
                <ProtectedRoute>
                  <UnifiedAdminLayout title="Shipping Areas Management">
                    <ShippingAreasManagement />
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
                    <BusinessAnalytics />
                  </UnifiedAdminLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/business-analytics"
              element={
                <ProtectedRoute>
                  <UnifiedAdminLayout title="Business Analytics">
                    <BusinessAnalytics />
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
              path="/categories"
              element={
                <Layout>
                  <Categories />
                </Layout>
              }
            />
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
            <Route
              path="/cart"
              element={
                <Layout>
                  <CartPage />
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
        </Suspense>
      </Router>
    </CartProvider>
  );
};

export default App;
