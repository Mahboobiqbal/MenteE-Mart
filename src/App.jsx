// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./components/Home";
import About from "./pages/About";
import ProductCard from "./components/ProductCard"; // if you have ProductDetails, import that instead
import AddProduct from "./components/AddProduct";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminGate from "./components/AdminGate";
import AdminDashboard from "./components/AdminDashboard"
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
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
    <Router>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        {/* Example product details route if implemented */}
        {/* <Route path="/product/:id" element={<Layout><ProductDetails /></Layout>} /> */}

        <Route path="/admin/enter" element={<Layout><AdminGate /></Layout>} />

        <Route
          path="/add-product"
          element={
            <Layout>
              <ProtectedRoute>
                <AddProduct />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <Layout>
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            </Layout>
          }
        />

        {/* Public catalog routes */}
        <Route path="/products" element={<Layout><Products /></Layout>} />
        <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
        {/* Also allow slug-based route */}
        <Route path="/p/:slug" element={<Layout><ProductDetail /></Layout>} />

        <Route path="*" element={<Layout><div className="max-w-7xl mx-auto p-6">Not Found</div></Layout>} />
      </Routes>
    </Router>
  );
};

export default App;
