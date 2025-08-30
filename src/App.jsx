// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import AddProduct from "./components/AddProduct";
import EditProduct from "./components/EditProduct";
import NotFound from "./components/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import AdminRedirect from "./components/AdminRedirect";
import Chatbot from "./components/Chatbot";
import "./App.css";

// Component to conditionally render Navbar and Footer
const Layout = ({ children }) => {
  const location = useLocation();
  
  // Hide navbar and footer on admin routes
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return (
    <>
      {!isAdminRoute && <Navbar />}
      <main>
        {children}
      </main>
      {!isAdminRoute && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop /> {/* Ensure pages start at the top */}
        <div className="App">
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/about" element={<About />} />

              {/* Admin Redirect Route */}
              <Route path="/admin/login" element={<AdminRedirect />} />

              {/* Actual Admin Login Route */}
              <Route path="/admin/actual-login" element={<AdminLogin />} />

              {/* Protected Admin Routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/add-product" 
                element={
                  <ProtectedRoute>
                    <AddProduct />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/edit-product/:id" 
                element={
                  <ProtectedRoute>
                    <EditProduct />
                  </ProtectedRoute>
                } 
              />

              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
          <Chatbot /> {/* Add Chatbot */}
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
