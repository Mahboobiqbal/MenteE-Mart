import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import supabase from "../utils/supabase";

const emerald = "#008060";
const charcoal = "#333333";
const white = "#FFFFFF";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  // Initialize passcodeVerified at top level so it's available during render
  const passcodeVerified = sessionStorage.getItem("admin_passcode_verified") === "1";

  useEffect(() => {
    let active = true;

    (async () => {
      if (!active) return;

      // Check Supabase session
      const { data } = await supabase.auth.getSession();
      setUser(data?.session?.user || null);
      setLoading(false);
    })();

    // Unsubscribe after component unmounts
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center" style={{ backgroundColor: white }}>
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-16 w-16 border-4 mx-auto mb-4"
            style={{ borderColor: `${emerald}55`, borderTopColor: emerald }}
          />
          <p className="text-lg font-medium" style={{ color: charcoal }}>
            Verifying access...
          </p>
        </div>
      </div>
    );
  }

  // Allow access if: Supabase session valid OR passcode was verified
  const hasValidSession = user !== null;

  if (!hasValidSession && !passcodeVerified) {
    return <Navigate to="/admin/enter" state={{ from: location }} replace />;
  }

  // If passcode allowed but no Supabase session, still allow access
  if (!hasValidSession && passcodeVerified) {
    // Set a minimal user state so the UI renders correctly
    setUser({ email: "mahboobiqbal774@gmail.com" });
  }

  return children;
};

export default ProtectedRoute;