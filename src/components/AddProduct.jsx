import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabase";
import { fetchDescription } from "../utils/groq";

const emerald = "#008060";
const yellow = "#FFD700";
const white = "#FFFFFF";
const charcoal = "#333333";

// Storage bucket name in Supabase (create it first and make it public or add upload policy)
const BUCKET = "product-images";

const slugify = (str = "") =>
  str
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    salePrice: "",
    category: "",
    inStock: true,
    featured: false,
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const categories = [
    { id: "cleansers", name: "Cleansers", icon: "🧴" },
    { id: "moisturizers", name: "Moisturizers", icon: "✨" },
    { id: "serums", name: "Serums & Treatments", icon: "💧" },
    { id: "sunscreens", name: "Sunscreens", icon: "☀️" },
    { id: "masks", name: "Face Masks", icon: "🎭" },
    { id: "lipbody", name: "Lip & Body Care", icon: "💋" },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length > 3) {
      alert("You can only upload up to 3 images");
      return;
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const invalidFiles = files.filter((file) => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      alert("Please select only image files (JPEG, PNG, WebP)");
      return;
    }

    const largeFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (largeFiles.length > 0) {
      alert("Each image must be less than 5MB");
      return;
    }

    setSelectedImages(files);

    const previews = files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target.result);
          reader.readAsDataURL(file);
        })
    );
    Promise.all(previews).then(setImagePreviews);
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const uploadImages = async () => {
    if (selectedImages.length === 0) {
      throw new Error("Please select at least one image");
    }

    setImageUploading(true);
    try {
      const urls = [];
      const base = slugify(formData.name || "product");
      for (let i = 0; i < selectedImages.length; i++) {
        const file = selectedImages[i];
        const ext = (file.name.split(".").pop() || file.type.split("/")[1] || "jpg").toLowerCase();
        const path = `products/${base}/${Date.now()}-${i}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });
        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path);
        urls.push(publicData.publicUrl);
      }
      return urls;
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.category) {
      alert("Please fill in all required fields");
      return;
    }
    if (selectedImages.length === 0) {
      alert("Please select at least one product image");
      return;
    }

    setLoading(true);
    try {
      // 1) Upload images to Supabase Storage
      const imageUrls = await uploadImages();

      // 2) Prepare product payload
      const regularPrice = parseFloat(formData.price);
      const salePriceNum = formData.salePrice ? parseFloat(formData.salePrice) : null;

      const payload = {
        name: formData.name.trim(),
        slug: slugify(formData.name),
        description: formData.description.trim(),
        category: formData.category,
        regular_price: regularPrice,
        sale_price: salePriceNum,
        price: salePriceNum ?? regularPrice,
        in_stock: formData.inStock,
        featured: formData.featured,
        image_url: imageUrls[0],
        additional_images: imageUrls.slice(1),
        rating: 0,
        reviews: 0,
        views: 0,
        clicks: 0,
        whatsapp_clicks: 0,
        views_by_date: {},
        clicks_by_date: {},
        created_at: new Date().toISOString(),
      };

      // 3) Insert into Supabase table
      const { error: insertError } = await supabase.from("products").insert([payload]);
      if (insertError) throw insertError;

      alert("Product added successfully!");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Supabase error:", error);
      alert("Error adding product: " + (error?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const generateDescription = async () => {
    const prompt = `
      Generate a product description for:
      Name: ${formData.name}
      Category: ${formData.category}
      Price: ₨${formData.price}
      Sale Price: ₨${formData.salePrice || "N/A"}
      Stock Status: ${formData.inStock ? "In Stock" : "Out of Stock"}
      Featured: ${formData.featured ? "Yes" : "No"}
    `;
    try {
      const description = await fetchDescription(prompt);
      setFormData((prev) => ({ ...prev, description }));
    } catch (error) {
      alert("Failed to generate description: " + error.message);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f7f6" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="rounded-lg border p-6 mb-8" style={{ backgroundColor: white, borderColor: "#e5e7eb" }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold" style={{ color: charcoal }}>Add New Product</h1>
              <p className="mt-1" style={{ color: `${charcoal}b3` }}>Create a new product listing</p>
            </div>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="flex items-center"
              style={{ color: charcoal }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg border p-6" style={{ backgroundColor: white, borderColor: "#e5e7eb" }}>
            <h2 className="text-lg font-medium mb-6" style={{ color: charcoal }}>Product Information</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium mb-2" style={{ color: charcoal }}>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-md outline-none transition"
                  placeholder="Enter product name"
                  required
                  style={{ border: "1px solid #d1d5db", color: charcoal, backgroundColor: white }}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${yellow}`)}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: charcoal }}>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-md outline-none transition bg-white"
                  required
                  style={{ border: "1px solid #d1d5db", color: charcoal }}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${yellow}`)}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock + Featured */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: charcoal }}>Stock Status</label>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="inStock"
                      checked={formData.inStock}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border"
                      style={{ accentColor: emerald, borderColor: "#d1d5db" }}
                    />
                    <span className="ml-2 text-sm" style={{ color: charcoal }}>In Stock</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="h-4 w-4 rounded border"
                      style={{ accentColor: emerald, borderColor: "#d1d5db" }}
                    />
                    <span className="ml-2 text-sm" style={{ color: charcoal }}>Featured Product</span>
                  </label>
                </div>
              </div>

              {/* Regular Price */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: charcoal }}>
                  Regular Price (₨) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-md outline-none transition"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                  style={{ border: "1px solid #d1d5db", color: charcoal, backgroundColor: white }}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${yellow}`)}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                />
              </div>

              {/* Sale Price */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: charcoal }}>
                  Sale Price (₨) <span className="text-xs" style={{ color: `${charcoal}99` }}>(Optional)</span>
                </label>
                <input
                  type="number"
                  name="salePrice"
                  value={formData.salePrice}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-md outline-none transition"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  style={{ border: "1px solid #d1d5db", color: charcoal, backgroundColor: white }}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${yellow}`)}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                />
              </div>

              {/* Description */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium mb-2" style={{ color: charcoal }}>
                  Description
                  <span
                    onClick={generateDescription}
                    className="ml-2 cursor-pointer"
                    style={{ color: emerald }}
                    title="Auto-generate with AI"
                  >
                    [Generate]
                  </span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 rounded-md outline-none transition"
                  placeholder="Enter product description..."
                  style={{ border: "1px solid #d1d5db", color: charcoal, backgroundColor: white }}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${yellow}`)}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                />
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="rounded-lg border p-6" style={{ backgroundColor: white, borderColor: "#e5e7eb" }}>
            <h2 className="text-lg font-medium mb-6" style={{ color: charcoal }}>Product Images</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: charcoal }}>
                Upload Images * (Up to 3 images)
              </label>
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center transition-colors"
                style={{ borderColor: "#d1d5db" }}
              >
                <input type="file" id="images" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                <label htmlFor="images" className="cursor-pointer flex flex-col items-center">
                  <svg className="w-12 h-12 mb-4" style={{ color: "#9ca3af" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  <span className="font-medium" style={{ color: charcoal }}>Click to upload images</span>
                  <span className="text-sm mt-1" style={{ color: `${charcoal}99` }}>PNG, JPG, WebP up to 5MB each</span>
                </label>
              </div>
              <p className="text-sm mt-2" style={{ color: `${charcoal}99` }}>
                First image will be the main product image. Maximum 3 images allowed.
              </p>
            </div>

            {imagePreviews.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3" style={{ color: charcoal }}>Image Previews:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Product ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md"
                        style={{ border: "1px solid #d1d5db" }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                        style={{ backgroundColor: "#EF4444" }}
                        title="Remove"
                      >
                        ×
                      </button>
                      {index === 0 && (
                        <span
                          className="absolute top-2 left-2 text-white px-2 py-1 text-xs rounded"
                          style={{ backgroundColor: emerald }}
                        >
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="rounded-lg border p-6" style={{ backgroundColor: white, borderColor: "#e5e7eb" }}>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate("/admin/dashboard")}
                className="px-6 py-3 rounded-md font-medium transition-colors"
                style={{ border: "1px solid #d1d5db", color: charcoal, backgroundColor: white }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || imageUploading}
                className="px-6 py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: emerald, color: white }}
              >
                {loading ? (imageUploading ? "Uploading Images..." : "Adding Product...") : "Add Product"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;