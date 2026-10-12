import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import supabase from "../utils/supabase";

const emerald = "#008060";
const yellow = "#FFD700";
const white = "#FFFFFF";
const charcoal = "#333333";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated (Supabase session)
  useEffect(() => {
    let ignore = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!ignore && data?.session?.user) {
        const from = location.state?.from?.pathname || "/admin/dashboard";
        navigate(from, { replace: true });
      }
    })();
    return () => {
      ignore = true;
    };
  }, [navigate, location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        // Friendly messages
        const msg = String(signInError.message || "").toLowerCase();
        if (msg.includes("invalid login credentials")) {
          setError("Invalid credentials. Please check your email and password.");
        } else if (msg.includes("email not confirmed")) {
          setError("Please verify your email before signing in.");
        } else {
          setError("Login failed. Please try again.");
        }
        return;
      }
      const from = location.state?.from?.pathname || "/admin/dashboard";
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Admin login error:", err);
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8" style={{ backgroundColor: "#f5f7f6" }}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: emerald }}
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold" style={{ color: charcoal }}>
          Admin Login
        </h2>
        <p className="mt-2 text-center text-sm" style={{ color: `${charcoal}b3` }}>
          Sign in to access the admin dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border" style={{ backgroundColor: white, borderColor: "#e5e7eb" }}>
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="rounded-md p-4 border" style={{ backgroundColor: "#FEF2F2", borderColor: "#FECACA" }}>
                <div className="flex">
                  <svg className="w-5 h-5" style={{ color: "#F87171" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm" style={{ color: "#991B1B" }}>{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: charcoal }}>
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-md transition-colors outline-none"
                placeholder="you@example.com"
                style={{ border: "1px solid #d1d5db", color: charcoal, backgroundColor: white }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${yellow}`)}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: charcoal }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-md transition-colors outline-none"
                placeholder="Enter your password"
                style={{ border: "1px solid #d1d5db", color: charcoal, backgroundColor: white }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${yellow}`)}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: emerald, color: white }}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 mr-2" style={{ borderColor: white, borderTopColor: "transparent" }}></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm font-medium"
              style={{ color: emerald }}
            >
              ← Back to Homepage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;