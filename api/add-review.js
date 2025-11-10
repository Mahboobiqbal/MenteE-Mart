import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

const isUuid = (value) =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const sanitizeReviewList = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn("Failed to parse review column:", error);
      return [];
    }
  }
  return [];
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const env =
      (typeof globalThis !== "undefined" &&
        globalThis.process &&
        globalThis.process.env) ||
      {};
    const SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL || undefined;
    const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || undefined;

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      console.error(
        "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in server environment"
      );
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    const { productId, review } = req.body || {};

    if (!productId) {
      return res.status(400).json({ error: "Missing productId" });
    }

    const message = review?.message?.trim();
    if (!message) {
      return res.status(400).json({ error: "Review message is required" });
    }

    const author = review?.author?.trim() || "Anonymous";

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const selector = isUuid(productId)
      ? { column: "id", value: productId }
      : { column: "slug", value: productId };

    const { data: product, error: fetchError } = await admin
      .from("products")
      .select("id, review, reviews")
      .eq(selector.column, selector.value)
      .maybeSingle();

    if (fetchError) {
      console.error("Failed to fetch product for review:", fetchError);
      return res
        .status(500)
        .json({ error: fetchError.message || "Failed to load product" });
    }

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const reviewList = sanitizeReviewList(product.review);
    const newReview = {
      id: randomUUID(),
      author,
      message,
      created_at: new Date().toISOString(),
    };

    const updatedList = [newReview, ...reviewList];

    const { error: updateError } = await admin
      .from("products")
      .update({
        review: updatedList,
        reviews: updatedList.length,
      })
      .eq("id", product.id)
      .select("id")
      .maybeSingle();

    if (updateError) {
      console.error("Failed to update product reviews:", updateError);
      return res
        .status(500)
        .json({ error: updateError.message || "Failed to store review" });
    }

    return res
      .status(200)
      .json({ review: newReview, total: updatedList.length });
  } catch (error) {
    console.error("Unexpected error in add-review handler:", error);
    return res.status(500).json({ error: error.message || "Server error" });
  }
}
