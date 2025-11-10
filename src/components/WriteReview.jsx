import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../utils/supabase";
import { useNavigate } from "react-router-dom";

const emerald = "#008060";
const white = "#FFFFFF";

const WriteReview = ({ productId, productName, onReviewSubmit }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    rating: 5,
    title: "",
    comment: "",
    images: [],
    purchaseDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      // Redirect to login or show login modal
      alert("Please sign in to write a review");
      return;
    }

    if (!formData.comment.trim() || formData.rating === 0) {
      alert("Please provide both a rating and comment");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("product_reviews")
        .insert([
          {
            product_id: productId,
            user_id: user.id,
            user_email: user.email,
            user_name:
              user.user_metadata?.full_name || user.email.split("@")[0],
            rating: formData.rating,
            comment: formData.comment,
            review_title: formData.title,
            review_images: formData.images,
            purchase_date: formData.purchaseDate || null,
            verified_purchase: false, // Will be validated by admin/backend
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Reset form
      setFormData({
        rating: 5,
        title: "",
        comment: "",
        images: [],
        purchaseDate: "",
      });

      // Notify parent component
      if (onReviewSubmit) {
        onReviewSubmit(data);
      }

      alert("Review submitted successfully!");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setImageUploading(true);
    const uploadedImages = [];

    try {
      for (const file of files.slice(0, 3)) {
        // Max 3 images
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `review-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          continue;
        }

        const { data } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        uploadedImages.push(data.publicUrl);
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedImages],
      }));
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Failed to upload images. Please try again.");
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  if (!user) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-[#008060]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-[#008060]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Sign in to write a review
        </h3>
        <p className="text-gray-600 mb-6">
          Share your experience with this product to help other customers
        </p>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-3 bg-[#008060] text-white rounded-lg font-semibold hover:bg-[#006B4F] transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Write a Review
        </h3>
        <p className="text-gray-600">
          Share your experience with "{productName}"
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Rating *
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData({ ...formData, rating: star })}
                className="text-3xl transition-colors hover:scale-110 transform"
                style={{
                  color: star <= formData.rating ? "#FFD700" : "#E5E7EB",
                }}
              >
                ⭐
              </button>
            ))}
            <span className="ml-3 text-sm text-gray-600">
              {formData.rating} out of 5 stars
            </span>
          </div>
        </div>

        {/* Review Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008060] focus:border-transparent outline-none transition"
            placeholder="Brief summary of your experience"
            maxLength={100}
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData.title.length}/100 characters
          </div>
        </div>

        {/* Review Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review *
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) =>
              setFormData({ ...formData, comment: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-lg h-32 resize-none focus:ring-2 focus:ring-[#008060] focus:border-transparent outline-none transition"
            placeholder="Share your detailed experience with this product..."
            maxLength={1000}
            required
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData.comment.length}/1000 characters
          </div>
        </div>

        {/* Purchase Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Purchase Date (Optional)
          </label>
          <input
            type="date"
            value={formData.purchaseDate}
            onChange={(e) =>
              setFormData({ ...formData, purchaseDate: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008060] focus:border-transparent outline-none transition"
            max={new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Photos (Optional)
          </label>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={imageUploading || formData.images.length >= 3}
                />
                <div className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#008060] transition-colors text-center">
                  {imageUploading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#008060] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-gray-600">
                        Uploading...
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-600">
                      {formData.images.length >= 3
                        ? "Max 3 images reached"
                        : "Click to add images"}
                    </span>
                  )}
                </div>
              </label>
            </div>

            {/* Image Preview */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Review image ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={
              loading || !formData.comment.trim() || formData.rating === 0
            }
            className="w-full py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background:
                !formData.comment.trim() || formData.rating === 0 || loading
                  ? "#E5E7EB"
                  : emerald,
              color:
                !formData.comment.trim() || formData.rating === 0 || loading
                  ? "#9CA3AF"
                  : white,
            }}
          >
            {loading ? "Submitting Review..." : "Submit Review"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WriteReview;
