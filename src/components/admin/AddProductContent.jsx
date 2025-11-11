import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../utils/supabase";
import { fetchDescription } from "../../utils/groq";
import { getAllCategories, getAllStores } from "../../utils/storeManagement";
import SALE_EVENTS from "../../constants/saleEvents";
import {
  productSupportsColumn,
  rememberProductColumnSupport,
} from "../../utils/productSchema";

// Storage bucket name in Supabase
const BUCKET = "product-images";

const slugify = (str = "") =>
  str
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const AddProductContent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [storeSupported, setStoreSupported] = useState(true);
  const [storeSupportChecked, setStoreSupportChecked] = useState(false);
  const [saleSupport, setSaleSupport] = useState({
    type: false,
    start: false,
    end: false,
    checked: false,
  });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    salePrice: "",
    category: "",
    store: "",
    saleType: "",
    saleStart: "",
    saleEnd: "",
    inStock: true,
    featured: false,
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

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
    let active = true;
    (async () => {
      try {
        const supported = await productSupportsColumn("store");
        if (!active) return;
        setStoreSupported(supported);
        rememberProductColumnSupport("store", supported);
      } finally {
        if (active) setStoreSupportChecked(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!storeSupported) {
      setFormData((prev) => (prev.store ? { ...prev, store: "" } : prev));
    }
  }, [storeSupported]);

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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length > 3) {
      alert("You can only upload up to 3 images");
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
        throw new Error(
          "You must be signed in to upload images. Please sign in and try again."
        );
      }

      for (let i = 0; i < selectedImages.length; i++) {
        const file = selectedImages[i];
        const ext = (
          file.name.split(".").pop() ||
          file.type.split("/")[1] ||
          "jpg"
        ).toLowerCase();
        const path = `products/${base}/${Date.now()}-${i}.${ext}`;

        let uploadedPublicUrl = null;

        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const result = ev.target.result || "";
            const parts = result.split(",");
            resolve(parts[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        try {
          const resp = await fetch("/api/upload", {
            method: "POST",
            headers: {
              ...headers,
            },
            body: JSON.stringify({
              fileName: `${base}-${Date.now()}-${i}.${ext}`,
              fileType: file.type,
              base64,
              path,
            }),
          });

          if (!resp.ok) {
            if (resp.status === 404) {
              console.warn(
                "/api/upload not found (dev). Falling back to client-side upload."
              );
            } else {
              const json = await resp.json().catch(() => ({}));
              throw new Error(
                json.error || `Upload failed (status ${resp.status})`
              );
            }
          } else {
            const json = await resp.json();
            uploadedPublicUrl = json.publicUrl;
          }
        } catch (err) {
          console.warn(
            "Server upload failed, falling back to client upload:",
            err?.message || err
          );
        }

        if (!uploadedPublicUrl) {
          try {
            const { error: uploadError } = await supabase.storage
              .from(BUCKET)
              .upload(path, file, { contentType: file.type, upsert: false });

            if (uploadError) {
              throw uploadError;
            }

            const { data: publicData } = supabase.storage
              .from(BUCKET)
              .getPublicUrl(path);
            uploadedPublicUrl = publicData?.publicUrl;
            if (!uploadedPublicUrl)
              throw new Error(
                "Failed to obtain public URL from Supabase client upload"
              );
          } catch (clientErr) {
            throw new Error(
              (clientErr && clientErr.message) ||
                "Client-side upload failed. To use serverless uploads locally, run your functions (e.g. `vercel dev`) or deploy to Vercel/Netlify."
            );
          }
        }

        urls.push(uploadedPublicUrl);
      }

      return urls;
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (storeSupported && !stores.length) {
      alert(
        "No stores are available yet. Please create a store before adding a product."
      );
      return;
    }

    if (!formData.name || !formData.price || !formData.category) {
      alert("Please fill in all required fields");
      return;
    }

    if (storeSupported) {
      if (!formData.store) {
        alert("Please select a store for this product");
        return;
      }
    }

    if (selectedImages.length < 1) {
      alert(
        "Please select at least 1 product image (1 required, up to 4 total)"
      );
      return;
    }

    if (selectedImages.length > 4) {
      alert("Maximum 4 images allowed (1 required + 3 optional)");
      return;
    }

    setLoading(true);
    try {
      const imageUrls = await uploadImages();

      const regularPrice = parseFloat(formData.price);
      const salePriceNum = formData.salePrice
        ? parseFloat(formData.salePrice)
        : null;

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
        review: [],
        views: 0,
        clicks: 0,
        whatsapp_clicks: 0,
        views_by_date: {},
        clicks_by_date: {},
        created_at: new Date().toISOString(),
      };

      if (saleSupport.type) {
        payload.sale_type = formData.saleType || null;
      }
      if (saleSupport.start) {
        payload.sale_start = formData.saleStart || null;
      }
      if (saleSupport.end) {
        payload.sale_end = formData.saleEnd || null;
      }

      if (storeSupported && formData.store) {
        payload.store = formData.store;
      }

      const createHeaders = { "Content-Type": "application/json" };
      const session = await supabase.auth.getSession();
      const accessToken = session?.data?.session?.access_token;
      if (accessToken) {
        createHeaders.Authorization = `Bearer ${accessToken}`;
      } else if (
        typeof window !== "undefined" &&
        sessionStorage.getItem("admin_ok") === "1"
      ) {
        const adminPass = import.meta.env.VITE_ADMIN_PASSCODE;
        if (!adminPass)
          throw new Error(
            "Admin passcode is not configured (VITE_ADMIN_PASSCODE). Cannot create product."
          );
        createHeaders["x-admin-passcode"] = adminPass;
      }

      let created = null;
      try {
        const resp = await fetch("/api/create-product", {
          method: "POST",
          headers: createHeaders,
          body: JSON.stringify({ product: payload }),
        });

        if (!resp.ok) {
          if (resp.status === 404) {
            console.warn(
              "/api/create-product not found (dev). Falling back to client-side insert."
            );
          } else {
            const json = await resp.json().catch(() => ({}));
            throw new Error(
              json.error || `Product creation failed (status ${resp.status})`
            );
          }
        } else {
          const json = await resp.json();
          created = json.product;
        }
      } catch (err) {
        console.warn(
          "Server create-product failed, attempting client-side insert:",
          err?.message || err
        );
      }

      if (!created) {
        const { data, error } = await supabase
          .from("products")
          .insert([payload])
          .select()
          .maybeSingle();
        if (error) {
          throw new Error(error.message || "Client-side product insert failed");
        }
        created = data;
      }

      alert("Product added successfully!");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Supabase error:", error);
      const message = error?.message || "";
      const storeMissing =
        /column[^\n]*store[^\n]*(does not exist|schema cache)/i.test(message);

      if (storeMissing) {
        rememberProductColumnSupport("store", false);
        setStoreSupported(false);
        setStoreSupportChecked(true);
        setFormData((prev) => (prev.store ? { ...prev, store: "" } : prev));
        alert(
          "Supabase does not have a 'store' column yet. Store selection has been disabled; please submit the product again."
        );
      } else {
        alert("Error adding product: " + (message || "Unknown error"));
      }
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

  // Show loading state while data is being loaded
  if (dataLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Add New Product
        </h1>
        <p className="text-gray-600">Create a new product listing</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white"
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

            {/* Stock + Featured */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="inStock"
                    checked={formData.inStock}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">In Stock</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured</span>
                </label>
              </div>
            </div>

            {/* Regular Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Regular Price (₨) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>

            {/* Sale Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sale Price (₨){" "}
                <span className="text-xs text-gray-500">(Optional)</span>
              </label>
              <input
                type="number"
                name="salePrice"
                value={formData.salePrice}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            {/* Store */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {storeSupported ? "Store *" : "Store (Supabase column missing)"}
              </label>
              <select
                name="store"
                value={formData.store}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white"
                required={storeSupported}
                disabled={!storeSupported}
              >
                <option value="">Select a store</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.name}>
                    {store.name} Products
                  </option>
                ))}
              </select>
              {!storeSupported && storeSupportChecked && (
                <p className="text-xs mt-1 text-gray-500">
                  The current Supabase schema does not include a `store` column.
                  Products will be created without a store until the column is
                  added.
                </p>
              )}
            </div>

            {/* Sale Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Sale
              </label>
              <select
                name="saleType"
                value={formData.saleType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white"
                disabled={!saleSupport.type}
                style={{
                  backgroundColor: saleSupport.type ? "#fff" : "#f9fafb",
                  cursor: saleSupport.type ? "pointer" : "not-allowed",
                }}
              >
                {SALE_EVENTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              {!saleSupport.type && saleSupport.checked && (
                <p className="text-xs mt-1 text-gray-500">
                  Supabase does not expose a `sale_type` column. This selection
                  will be ignored until the column is added.
                </p>
              )}
            </div>

            {/* Description */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
                <span
                  onClick={generateDescription}
                  className="ml-2 cursor-pointer text-emerald-600 text-sm"
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                placeholder="Enter product description..."
              />
            </div>
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Product Images
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Images * (Up to 3 images)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors hover:border-emerald-400">
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
                <svg
                  className="w-12 h-12 mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  ></path>
                </svg>
                <span className="font-medium text-gray-900">
                  Click to upload images
                </span>
                <span className="text-sm text-gray-500 mt-1">
                  PNG, JPG, WebP up to 5MB each
                </span>
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              First image will be the main product image. Maximum 3 images
              allowed.
            </p>
          </div>

          {imagePreviews.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Image Previews:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                      title="Remove"
                    >
                      ×
                    </button>
                    {index === 0 && (
                      <span className="absolute top-2 left-2 bg-emerald-600 text-white px-2 py-1 text-xs rounded">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              className="px-6 py-3 rounded-lg font-medium transition-colors border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || imageUploading}
              className="px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {loading
                ? imageUploading
                  ? "Uploading Images..."
                  : "Adding Product..."
                : "Add Product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProductContent;
