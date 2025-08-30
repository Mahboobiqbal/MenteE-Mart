import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">404: Page Not Found</h1>
        <p className="text-lg text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-[#660033] hover:bg-[#4A0025] text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Go to Homepage
        </button>
      </div>
    </div>
  );
};

export default NotFound;