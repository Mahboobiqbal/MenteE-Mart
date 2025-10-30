import { createClient } from "@supabase/supabase-js";
import { Buffer } from "buffer";

// This endpoint is intended to run as a serverless function (Vercel, Netlify functions, etc.).
// It uses the SUPABASE_SERVICE_ROLE_KEY (keep this secret) to upload files to Storage on behalf
// of an authenticated user. The client must send an Authorization: Bearer <access_token> header.

// Note: environment variables are read inside the handler so this module can be bundled
// safely for environments where `process` isn't available at parse time.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Read server-side env vars here (inside handler) to avoid referencing `process` at module scope
    const env =
      (typeof globalThis !== "undefined" &&
        globalThis["process"] &&
        globalThis["process"].env) ||
      {};
    const SUPABASE_URL = env.VITE_SUPABASE_URL || env.SUPABASE_URL || undefined;
    const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || undefined;
    const UPLOAD_BUCKET = env.SUPABASE_UPLOAD_BUCKET || "product-images";
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

    // Allow uploads if either:
    // - a valid Supabase access token is provided in Authorization: Bearer <token>
    // - a server-side admin passcode is provided via x-admin-passcode header
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

    // If token present, verify it belongs to a real user
    if (token && !isAdminBypass) {
      const { data, error: userErr } = await admin.auth.getUser(token);
      if (userErr || !data?.user) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }
    }

    const { fileName, fileType, base64, path } = req.body || {};
    if (!fileName || !base64)
      return res
        .status(400)
        .json({ error: "Missing fileName or base64 payload" });

    const storagePath = path || `products/${fileName}`;
    const buffer = Buffer.from(base64, "base64");

    const { error: uploadError } = await admin.storage
      .from(UPLOAD_BUCKET)
      .upload(storagePath, buffer, { contentType: fileType, upsert: false });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return res
        .status(500)
        .json({ error: uploadError.message || "Upload failed" });
    }

    const { data: publicData } = admin.storage
      .from(UPLOAD_BUCKET)
      .getPublicUrl(storagePath);

    return res.status(200).json({ publicUrl: publicData.publicUrl });
  } catch (err) {
    console.error("Unexpected error in upload handler:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
