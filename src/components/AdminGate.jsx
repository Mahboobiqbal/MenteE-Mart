import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Eye, EyeOff, LockKeyhole, ArrowLeft, ShieldCheck } from "lucide-react";

const ADMIN_PASSCODE = "admin123";

const AdminGate = () => {
  const [code, setCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");
  const [shake, setShake] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { session, signIn } = useContext(AuthContext);

  // Silently sign into Supabase so RLS-protected admin writes work.
  // Requires VITE_ADMIN_EMAIL + VITE_ADMIN_PASSWORD env vars.
  const silentSignIn = async () => {
    const email = import.meta.env.VITE_ADMIN_EMAIL;
    const password = import.meta.env.VITE_ADMIN_PASSWORD;
    if (!email || !password) {
      setNotice(
        "Read-only mode: set VITE_ADMIN_EMAIL and VITE_ADMIN_PASSWORD to enable saving."
      );
      return false;
    }
    const { data, error } = await signIn(email, password);
    if (error) {
      console.warn("Silent admin sign-in failed:", error.message);
      setNotice(
        "Could not sign in to the database (" +
          error.message +
          "). Saving changes may fail."
      );
      return false;
    }
    try {
      const token = data?.session?.access_token;
      if (token) {
        const claims = JSON.parse(
          atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
        );
        console.log(
          "Admin session ready — JWT email claim:",
          claims.email,
          "| role:",
          claims.role
        );
      }
    } catch {
      // claim logging is best-effort
    }
    return true;
  };

  useEffect(() => {
    const prevPasscode = sessionStorage.getItem("admin_passcode_verified");
    if (prevPasscode === "1" && !session) {
      // Passcode verified earlier but no Supabase session (reload/expired):
      // re-establish it silently so admin writes keep working.
      silentSignIn().then(() => {
        const to = location.state?.from?.pathname || "/admin/dashboard";
        navigate(to, { replace: true });
      });
    } else if (prevPasscode === "1") {
      const to = location.state?.from?.pathname || "/admin/dashboard";
      navigate(to, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, location, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (code !== ADMIN_PASSCODE) {
      setErr("Invalid passcode. Please try again.");
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    setUnlocking(true);
    setErr("");
    setNotice("");
    sessionStorage.setItem("admin_passcode_verified", "1");
    sessionStorage.setItem("admin_ok", "1");

    await silentSignIn();

    const to = location.state?.from?.pathname || "/admin/dashboard";
    navigate(to, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-gray-50 via-emerald-50/40 to-gray-100">
      <div
        className={`w-full max-w-md transition-transform duration-300 ${
          shake ? "animate-[admin-shake_0.4s_ease-in-out]" : ""
        }`}
      >
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden">
          {/* Header band */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-6 sm:px-8 sm:py-7">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/15 backdrop-blur rounded-xl flex items-center justify-center ring-1 ring-white/25">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Mena Bazar Admin</h1>
                <p className="text-emerald-100 text-sm">Restricted area — authorized personnel only</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 sm:px-8 sm:py-7">
            <div className="flex items-center gap-2 mb-5">
              <LockKeyhole className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Enter Admin Passcode
              </h2>
            </div>

            {err && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                <span className="font-bold">!</span>
                <span>{err}</span>
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type={showCode ? "text" : "password"}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    if (err) setErr("");
                  }}
                  placeholder="••••••••"
                  autoFocus
                  disabled={unlocking}
                  className="w-full px-4 py-3.5 pr-12 rounded-xl border border-gray-300 text-gray-900 text-lg tracking-widest placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowCode((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                  aria-label={showCode ? "Hide passcode" : "Show passcode"}
                >
                  {showCode ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              <button
                type="submit"
                disabled={unlocking}
                className="w-full py-3.5 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-sm shadow-emerald-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70"
              >
                {unlocking ? "Unlocking..." : "Unlock Dashboard"}
              </button>
            </form>

            {notice && (
              <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
                {notice}
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 text-center">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </div>

      <style>{`
        @keyframes admin-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};

export default AdminGate;
