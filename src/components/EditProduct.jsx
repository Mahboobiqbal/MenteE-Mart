import React, { useState, useEffect } from "react";
import supabase from "../utils/supabase";
import { useNavigate, useParams } from "react-router-dom";
import { fetchDescription } from "../utils/groq";
import { getAllCategories, getAllStores } from "../utils/storeManagement";
import SALE_EVENTS from "../constants/saleEvents";
import {
  productSupportsColumn,
  rememberProductColumnSupport,
} from "../utils/productSchema";

const BUCKET = "product-images";

const slugify = (str = "") =>
  str
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    salePrice: "",
    category: "",
    store: "", // NEW: Store field
    saleType: "", // NEW
    saleStart: "",
    saleEnd: "",
    inStock: true,
    featured: false,
  });
  const [existingImages, setExistingImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [saleSupport, setSaleSupport] = useState({
    type: false,
    start: false,
    end: false,
    checked: false,
  });

  // Load categories and stores directly from the database
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, storesData] = await Promise.all([
          getAllCategories(),
          getAllStores(),
        ]);
        setCategories(
          categoriesData.filter((category) => category.id !== "all")
        );
        setStores(storesData.filter((store) => store.id !== "all"));
      } catch (error) {
        console.error("Error loading data:", error);
        setCategories([]);
        setStores([]);
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        navigate("/admin/dashboard");
        return;
      }
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        if (!data) {
          alert("Product not found!");
          navigate("/admin/dashboard");
          return;
        }

        setFormData({
          name: data.name || "",
          description: data.description || "",
          // prefer price field; fallback to sale_price or regular_price if needed
          price:
            data.price != null
              ? String(data.price)
              : String(data.sale_price ?? data.regular_price ?? ""),
          salePrice: data.sale_price != null ? String(data.sale_price) : "",
          category: data.category || "",
          store: data.store || "", // NEW: Store field
          saleType: data.sale_type || "", // NEW
          saleStart: data.sale_start ? data.sale_start.slice(0, 10) : "",
          saleEnd: data.sale_end ? data.sale_end.slice(0, 10) : "",
          inStock: data.in_stock !== false,
          featured: data.featured || false,
        });
        const currentImages = [
          data.image_url,
          ...(Array.isArray(data.additional_images)
            ? data.additional_images
            : []),
        ].filter(Boolean);
        setExistingImages(currentImages);
        setSelectedImages([]);
        setImagePreviews([]);
      } catch (error) {
        console.error("Error fetching product:", error);
        alert("Error loading product data");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [typeSupported, startSupported, endSupported] = await Promise.all(
          [
            productSupportsColumn("sale_type"),
            productSupportsColumn("sale_start"),
            productSupportsColumn("sale_end"),
          ]
        );

        if (!active) return;

        rememberProductColumnSupport("sale_type", typeSupported);
        rememberProductColumnSupport("sale_start", startSupported);
        rememberProductColumnSupport("sale_end", endSupported);

        setSaleSupport({
          type: typeSupported,
          start: startSupported,
          end: endSupported,
          checked: true,
        });
      } catch (error) {
        if (!active) return;
        console.error("Failed to detect sale-related columns:", error);
        setSaleSupport({
          type: false,
          start: false,
          end: false,
          checked: true,
        });
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    if (files.length !== 3) {
      alert("Please select exactly 3 images");
      return;
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const invalidFiles = files.filter(
      (file) => !validTypes.includes(file.type)
    );
    if (invalidFiles.length > 0) {
      alert("Please select only image files (JPEG, PNG, WebP)");
      return;
    }

    const largeFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (largeFiles.length > 0) {
      alert("Each image must be under 5MB");
      return;
    }

    setSelectedImages(files);

    const previews = files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target?.result);
          reader.readAsDataURL(file);
        })
    );

    Promise.all(previews).then(setImagePreviews);
  };

  const removeImage = (index) => {
    const updatedFiles = selectedImages.filter((_, idx) => idx !== index);
    const updatedPreviews = imagePreviews.filter((_, idx) => idx !== index);
    setSelectedImages(updatedFiles);
    setImagePreviews(updatedPreviews);
  };

  const uploadImages = async () => {
    if (selectedImages.length < 1) {
      throw new Error("Please select at least 1 image before uploading");
    }

    if (selectedImages.length > 4) {
      throw new Error("Maximum 4 images allowed (1 required + 3 optional)");
    }

    setImageUploading(true);
    try {
      const urls = [];
      const base = slugify(formData.name || "product");

      const sessionResp = await supabase.auth.getSession();
      const token = sessionResp?.data?.session?.access_token;
      const headers = { "Content-Type": "application/json" };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      } else if (
        typeof window !== "undefined" &&
        sessionStorage.getItem("admin_ok") === "1"
      ) {
        const adminPass = import.meta.env.VITE_ADMIN_PASSCODE;
        if (!adminPass) {
          throw new Error(
            "Admin passcode is not configured (VITE_ADMIN_PASSCODE). Please configure it or sign in."
          );
        }
        headers["x-admin-passcode"] = adminPass;
      } else {
        throw new Error("You must be signed in to upload images.");
      }

      for (let index = 0; index < selectedImages.length; index += 1) {
        const file = selectedImages[index];
        const extension = (
          file.name.split(".").pop() ||
          file.type.split("/")[1] ||
          "jpg"
        ).toLowerCase();
        const timestamp = Date.now();
        const path = `products/${base}/${timestamp}-${index}.${extension}`;

        let uploadedUrl = null;

        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const result = ev.target?.result || "";
            resolve(result.split(",")[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        try {
          const response = await fetch("/api/upload", {
            method: "POST",
            headers,
            body: JSON.stringify({
              fileName: `${base}-${timestamp}-${index}.${extension}`,
              fileType: file.type,
              base64,
              path,
            }),
          });

          if (!response.ok) {
            if (response.status === 404) {
              console.warn(
                "/api/upload not found. Falling back to client upload."
              );
            } else {
              const json = await response.json().catch(() => ({}));
              throw new Error(
                json.error || `Upload failed (status ${response.status})`
              );
            }
          } else {
            const json = await response.json();
            uploadedUrl = json.publicUrl;
          }
        } catch (err) {
          console.warn("Server upload failed, attempting client upload:", err);
        }

        if (!uploadedUrl) {
          const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(path, file, { contentType: file.type, upsert: false });

          if (uploadError) {
            throw uploadError;
          }

          const { data: publicData } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(path);
          uploadedUrl = publicData?.publicUrl;
          if (!uploadedUrl) {
            throw new Error("Failed to obtain public URL from Supabase upload");
          }
        }

        urls.push(uploadedUrl);
      }

      return urls;
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.price ||
      !formData.category ||
      !formData.store
    ) {
      alert("Please fill in all required fields");
      return;
    }

    if (!existingImages.length && selectedImages.length < 1) {
      alert(
        "Please upload at least 1 product image (1 required, up to 4 total)"
      );
      return;
    }

    if (selectedImages.length > 4) {
      alert("Maximum 4 images allowed (1 required + 3 optional)");
      return;
    }

    if (selectedImages.length > 0 && selectedImages.length < 1) {
      alert("Please upload at least 1 product image to replace existing ones");
      return;
    }

    if (
      saleSupport.start &&
      saleSupport.end &&
      formData.saleStart &&
      formData.saleEnd &&
      formData.saleStart > formData.saleEnd
    ) {
      alert("Sale end date must be after the start date");
      return;
    }

    setLoading(true);
    try {
      let uploadedImageUrls = null;
      if (selectedImages.length === 3) {
        uploadedImageUrls = await uploadImages();
      }

      const updates = {
        name: formData.name.trim(),
        description: formData.description,
        price: parseFloat(formData.price),
        sale_price: formData.salePrice ? parseFloat(formData.salePrice) : null,
        category: formData.category,
        store: formData.store, // NEW: Store field
        in_stock: !!formData.inStock,
        featured: !!formData.featured,
        updated_at: new Date().toISOString(),
      };

      if (saleSupport.type) {
        updates.sale_type = formData.saleType || null;
      }
      if (saleSupport.start) {
        updates.sale_start = formData.saleStart || null;
      }
      if (saleSupport.end) {
        updates.sale_end = formData.saleEnd || null;
      }

      if (uploadedImageUrls) {
        updates.image_url = uploadedImageUrls[0];
        updates.additional_images = uploadedImageUrls.slice(1);
      } else if (existingImages.length) {
        updates.image_url = existingImages[0];
        updates.additional_images = existingImages.slice(1);
      }

      const { error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", id);
      if (error) throw error;

      alert("Product updated successfully!");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Error updating product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!saleSupport.checked) return;

    setFormData((prev) => {
      let changed = false;
      const next = { ...prev };

      if (!saleSupport.type && prev.saleType) {
        next.saleType = "";
        changed = true;
      }
      if (!saleSupport.start && prev.saleStart) {
        next.saleStart = "";
        changed = true;
      }
      if (!saleSupport.end && prev.saleEnd) {
        next.saleEnd = "";
        changed = true;
      }

      return changed ? next : prev;
    });
  }, [
    saleSupport.checked,
    saleSupport.type,
    saleSupport.start,
    saleSupport.end,
  ]);

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

  if (fetchLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#660033] mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">
            {dataLoading ? "Loading form data..." : "Loading product..."}
          </p>
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
              <h1 className="text-2xl font-semibold text-gray-900">
                Edit Product
              </h1>
              <p className="text-gray-600 mt-1">Update product information</p>
            </div>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="text-gray-600 hover:text-gray-900 flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                ></path>
              </svg>
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Product Information
            </h2>

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

              {/* Store */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store *
                </label>
                <select
                  name="store"
                  value={formData.store}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#660033] focus:border-transparent bg-white"
                  required
                >
                  <option value="">Select a store</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.name}>
                      {store.name} Products
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
                    <span className="ml-2 text-sm text-gray-700">
                      Featured Product
                    </span>
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

              {/* Product images */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images{" "}
                  {selectedImages.length
                    ? "(selected set will replace existing)"
                    : ""}
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageChange}
                  className="w-full"
                  disabled={imageUploading || loading}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Upload exactly 3 images (max 5MB each). Leave empty to keep
                  the current gallery.
                </p>

                {existingImages.length > 0 && selectedImages.length === 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-700 mb-2">Current images</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {existingImages.map((url, index) => (
                        <div
                          key={`existing-${index}`}
                          className="aspect-square rounded-lg overflow-hidden border border-gray-200"
                        >
                          <img
                            src={url}
                            alt={`Existing product image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {imagePreviews.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-700 mb-2">
                      Selected images
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {imagePreviews.map((preview, index) => (
                        <div
                          key={`preview-${index}`}
                          className="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
                        >
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full px-2 py-1 text-xs text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
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
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#660033] focus:border-transparent"
                  placeholder="Enter product description..."
                />
              </div>

              {/* Sale Type - NEW */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sale Type
                </label>
                <select
                  name="saleType"
                  value={formData.saleType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#660033] focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={!saleSupport.type}
                >
                  {SALE_EVENTS.map((sale) => (
                    <option key={sale.value} value={sale.value}>
                      {sale.label}
                    </option>
                  ))}
                </select>
                {!saleSupport.type && saleSupport.checked && (
                  <p className="text-xs text-gray-500 mt-1">
                    Supabase does not expose a `sale_type` column. This
                    selection is disabled until the column is added.
                  </p>
                )}
              </div>

              {/* Sale Start and End - NEW */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sale Start Date
                  </label>
                  <input
                    type="date"
                    name="saleStart"
                    value={formData.saleStart}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#660033] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={!saleSupport.start}
                  />
                  {!saleSupport.start && saleSupport.checked && (
                    <p className="text-xs text-gray-500 mt-1">
                      Supabase does not expose a `sale_start` column. This field
                      is disabled until the column is added.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sale End Date
                  </label>
                  <input
                    type="date"
                    name="saleEnd"
                    value={formData.saleEnd}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#660033] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={!saleSupport.end}
                  />
                  {!saleSupport.end && saleSupport.checked && (
                    <p className="text-xs text-gray-500 mt-1">
                      Supabase does not expose a `sale_end` column. This field
                      is disabled until the column is added.
                    </p>
                  )}
                </div>
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
                disabled={loading || imageUploading}
                className="px-6 py-3 bg-[#660033] hover:bg-[#4A0025] text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading || imageUploading
                  ? "Updating Product..."
                  : "Update Product"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
