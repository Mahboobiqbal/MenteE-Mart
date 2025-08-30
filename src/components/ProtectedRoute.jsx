import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
  <div className="min-h-screen flex justify-center items-center bg-neutral">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-secondary border-t-primary mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If user is logged in, they have access
  return children;
};

export default ProtectedRoute;