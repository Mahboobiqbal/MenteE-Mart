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
  const hasPass = typeof window !== "undefined" && sessionStorage.getItem("admin_ok") === "1";

  // Check Supabase session and subscribe to auth changes
  useEffect(() => {
    let active = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setUser(data?.session?.user || null);
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      active = false;
      sub?.subscription?.unsubscribe?.();
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

  if (!user && !hasPass) {
    return <Navigate to="/admin/enter" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;