import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const emerald = "#008060";
const yellow = "#FFD700";
const white = "#FFFFFF";
const charcoal = "#333333";

const AdminGate = () => {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = (e) => {
    e.preventDefault();
    const expected = import.meta.env.VITE_ADMIN_PASSCODE || "";
    if (!expected) {
      setErr("Admin passcode not configured.");
      return;
    }
    if (code === expected) {
      sessionStorage.setItem("admin_ok", "1");
      const to = location.state?.from?.pathname || "/admin/dashboard";
      navigate(to, { replace: true });
    } else {
      setErr("Invalid passcode.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#f5f7f6" }}
    >
      <div
        className="w-full max-w-sm rounded-xl border p-6"
        style={{ backgroundColor: white, borderColor: "#e5e7eb" }}
      >
        <h1 className="text-xl font-semibold mb-1" style={{ color: charcoal }}>
          Admin Access
        </h1>
        <p className="text-sm mb-4" style={{ color: `${charcoal}b3` }}>
          Enter passcode to continue
        </p>

        {err && (
          <div
            className="mb-3 rounded-md p-3 border"
            style={{
              backgroundColor: "#FEF2F2",
              borderColor: "#FECACA",
              color: "#991B1B",
            }}
          >
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Passcode"
            className="w-full px-4 py-3 rounded-md outline-none"
            style={{
              border: "1px solid #d1d5db",
              color: charcoal,
              backgroundColor: white,
            }}
            onFocus={(e) =>
              (e.currentTarget.style.boxShadow = `0 0 0 2px ${yellow}`)
            }
            onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
          />
          <button
            type="submit"
            className="w-full py-3 rounded-md font-medium"
            style={{ backgroundColor: emerald, color: white }}
          >
            Continue
          </button>
        </form>

        <button
          onClick={() => navigate("/")}
          className="mt-4 text-sm font-medium"
          style={{ color: emerald }}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default AdminGate;
