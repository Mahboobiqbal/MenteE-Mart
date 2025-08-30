import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { fetchDescription } from "../utils/groq";

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
    const files = Array.from(e.target.files);

    if (files.length > 3) {
      alert("You can only upload up to 3 images");
      return;
    }

    // Validate file types
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const invalidFiles = files.filter((file) => !validTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      alert("Please select only image files (JPEG, PNG, WebP)");
      return;
    }

    // Check file sizes (max 5MB per image for ImgBB)
    const largeFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (largeFiles.length > 0) {
      alert("Each image must be less than 5MB");
      return;
    }

    setSelectedImages(files);

    // Create previews
    const previews = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previews).then(setImagePreviews);
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const uploadToImgBB = async (imageFile) => {
    // Use import.meta.env for Vite environment variables
    const apiKey = import.meta.env.VITE_IMGBB_API_KEY;

    console.log("API Key:", apiKey); // Debug log

    if (!apiKey) {
      throw new Error("ImgBB API key is not configured. Check your .env file.");
    }

    const uploadFormData = new FormData();
    uploadFormData.append("image", imageFile);

    try {
      // Use query parameter method for ImgBB API
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: uploadFormData,
      });

      const result = await response.json();

      console.log("ImgBB Response:", result); // Debug log

      if (!result.success) {
        throw new Error(result.error?.message || "Failed to upload image to ImgBB");
      }

      return result.data.url;
    } catch (error) {
      console.error("ImgBB upload error:", error);
      throw new Error(`Image upload failed: ${error.message}`);
    }
  };

  const uploadImages = async () => {
    if (selectedImages.length === 0) {
      throw new Error("Please select at least one image");
    }

    setImageUploading(true);
    try {
      const imageUrls = [];

      // Upload images one by one for better error handling
      for (let i = 0; i < selectedImages.length; i++) {
        console.log(`Uploading image ${i + 1}/${selectedImages.length}`);
        const url = await uploadToImgBB(selectedImages[i]);
        imageUrls.push(url);
      }

      return imageUrls;
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
      // Upload images first
      const imageUrls = await uploadImages();

      // Add product to database
      await addDoc(collection(db, "products"), {
        ...formData,
        price: parseFloat(formData.price),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        imageUrl: imageUrls[0], // Main image
        additionalImages: imageUrls.slice(1), // Additional images
        createdAt: new Date(),
        views: 0,
        clicks: 0,
      });

      alert("Product added successfully!");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Error adding product: " + error.message);
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Add New Product</h1>
              <p className="text-gray-600 mt-1">Create a new product listing</p>
            </div>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="text-gray-600 hover:text-gray-900 flex items-center"
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
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Product Information</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#660033] focus:border-transparent"
                  placeholder="Enter product name"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#660033] focus:border-transparent bg-white"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Status</label>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="inStock"
                      checked={formData.inStock}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-[#660033] focus:ring-[#660033] border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">In Stock</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-[#660033] focus:ring-[#660033] border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Featured Product</span>
                  </label>
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Regular Price (₨) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#660033] focus:border-transparent"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              {/* Sale Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sale Price (₨)
                  <span className="text-gray-500 text-xs ml-1">(Optional)</span>
                </label>
                <input
                  type="number"
                  name="salePrice"
                  value={formData.salePrice}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#660033] focus:border-transparent"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Description */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                  <span
                    onClick={generateDescription}
                    className="ml-2 text-[#660033] hover:text-[#4A0025] cursor-pointer transition-colors"
                  >
                    [Generate]
                  </span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#660033] focus:border-transparent"
                  placeholder="Enter product description..."
                />
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Product Images</h2>

            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images * (Up to 3 images)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#660033] transition-colors">
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="images"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  <span className="text-gray-600 font-medium">Click to upload images</span>
                  <span className="text-gray-400 text-sm mt-1">PNG, JPG, WebP up to 5MB each</span>
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                First image will be the main product image. Maximum 3 images allowed.
              </p>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Image Previews:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Product ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                      >
                        ×
                      </button>
                      {index === 0 && (
                        <span className="absolute top-2 left-2 bg-[#660033] text-white px-2 py-1 text-xs rounded">
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
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate("/admin/dashboard")}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || imageUploading}
                className="px-6 py-3 bg-[#660033] hover:bg-[#4A0025] text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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