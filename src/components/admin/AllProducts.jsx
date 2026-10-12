import React, { useState, useEffect, useMemo, useContext, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Search,
  RefreshCcw,
  X,
  Image as ImageIcon,
  Star,
  PackageOpen,
  AlertCircle,
} from "lucide-react";
import {
  getAllProducts,
  getAllStores,
  getAllCategories,
  createProduct,
  updateProduct,
} from "../../utils/storeManagement";
import { productSupportsColumn } from "../../utils/productSchema";
import { AuthContext } from "../../context/AuthContext";
import supabase from "../../utils/supabase";

const BUCKET = "product-images";

const slugify = (str = "") =>
  str
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const emptyForm = {
  name: "",
  store_id: "",
  category: "",
  price: "",
  sale_price: "",
  sku: "",
  description: "",
  in_stock: true,
  featured: false,
};

const AllProducts = () => {
  const { session } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [storeFilter, setStoreFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [schema, setSchema] = useState({ description: false, regular_price: false });

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [productData, storeData, categoryData] = await Promise.all([
        getAllProducts(),
        getAllStores(),
        getAllCategories(),
      ]);
      setProducts(productData);
      setStores(storeData);
      setCategories(categoryData);
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    (async () => {
      const [desc, reg] = await Promise.all([
        productSupportsColumn("description"),
        productSupportsColumn("regular_price"),
      ]);
      setSchema({ description: desc, regular_price: reg });
    })();
  }, []);

  const storeNameById = useMemo(() => {
    const map = new Map();
    stores.forEach((s) => map.set(s.id, s.name));
    return map;
  }, [stores]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        (product.name || "").toLowerCase().includes(term) ||
        (product.sku || "").toLowerCase().includes(term) ||
        (product.category || "").toLowerCase().includes(term);
      const productStoreId = product.store_id || "";
      const matchesStore =
        storeFilter === "all" ||
        productStoreId === storeFilter ||
        (!productStoreId && (product.store || "") === storeFilter);
      const matchesCategory =
        categoryFilter === "all" ||
        (product.category || "").toLowerCase() === categoryFilter.toLowerCase();
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in" ? product.in_stock : !product.in_stock);
      return matchesSearch && matchesStore && matchesCategory && matchesStock;
    });
  }, [products, searchTerm, storeFilter, categoryFilter, stockFilter]);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditing(null);
    setShowForm(false);
    setSelectedImages([]);
    setImagePreviews([]);
    setError(null);
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name || "",
      store_id: product.store_id || "",
      category: product.category || "",
      price:
        product.price != null
          ? String(product.price)
          : product.regular_price != null
          ? String(product.regular_price)
          : "",
      sale_price: product.sale_price != null ? String(product.sale_price) : "",
      sku: product.sku || "",
      description: product.description || "",
      in_stock: product.in_stock !== false,
      featured: !!product.featured,
    });
    setEditing(product);
    setSelectedImages([]);
    setImagePreviews([]);
    setError(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete product "${product.name}"? This cannot be undone.`)) {
      return;
    }
    try {
      if (!session) {
        throw new Error(
          "Not signed in to the database. Set VITE_ADMIN_EMAIL and VITE_ADMIN_PASSWORD, then re-enter the admin passcode."
        );
      }
      const { data, error: delError } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id)
        .select("id");
      if (delError) throw delError;
      if (!data || data.length === 0) {
        throw new Error("Delete was blocked (no permission or product missing).");
      }
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      setNotice(`Deleted "${product.name}".`);
    } catch (err) {
      setError(err.message || "Failed to delete product.");
    }
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (files.length > 4) {
      setError("Maximum 4 images allowed (1 required + 3 optional).");
      return;
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (files.some((f) => !validTypes.includes(f.type))) {
      setError("Please select only image files (JPEG, PNG, WebP).");
      return;
    }
    if (files.some((f) => f.size > 5 * 1024 * 1024)) {
      setError("Each image must be less than 5MB.");
      return;
    }

    setError(null);
    setSelectedImages(files);
    Promise.all(
      files.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result);
            reader.readAsDataURL(file);
          })
      )
    ).then(setImagePreviews);
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const buildAuthHeaders = async () => {
    const headers = { "Content-Type": "application/json" };
    const token = session?.access_token;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else if (sessionStorage.getItem("admin_ok") === "1") {
      const adminPass = import.meta.env.VITE_ADMIN_PASSCODE;
      if (adminPass) headers["x-admin-passcode"] = adminPass;
    }
    return headers;
  };

  const uploadImages = async () => {
    if (selectedImages.length === 0) return null;
    const headers = await buildAuthHeaders();
    const base = slugify(formData.name || "product");
    const urls = [];

    for (let i = 0; i < selectedImages.length; i += 1) {
      const file = selectedImages[i];
      const ext = (
        file.name.split(".").pop() ||
        file.type.split("/")[1] ||
        "jpg"
      ).toLowerCase();
      const path = `products/${formData.store_id || "misc"}/${base}/${Date.now()}-${i}.${ext}`;
      let publicUrl = null;

      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve((ev.target?.result || "").split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      if (!import.meta.env.DEV) {
        try {
          const resp = await fetch("/api/upload", {
            method: "POST",
            headers,
            body: JSON.stringify({
              fileName: `${base}-${Date.now()}-${i}.${ext}`,
              fileType: file.type,
              base64,
              path,
            }),
          });
          if (resp.ok) {
            const json = await resp.json();
            publicUrl = json.publicUrl;
          } else if (resp.status !== 404) {
            const json = await resp.json().catch(() => ({}));
            console.warn("Server upload failed:", json.error || resp.status);
          }
        } catch (err) {
          console.warn(
            "Server upload unavailable, using client upload:",
            err?.message
          );
        }
      }

      if (!publicUrl) {
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { contentType: file.type, upsert: false });
        if (uploadError) {
          const hint = /row-level security/i.test(uploadError.message || "")
            ? " — no admin database session. Set VITE_ADMIN_PASSWORD in .env, restart the dev server, then exit and re-enter the admin passcode."
            : " — if the bucket is missing, run storage_bucket_setup.sql in the Supabase SQL Editor.";
          throw new Error(uploadError.message + hint);
        }
        const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
        publicUrl = pub?.publicUrl;
        if (!publicUrl) throw new Error("Failed to obtain public URL for image.");
      }

      urls.push(publicUrl);
    }

    return urls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const price = parseFloat(formData.price);
    if (!formData.name.trim()) return setError("Product name is required.");
    if (!formData.store_id) return setError("Please select a store.");
    if (!formData.category.trim()) return setError("Category is required.");
    if (Number.isNaN(price) || price < 0) return setError("A valid price is required.");
    if (!editing && selectedImages.length < 1)
      return setError("Please upload at least 1 product image.");
    if (selectedImages.length > 4)
      return setError("Maximum 4 images allowed (1 required + 3 optional).");
    if (formData.sale_price && parseFloat(formData.sale_price) >= price) {
      return setError("Sale price must be lower than the regular price.");
    }

    setSaving(true);
    try {
      const storeName = storeNameById.get(formData.store_id) || "";

      let imageUrls = null;
      if (selectedImages.length > 0) {
        imageUrls = await uploadImages();
      }

      const payload = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        price,
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        store: storeName,
        store_id: formData.store_id,
        sku: formData.sku.trim() || null,
        in_stock: !!formData.in_stock,
        featured: !!formData.featured,
      };
      if (schema.description) payload.description = formData.description.trim() || null;
      if (schema.regular_price) payload.regular_price = price;
      if (imageUrls) {
        payload.image_url = imageUrls[0];
        payload.additional_images = imageUrls.slice(1);
      }

      if (editing) {
        if (!session) {
          throw new Error(
            "Not signed in to the database. Set VITE_ADMIN_EMAIL and VITE_ADMIN_PASSWORD, then re-enter the admin passcode."
          );
        }
        await updateProduct(editing.id, payload);
        setNotice(`Updated "${payload.name}".`);
      } else {
        if (session) {
          await createProduct(payload);
        } else {
          const headers = await buildAuthHeaders();
          const resp = await fetch("/api/create-product", {
            method: "POST",
            headers,
            body: JSON.stringify({ product: { ...payload, slug: slugify(payload.name) } }),
          });
          if (!resp.ok) {
            throw new Error(
              resp.status === 404
                ? "Product creation requires a database session. Set VITE_ADMIN_EMAIL and VITE_ADMIN_PASSWORD, then re-enter the admin passcode."
                : (await resp.json().catch(() => ({}))).error ||
                    `Product creation failed (status ${resp.status})`
            );
          }
        }
        setNotice(`Added "${payload.name}".`);
      }

      await loadAll();
      resetForm();
    } catch (err) {
      console.error("Error saving product:", {
        message: err.message,
        code: err.code,
        details: err.details,
      });
      setError(err.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) => `₨${Number(amount || 0).toLocaleString()}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
          <p className="text-gray-600">
            {filteredProducts.length} of {products.length} products across{" "}
            {stores.length} store{stores.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadAll}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
          </button>
          <button
            onClick={() => {
              setEditing(null);
              setFormData(emptyForm);
              setSelectedImages([]);
              setImagePreviews([]);
              setError(null);
              setShowForm(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg">
          {notice}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {editing ? "Edit Product" : "Add New Product"}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Cotton Summer Shirt"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store *
                </label>
                <select
                  value={formData.store_id}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, store_id: e.target.value }))
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                >
                  <option value="">Select a store...</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
                {stores.length === 0 && (
                  <p className="mt-1 text-xs text-red-600">
                    No stores yet — create one first in{" "}
                    <Link to="/admin/stores" className="underline">
                      Store Management
                    </Link>
                    .
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <input
                  type="text"
                  list="all-products-categories"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, category: e.target.value }))
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Fashion"
                />
                <datalist id="all-products-categories">
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (PKR) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, price: e.target.value }))
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sale Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.sale_price}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, sale_price: e.target.value }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU (optional)
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, sku: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., SHIRT-001"
                />
              </div>

              {schema.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Short product description"
                  />
                </div>
              )}
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images {editing ? "" : "*"} (1 required, up to 4)
              </label>
              <div className="flex flex-wrap gap-3">
                {editing?.image_url && selectedImages.length === 0 && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={editing.image_url}
                      alt={editing.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] text-center py-0.5">
                      Current
                    </span>
                  </div>
                )}
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative w-24 h-24">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                      aria-label="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-emerald-400 hover:text-emerald-500 cursor-pointer transition-colors">
                  <ImageIcon className="w-6 h-6 mb-1" />
                  <span className="text-[11px]">Upload</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.in_stock}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, in_stock: e.target.checked }))
                  }
                  className="h-4 w-4 text-emerald-600 border-gray-300 rounded"
                />
                In stock
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, featured: e.target.checked }))
                  }
                  className="h-4 w-4 text-emerald-600 border-gray-300 rounded"
                />
                Featured product
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-lg hover:bg-emerald-700 disabled:opacity-70"
              >
                {saving ? "Saving..." : editing ? "Update Product" : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search name, SKU, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <select
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
          >
            <option value="all">All stores</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
          >
            <option value="all">All categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
          >
            <option value="all">All stock states</option>
            <option value="in">In stock</option>
            <option value="out">Out of stock</option>
          </select>
        </div>
      </div>

      {/* Product list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Package className="w-5 h-5 mr-2 text-emerald-600" /> Products
          </h2>
          <span className="text-sm text-gray-500">
            {filteredProducts.length} shown
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 px-4">
            <PackageOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {products.length === 0 ? "No products yet" : "No products match your filters"}
            </h3>
            <p className="text-gray-500 mb-4">
              {products.length === 0
                ? "Get started by adding your first product."
                : "Try adjusting your search or filters."}
            </p>
            {products.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Your First Product
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Store
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-4 sm:px-6 py-3" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="ml-3 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[220px]">
                            {product.name}
                            {product.featured && (
                              <Star className="inline w-3.5 h-3.5 ml-1 text-amber-500 fill-amber-400" />
                            )}
                          </div>
                          {product.sku && (
                            <div className="text-xs text-gray-500">SKU: {product.sku}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {product.stores?.name || product.store || "—"}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {product.category || "—"}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(product.price)}
                      </div>
                      {product.sale_price != null && (
                        <div className="text-xs text-red-600">
                          Sale {formatCurrency(product.sale_price)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          product.in_stock
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {product.in_stock ? "In stock" : "Out of stock"}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      {product.store_id && (
                        <Link
                          to={`/admin/stores/${product.store_id}/products`}
                          className="text-gray-400 hover:text-blue-600"
                          title="Manage in store view"
                        >
                          <Package className="w-4 h-4 inline" />
                        </Link>
                      )}
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-emerald-600 hover:text-emerald-700"
                        title="Edit product"
                      >
                        <Edit className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="text-red-500 hover:text-red-600"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllProducts;
