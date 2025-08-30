import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { fetchDescription } from "../utils/groq";

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    salePrice: "",
    category: "",
    imageUrl: "",
    inStock: true,
    featured: false,
  });

  const categories = [
    { id: "cleansers", name: "Cleansers", icon: "🧴" },
    { id: "moisturizers", name: "Moisturizers", icon: "✨" },
    { id: "serums", name: "Serums & Treatments", icon: "💧" },
    { id: "sunscreens", name: "Sunscreens", icon: "☀️" },
    { id: "masks", name: "Face Masks", icon: "🎭" },
    { id: "lipbody", name: "Lip & Body Care", icon: "💋" }
  ];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            name: data.name || "",
            description: data.description || "",
            price: data.price || "",
            salePrice: data.salePrice || "",
            category: data.category || "",
            imageUrl: data.imageUrl || "",
            inStock: data.inStock !== false,
            featured: data.featured || false,
          });
        } else {
          alert("Product not found!");
          navigate("/admin/dashboard");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        alert("Error loading product data");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category || !formData.imageUrl) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const docRef = doc(db, "products", id);
      await updateDoc(docRef, {
        ...formData,
        price: parseFloat(formData.price),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        updatedAt: new Date(),
      });
      
      alert("Product updated successfully!");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Error updating product. Please try again.");
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

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#660033] mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Edit Product</h1>
              <p className="text-gray-600 mt-1">Update product information</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Status
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Regular Price (₨) *
                </label>
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

              {/* Image URL */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL *
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#660033] focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                  required
                />
                {formData.imageUrl && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-700 mb-2">Image Preview:</p>
                    <img
                      src={formData.imageUrl}
                      alt="Product preview"
                      className="w-32 h-32 object-cover rounded-md border border-gray-300"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/128x128/F3F4F6/9CA3AF?text=Invalid+URL";
                      }}
                    />
                  </div>
                )}
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
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#660033] focus:border-transparent"
                  placeholder="Enter product description..."
                />
              </div>
            </div>
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
                disabled={loading}
                className="px-6 py-3 bg-[#660033] hover:bg-[#4A0025] text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Updating Product..." : "Update Product"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;