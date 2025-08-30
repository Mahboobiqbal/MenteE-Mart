import React from "react";
import { useNavigate } from "react-router-dom";

const AdminRedirect = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Go to Products</h1>
        <p className="text-lg text-gray-600 mb-8">
          Explore our collection of premium beauty products.
        </p>
        <button
          onClick={() => navigate("/products")}
          className="bg-[#660033] hover:bg-[#4A0025] text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Go to Products
        </button>
        <p className="mt-6 text-sm text-gray-500">
          <span
            onClick={() => navigate("/admin/actual-login")}
            className="text-red-500 hover:text-[#4A0025] cursor-pointer transition-colors"
          >
            0HAh$@*&.nhERROR04
          </span>
        </p>
      </div>
    </div>
  );
};

export default AdminRedirect;