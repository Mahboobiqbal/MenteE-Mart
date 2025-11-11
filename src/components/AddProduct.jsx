import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabase";
import { fetchDescription } from "../utils/groq";
import { getAllCategories, getAllStores } from "../utils/storeManagement";
import SALE_EVENTS from "../constants/saleEvents";
import {
  productSupportsColumn,
  rememberProductColumnSupport,
} from "../utils/productSchema";

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
    saleType: "", // NEW
    saleStart: "", // optional ISO datetimes
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
        const [dbCategories, dbStores] = await Promise.all([
          getAllCategories(),
          getAllStores(),
        ]);

        setCategories(dbCategories.filter((category) => category.id !== "all"));
        setStores(dbStores.filter((store) => store.id !== "all"));
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
        const [typeSupported, startSupported, endSupported] = await Promise.all([
          productSupportsColumn("sale_type"),
          productSupportsColumn("sale_start"),
          productSupportsColumn("sale_end"),
        ]);

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
        console.error("Failed to detect sale columns:", error);
        setSaleSupport({ type: false, start: false, end: false, checked: true });
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
    if (selectedImages.length < 3) {
      throw new Error("Please select exactly 3 images before uploading");
    }

    setImageUploading(true);
    try {
      const urls = [];
      const base = slugify(formData.name || "product");

      // Try to get an authenticated Supabase session token.
      // If not signed in but the developer used the client-side admin gate (admin_ok),
      // send the VITE_ADMIN_PASSCODE to the server as an admin bypass header.
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

        // Try serverless upload first (production / deployed functions).
        // If the dev server doesn't provide /api (Vite), fallback to client-side Supabase upload.
        let uploadedPublicUrl = null;

        // Convert file to base64 for server endpoint (we'll also keep the File for client upload fallback)
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

        // Attempt serverless upload
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

          // If the endpoint isn't present (Vite dev server typically returns 404), treat as fallback
          if (!resp.ok) {
            // If 404, we'll fall back to client upload below. If another status, try to read error and throw.
            if (resp.status === 404) {
              // fall through to client-side upload
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
          // Network error or fetch failure: fallback to client
          console.warn(
            "Server upload failed, falling back to client upload:",
            err?.message || err
          );
        }

        // If server upload didn't produce a URL, attempt client-side upload (useful for local dev)
        if (!uploadedPublicUrl) {
          try {
            // The Supabase client expects the raw File/Blob
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

    if (!formData.name || !formData.price || !formData.category) {
      alert("Please fill in all required fields");
      return;
    }
    if (storeSupported) {
      if (!stores.length) {
        alert(
          "No stores are available yet. Please create a store before adding a product."
        );
        return;
      }
      if (!formData.store) {
        alert("Please select a store for this product");
        return;
      }
    }
    if (selectedImages.length < 3) {
      alert("Please select exactly 3 product images");
      return;
    }

    setLoading(true);
    try {
      // 1) Upload images to Supabase Storage
      const imageUrls = await uploadImages();

      // 2) Prepare product payload
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

      // Note: we avoid adding auto-generated boolean `is_*_sale` fields here because
      // the products table in some projects may not have those columns. Keeping the
      // payload to a conservative set of known columns prevents "Could not find the
      // 'is_black_friday_sale' column" errors when inserting.

      // 3) Create product record via secure server endpoint (server uses service role key)
      const createHeaders = { "Content-Type": "application/json" };
      const session = await supabase.auth.getSession();
      const accessToken = session?.data?.session?.access_token;
      if (accessToken) createHeaders.Authorization = `Bearer ${accessToken}`;
      else if (
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

      // Try server-side product creation first (preferred for security).
      // If the serverless function isn't available (404) or fetch fails in dev, fall back to client-side insert.
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
        // Client-side insert: this will only work if the anon key or the signed-in user has permission.
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
      <div className="min-h-screen" style={{ backgroundColor: "#f5f7f6" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#008060] mx-auto mb-4"></div>
            <p className="text-lg text-gray-700 font-medium">
              Loading form data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f7f6" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div
          className="rounded-lg border p-6 mb-8"
          style={{ backgroundColor: white, borderColor: "#e5e7eb" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-2xl font-semibold"
                style={{ color: charcoal }}
              >
                Add New Product
              </h1>
              <p className="mt-1" style={{ color: `${charcoal}b3` }}>
                Create a new product listing
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="flex items-center"
              style={{ color: charcoal }}
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
          <div
            className="rounded-lg border p-6"
            style={{ backgroundColor: white, borderColor: "#e5e7eb" }}
          >
            <h2
              className="text-lg font-medium mb-6"
              style={{ color: charcoal }}
            >
              Product Information
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="lg:col-span-2">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: charcoal }}
                >
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-md outline-none transition"
                  placeholder="Enter product name"
                  required
                  style={{
                    border: "1px solid #d1d5db",
                    color: charcoal,
                    backgroundColor: white,
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow = `0 0 0 2px ${yellow}`)
                  }
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                />
              </div>

              {/* Category */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: charcoal }}
                >
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-md outline-none transition bg-white"
                  required
                  style={{ border: "1px solid #d1d5db", color: charcoal }}
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow = `0 0 0 2px ${yellow}`)
                  }
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option
                      key={category.id || category.name}
                      value={category.name}
                    >
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock + Featured */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: charcoal }}
                >
                  Stock Status
                </label>
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
                    <span className="ml-2 text-sm" style={{ color: charcoal }}>
                      In Stock
                    </span>
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
                    <span className="ml-2 text-sm" style={{ color: charcoal }}>
                      Featured Product
                    </span>
                  </label>
                </div>
              </div>

              {/* Regular Price */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: charcoal }}
                >
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
                  style={{
                    border: "1px solid #d1d5db",
                    color: charcoal,
                    backgroundColor: white,
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow = `0 0 0 2px ${yellow}`)
                  }
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                />
              </div>

              {/* Sale Price */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: charcoal }}
                >
                  Sale Price (₨){" "}
                  <span className="text-xs" style={{ color: `${charcoal}99` }}>
                    (Optional)
                  </span>
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
                  style={{
                    border: "1px solid #d1d5db",
                    color: charcoal,
                    backgroundColor: white,
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow = `0 0 0 2px ${yellow}`)
                  }
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                />
              </div>

              {/* Store */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: charcoal }}
                >
                  {storeSupported
                    ? "Store *"
                    : "Store (Supabase column missing)"}
                </label>
                <select
                  name="store"
                  value={formData.store}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-md outline-none transition bg-white"
                  required={storeSupported}
                  disabled={!storeSupported}
                  style={{
                    border: "1px solid #d1d5db",
                    color: charcoal,
                    backgroundColor: storeSupported ? white : "#f9fafb",
                    cursor: storeSupported ? "pointer" : "not-allowed",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow = `0 0 0 2px ${yellow}`)
                  }
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                >
                  <option value="">Select a store</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.name}>
                      {store.name} Products
                    </option>
                  ))}
                </select>
                {!storeSupported && storeSupportChecked && (
                  <p
                    className="text-xs mt-1"
                    style={{ color: `${charcoal}99` }}
                  >
                    The current Supabase schema does not include a `store`
                    column. Products will be created without a store until the
                    column is added.
                  </p>
                )}
              </div>

              {/* Sale Type */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: charcoal }}
                >
                  Special Sale
                </label>
                <select
                  name="saleType"
                  value={formData.saleType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-md outline-none transition bg-white"
                  style={{
                    border: "1px solid #d1d5db",
                    color: charcoal,
                    backgroundColor: saleSupport.type ? white : "#f9fafb",
                    cursor: saleSupport.type ? "pointer" : "not-allowed",
                  }}
                  disabled={!saleSupport.type}
                >
                  {SALE_EVENTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                {!saleSupport.type && saleSupport.checked && (
                  <p className="text-xs mt-1" style={{ color: `${charcoal}99` }}>
                    Supabase does not expose a `sale_type` column, so the sale tag
                    will be ignored until that column is added.
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="lg:col-span-2">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: charcoal }}
                >
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
                  style={{
                    border: "1px solid #d1d5db",
                    color: charcoal,
                    backgroundColor: white,
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow = `0 0 0 2px ${yellow}`)
                  }
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                />
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div
            className="rounded-lg border p-6"
            style={{ backgroundColor: white, borderColor: "#e5e7eb" }}
          >
            <h2
              className="text-lg font-medium mb-6"
              style={{ color: charcoal }}
            >
              Product Images
            </h2>

            <div className="mb-6">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: charcoal }}
              >
                Upload Images * (Up to 3 images)
              </label>
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center transition-colors"
                style={{ borderColor: "#d1d5db" }}
              >
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
                    className="w-12 h-12 mb-4"
                    style={{ color: "#9ca3af" }}
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
                  <span className="font-medium" style={{ color: charcoal }}>
                    Click to upload images
                  </span>
                  <span
                    className="text-sm mt-1"
                    style={{ color: `${charcoal}99` }}
                  >
                    PNG, JPG, WebP up to 5MB each
                  </span>
                </label>
              </div>
              <p className="text-sm mt-2" style={{ color: `${charcoal}99` }}>
                First image will be the main product image. Maximum 3 images
                allowed.
              </p>
            </div>

            {imagePreviews.length > 0 && (
              <div>
                <h3
                  className="text-sm font-medium mb-3"
                  style={{ color: charcoal }}
                >
                  Image Previews:
                </h3>
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
          <div
            className="rounded-lg border p-6"
            style={{ backgroundColor: white, borderColor: "#e5e7eb" }}
          >
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate("/admin/dashboard")}
                className="px-6 py-3 rounded-md font-medium transition-colors"
                style={{
                  border: "1px solid #d1d5db",
                  color: charcoal,
                  backgroundColor: white,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || imageUploading}
                className="px-6 py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: emerald, color: white }}
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
    </div>
  );
};

export default AddProduct;
