import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Search,
  Filter,
  Eye,
  Star,
  TrendingUp,
  ArrowLeft,
  Image as ImageIcon,
} from "lucide-react";
import {
  getStoreById,
  getProductsByStore,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllCategories,
} from "../../utils/storeManagement";
import supabase from "../../utils/supabase";
import {
  productSupportsColumn,
  rememberProductColumnSupport,
} from "../../utils/productSchema";
import SALE_EVENTS from "../../constants/saleEvents";

const BUCKET = "product-images";

const slugify = (str = "") =>
  str
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const StoreProductManagement = () => {
  const { storeId } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    regular_price: "",
    sale_price: "",
    sale_type: "",
    sale_start: "",
    sale_end: "",
    in_stock: true,
    featured: false,
  });
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [saleSupport, setSaleSupport] = useState({
    type: false,
    start: false,
    end: false,
    checked: false,
  });

  const loadStoreAndProducts = useCallback(async () => {
    try {
      setLoading(true);
      const [storeData, productsData] = await Promise.all([
        getStoreById(storeId),
        getProductsByStore(storeId),
      ]);
      setStore(storeData);
      setProducts(productsData);
    } catch (error) {
      console.error("Error loading store and products:", error);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    if (storeId) {
      loadStoreAndProducts();
    }
  }, [storeId, loadStoreAndProducts]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await getAllCategories();
        setCategoryOptions(
          categories.filter((category) => category.id && category.id !== "all")
        );
      } catch (error) {
        console.error("Error loading categories:", error);
        setCategoryOptions([]);
      }
    };

    loadCategories();
  }, []);

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
        console.error("Failed to detect sale-related columns:", error);
        setSaleSupport({ type: false, start: false, end: false, checked: true });
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!saleSupport.checked) return;

    setFormData((prev) => {
      let changed = false;
      const next = { ...prev };

      if (!saleSupport.type && prev.sale_type) {
        next.sale_type = "";
        changed = true;
      }
      if (!saleSupport.start && prev.sale_start) {
        next.sale_start = "";
        changed = true;
      }
      if (!saleSupport.end && prev.sale_end) {
        next.sale_end = "";
        changed = true;
      }

      return changed ? next : prev;
    });
  }, [saleSupport.checked, saleSupport.type, saleSupport.start, saleSupport.end]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.category || !formData.regular_price) {
        alert("Please complete the required fields");
        return;
      }

      if (!editingProduct && selectedImages.length !== 3) {
        alert("Please upload exactly 3 images for new products");
        return;
      }

      if (
        editingProduct &&
        selectedImages.length > 0 &&
        selectedImages.length !== 3
      ) {
        alert("Please upload exactly 3 images when replacing existing ones");
        return;
      }

      if (
          saleSupport.start &&
          saleSupport.end &&
          formData.sale_start &&
          formData.sale_end &&
          formData.sale_start > formData.sale_end
        ) {
        alert("Sale end date must be after the start date");
        return;
      }

      setSaving(true);

      let uploadedImageUrls = null;
      if (selectedImages.length === 3) {
        uploadedImageUrls = await uploadImages();
      }

      const productPayload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        category: formData.category.trim(),
        regular_price: parseFloat(formData.regular_price),
        sale_price: formData.sale_price
          ? parseFloat(formData.sale_price)
          : null,
        in_stock: !!formData.in_stock,
        featured: !!formData.featured,
        store_id: storeId,
      };

      if (saleSupport.type) {
        productPayload.sale_type = formData.sale_type || null;
      }
      if (saleSupport.start) {
        productPayload.sale_start = formData.sale_start || null;
      }
      if (saleSupport.end) {
        productPayload.sale_end = formData.sale_end || null;
      }

      if (uploadedImageUrls) {
        productPayload.image_url = uploadedImageUrls[0];
        productPayload.additional_images = uploadedImageUrls.slice(1);
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, productPayload);
      } else {
        await createProduct(productPayload);
      }
      await loadStoreAndProducts();
      resetForm();
    } catch (error) {
      alert("Error saving product: " + error.message);
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(productId);
        await loadStoreAndProducts();
      } catch (error) {
        alert("Error deleting product: " + error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      regular_price: "",
      sale_price: "",
      sale_type: "",
      sale_start: "",
      sale_end: "",
      in_stock: true,
      featured: false,
    });
    setSelectedImages([]);
    setImagePreviews([]);
    setExistingImages([]);
    setSaving(false);
    setShowAddForm(false);
    setEditingProduct(null);
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description || "",
      category: product.category || "",
      regular_price:
        product.regular_price != null ? product.regular_price.toString() : "",
      sale_price: product.sale_price ? product.sale_price.toString() : "",
      sale_type: product.sale_type || "",
      sale_start: product.sale_start ? product.sale_start.slice(0, 10) : "",
      sale_end: product.sale_end ? product.sale_end.slice(0, 10) : "",
      in_stock: product.in_stock,
      featured: product.featured,
    });
    setEditingProduct(product);
    const currentImages = [
      product.image_url,
      ...(Array.isArray(product.additional_images)
        ? product.additional_images
        : []),
    ].filter(Boolean);
    setExistingImages(currentImages);
    setSelectedImages([]);
    setImagePreviews([]);
    setShowAddForm(true);
  };

  const productCategories = useMemo(
    () => [
      ...new Set(
        products
          .map((p) => (p.category || "").trim())
          .filter((value) => value.length > 0)
      ),
    ],
    [products]
  );

  const combinedCategories = useMemo(() => {
    const combined = new Map();
    categoryOptions.forEach((category) => {
      if (!category?.name) return;
      combined.set(category.name.toLowerCase(), {
        id: category.id,
        name: category.name,
        icon: category.icon || null,
      });
    });
    productCategories.forEach((name) => {
      if (!combined.has(name.toLowerCase())) {
        combined.set(name.toLowerCase(), { id: name, name, icon: null });
      }
    });
    return Array.from(combined.values());
  }, [categoryOptions, productCategories]);

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

    const tooLarge = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (tooLarge.length > 0) {
      alert("Each image must be less than 5MB");
      return;
    }

    setSelectedImages(files);

    const previewPromises = files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result);
          reader.readAsDataURL(file);
        })
    );

    Promise.all(previewPromises).then(setImagePreviews);
  };

  const removeImage = (index) => {
    const updatedFiles = selectedImages.filter((_, idx) => idx !== index);
    const updatedPreviews = imagePreviews.filter((_, idx) => idx !== index);
    setSelectedImages(updatedFiles);
    setImagePreviews(updatedPreviews);
  };

  const uploadImages = async () => {
    if (selectedImages.length !== 3) {
      throw new Error("Please select exactly 3 images before uploading");
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
        const path = `products/${storeId}/${base}/${timestamp}-${index}.${extension}`;

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

          const { data: publicUrlData } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(path);
          uploadedUrl = publicUrlData?.publicUrl;
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

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !categoryFilter ||
      (product.category || "").toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (amount) => {
    return `₨${Number(amount).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading products...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Store not found</p>
          <Link
            to="/admin/stores"
            className="text-emerald-600 hover:text-emerald-700"
          >
            Back to stores
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/admin/stores"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {store.name} - Products
            </h1>
            <p className="text-gray-600">
              Manage products for {store.name} • {store.commission_rate}%
              commission
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">All Categories</option>
              {combinedCategories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-600">
              {filteredProducts.length} of {products.length} products
            </span>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingProduct ? "Edit Product" : `Add Product to ${store.name}`}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <Plus className="w-5 h-5 rotate-45" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Premium Shawl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  required
                >
                  <option value="">Select a category</option>
                  {combinedCategories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.icon ? `${category.icon} ` : ""}
                      {category.name}
                    </option>
                  ))}
                </select>
                {combinedCategories.length === 0 && (
                  <p className="mt-2 text-xs text-red-500">
                    No categories available. Create a category before adding
                    products.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Regular Price (₨) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.regular_price}
                  onChange={(e) =>
                    setFormData({ ...formData, regular_price: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sale Price (₨)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.sale_price}
                  onChange={(e) =>
                    setFormData({ ...formData, sale_price: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="0.00 (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sale Type
                </label>
                <select
                  value={formData.sale_type}
                  onChange={(e) =>
                    setFormData({ ...formData, sale_type: e.target.value })
                  }
                  disabled={!saleSupport.type}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                    saleSupport.type ? 'bg-white' : 'bg-gray-100 cursor-not-allowed'
                  }`}
                >
                  {SALE_EVENTS.map((sale) => (
                    <option key={sale.value} value={sale.value}>
                      {sale.label}
                    </option>
                  ))}
                </select>
                {!saleSupport.type && saleSupport.checked && (
                  <p className="mt-1 text-xs text-gray-500">
                    Sale type column not available in database schema
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:col-span-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sale Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.sale_start}
                    onChange={(e) =>
                      setFormData({ ...formData, sale_start: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sale End Date
                  </label>
                  <input
                    type="date"
                    value={formData.sale_end}
                    onChange={(e) =>
                      setFormData({ ...formData, sale_end: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Product description..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images{" "}
                {editingProduct ? "(upload 3 images to replace)" : "*"}
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleImageChange}
                className="w-full"
                disabled={imageUploading || saving}
              />
              <p className="text-xs text-gray-500 mt-2">
                Upload exactly 3 images (max 5MB each). These display in the
                storefront carousel.
              </p>

              {existingImages.length > 0 && selectedImages.length === 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Current images
                  </p>
                  <div className="grid grid-cols-3 gap-3">
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
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Selected images
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={index}
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
                          className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-1 shadow"
                          title="Remove image"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.in_stock}
                  onChange={(e) =>
                    setFormData({ ...formData, in_stock: e.target.checked })
                  }
                  className="h-4 w-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                />
                <span className="ml-2 text-sm text-gray-700">In Stock</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData({ ...formData, featured: e.target.checked })
                  }
                  className="h-4 w-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                />
                <span className="ml-2 text-sm text-gray-700">Featured</span>
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
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-lg hover:bg-emerald-700 disabled:opacity-70"
                disabled={saving || imageUploading}
              >
                {saving
                  ? "Saving..."
                  : editingProduct
                  ? "Update Product"
                  : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Product Image */}
            <div className="aspect-square bg-gray-100 relative">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-gray-300" />
                </div>
              )}

              {/* Status Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.featured && (
                  <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    ⭐ Featured
                  </span>
                )}
                {product.sale_price && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    Sale
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="absolute top-2 right-2">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    product.in_stock
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {product.in_stock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>

            {/* Product Details */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                {product.name}
              </h3>

              {product.category && (
                <p className="text-sm text-gray-500 mb-2">{product.category}</p>
              )}

              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {product.description}
              </p>

              {/* Price */}
              <div className="mb-4">
                {product.sale_price ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-emerald-600">
                      {formatCurrency(product.sale_price)}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      {formatCurrency(product.regular_price)}
                    </span>
                    <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded">
                      {Math.round(
                        ((product.regular_price - product.sale_price) /
                          product.regular_price) *
                          100
                      )}
                      % OFF
                    </span>
                  </div>
                ) : (
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(product.regular_price)}
                  </span>
                )}
              </div>

              {/* Rating and Reviews */}
              {product.rating > 0 && (
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= product.rating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {product.rating.toFixed(1)} ({product.reviews})
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"
                    title="Edit product"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(product.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || categoryFilter
              ? "No products match your search criteria."
              : `Start selling on ${store.name} by adding your first product.`}
          </p>
          {!searchTerm && !categoryFilter && (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Product
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default StoreProductManagement;
