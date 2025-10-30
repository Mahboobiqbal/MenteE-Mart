import { createClient } from "@supabase/supabase-js";

// Serverless endpoint to create a product record using the service role key.
// Accepts JSON { product: {...} } and requires either a valid Supabase access token
// (Authorization: Bearer <token>) or an admin passcode header x-admin-passcode.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const env =
      (typeof globalThis !== "undefined" &&
        globalThis["process"] &&
        globalThis["process"].env) ||
      {};
    const SUPABASE_URL = env.VITE_SUPABASE_URL || env.SUPABASE_URL || undefined;
    const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || undefined;
    const ADMIN_PASSCODE = env.SUPABASE_ADMIN_PASSCODE || undefined;

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      console.error(
        "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in server environment"
      );
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const auth = req.headers.authorization || "";
    const token = auth.split(" ")[1];
    const adminPassHeader =
      req.headers["x-admin-passcode"] || req.headers["X-Admin-Passcode"];

    let isAdminBypass = false;
    if (!token) {
      if (!adminPassHeader) {
        return res
          .status(401)
          .json({ error: "Missing Authorization token or admin passcode" });
      }
      if (!ADMIN_PASSCODE || adminPassHeader !== ADMIN_PASSCODE) {
        return res.status(401).json({ error: "Invalid admin passcode" });
      }
      isAdminBypass = true;
    }

    if (token && !isAdminBypass) {
      const { data, error: userErr } = await admin.auth.getUser(token);
      if (userErr || !data?.user) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }
    }

    const { product } = req.body || {};
    if (!product)
      return res.status(400).json({ error: "Missing product payload" });

    const { data, error } = await admin.from("products").insert([product]);
    if (error) {
      console.error("Insert error:", error);
      return res.status(500).json({ error: error.message || "Insert failed" });
    }

    return res.status(200).json({ product: data?.[0] || null });
  } catch (err) {
    console.error("Unexpected error in create-product handler:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
