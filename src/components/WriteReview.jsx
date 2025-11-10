import React, { useState } from "react";
import supabase from "../utils/supabase";

const emerald = "#008060";
const white = "#FFFFFF";
const charcoal = "#1F2933";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const WriteReview = ({ productId, productName, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!productId) {
    return (
      <div className="text-center p-4">
        <p className="text-sm text-gray-600">
          Unable to load product details. Please close and try again.
        </p>
      </div>
    );
  }

  const sanitizeExistingReview = (entry, index) => {
    if (!entry) return null;

    const text =
      typeof entry.message === "string"
        ? entry.message.trim()
        : typeof entry.comment === "string"
        ? entry.comment.trim()
        : "";
    if (!text) return null;

    const authorText =
      typeof entry.author === "string"
        ? entry.author.trim()
        : typeof entry.user_name === "string"
        ? entry.user_name.trim()
        : "";

    return {
      id: entry.id || entry.review_id || entry.uuid || `legacy-review-${index}`,
      author: authorText || "Anonymous",
      message: text,
      created_at:
        entry.created_at || entry.createdAt || new Date().toISOString(),
    };
  };

  const parseReviewList = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw))
      return raw.map(sanitizeExistingReview).filter(Boolean);
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed)
          ? parsed.map(sanitizeExistingReview).filter(Boolean)
          : [];
      } catch (parseError) {
        console.warn("Failed to parse review column:", parseError);
        return [];
      }
    }
    return [];
  };

  const buildReview = (author, content) => ({
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `review-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    author: author || "Anonymous",
    message: content,
    created_at: new Date().toISOString(),
  });

  const submitViaSupabase = async (author, content) => {
    const selectorColumn = UUID_PATTERN.test(productId || "") ? "id" : "slug";

    const { data, error: fetchError } = await supabase
      .from("products")
      .select("id, review, reviews")
      .eq(selectorColumn, productId)
      .maybeSingle();

    if (fetchError) {
      throw new Error(fetchError.message || "Unable to load product");
    }

    if (!data?.id) {
      throw new Error("Product not found");
    }

    const currentReviews = parseReviewList(data.review);
    const newReview = buildReview(author, content);
    const updatedReviews = [newReview, ...currentReviews];

    const { error: updateError } = await supabase
      .from("products")
      .update({
        review: updatedReviews,
        reviews: updatedReviews.length,
      })
      .eq("id", data.id);

    if (updateError) {
      throw new Error(updateError.message || "Failed to save review");
    }

    return newReview;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      setError("Please enter a review before submitting.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const author = name.trim();
      let createdReview = null;

      try {
        const response = await fetch("/api/add-review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId,
            review: {
              author,
              message: trimmedMessage,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          createdReview = data?.review || null;
        } else if (response.status === 404) {
          createdReview = await submitViaSupabase(author, trimmedMessage);
        } else {
          const data = await response.json().catch(() => ({}));
          throw new Error(
            data.error || `Failed to submit review (status ${response.status})`
          );
        }
      } catch (networkError) {
        console.warn(
          "Primary review endpoint failed, attempting Supabase fallback:",
          networkError
        );
        if (!createdReview) {
          createdReview = await submitViaSupabase(author, trimmedMessage);
        }
      }

      if (!createdReview) {
        throw new Error("Failed to create review. Please try again.");
      }

      setName("");
      setMessage("");

      onSuccess?.(createdReview);
    } catch (submitError) {
      console.error("Review submission failed:", submitError);
      setError(
        submitError?.message || "Failed to submit review. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900">
          Share Your Thoughts
        </h3>
        <p className="text-sm text-gray-600">
          Tell us what you think about {productName || "this product"}. No
          sign-in required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Name (optional)
          </label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full px-4 py-3 rounded-md border border-gray-200 focus:border-[#008060] focus:ring-2 focus:ring-[#008060]/30 outline-none transition"
            placeholder="Anonymous"
            maxLength={80}
            style={{ color: charcoal }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review *
          </label>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="w-full px-4 py-3 rounded-md border border-gray-200 focus:border-[#008060] focus:ring-2 focus:ring-[#008060]/30 outline-none transition h-32 resize-none"
            placeholder="Share the details you found helpful for future shoppers..."
            maxLength={1000}
            required
            style={{ color: charcoal }}
          />
          <div className="text-xs text-gray-500 mt-1">
            {message.length}/1000 characters
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="px-5 py-2 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: loading || !message.trim() ? "#E5E7EB" : emerald,
              color: loading || !message.trim() ? "#9CA3AF" : white,
            }}
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </form>

      <p className="text-xs text-gray-500">
        Reviews may be displayed publicly. Please avoid sharing personal or
        sensitive information.
      </p>
    </div>
  );
};

export default WriteReview;
