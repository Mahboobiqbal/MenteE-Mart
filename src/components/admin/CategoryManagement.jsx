import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  RefreshCcw,
  Layers,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../utils/storeManagement";
import { loadProducts } from "../../utils/dataLoader";

const emptyFormState = {
  name: "",
  description: "",
  icon: "",
  image_url: "",
  sort_order: 0,
  parent_id: "",
  is_active: true,
};

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState(emptyFormState);

  const parentLookup = useMemo(() => {
    const map = new Map();
    categories.forEach((category) => {
      map.set(category.id, category.name);
    });
    return map;
  }, [categories]);

  const resetForm = () => {
    setFormData(emptyFormState);
    setEditingCategory(null);
    setShowForm(false);
    setError(null);
  };

  const loadCategoryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [categoryRecords, products] = await Promise.all([
        getAllCategories(true),
        loadProducts(),
      ]);

      const productCounts = new Map();
      products.forEach((product) => {
        const raw = (product?.category || "").trim().toLowerCase();
        if (!raw) return;
        productCounts.set(raw, (productCounts.get(raw) || 0) + 1);
      });

      const enriched = (categoryRecords || []).map((category) => {
        const slugKey = (category?.slug || "").trim().toLowerCase();
        const nameKey = (category?.name || "").trim().toLowerCase();
        const productCount =
          productCounts.get(slugKey) ?? productCounts.get(nameKey) ?? 0;

        return {
          ...category,
          productCount,
          sort_order: category.sort_order ?? 0,
          icon: category.icon || "",
        };
      });

      enriched.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      setCategories(enriched);
    } catch (err) {
      console.error("Error loading categories:", err);
      setError("Failed to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategoryData();
  }, []);

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || "",
      description: category.description || "",
      icon: category.icon || "",
      image_url: category.image_url || "",
      sort_order: category.sort_order ?? 0,
      parent_id: category.parent_id || "",
      is_active: category.is_active !== false,
    });
    setShowForm(true);
  };

  const handleToggleActive = async (category) => {
    try {
      await updateCategory(category.id, { is_active: !category.is_active });
      await loadCategoryData();
    } catch (err) {
      console.error("Error updating category status:", err);
      setError("Unable to update category status. Please retry.");
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Disable category "${category.name}"?`)) return;
    try {
      await deleteCategory(category.id);
      await loadCategoryData();
    } catch (err) {
      console.error("Error disabling category:", err);
      setError("Unable to disable category. Please retry.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      icon: formData.icon.trim() || null,
      image_url: formData.image_url.trim() || null,
      sort_order: Number(formData.sort_order) || 0,
      parent_id: formData.parent_id || null,
      is_active: !!formData.is_active,
    };

    try {
      if (!payload.name) {
        throw new Error("Category name is required.");
      }

      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
      } else {
        await createCategory(payload);
      }

      await loadCategoryData();
      resetForm();
    } catch (err) {
      console.error("Error saving category:", err);
      setError(err.message || "Unable to save category. Please retry.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Category Management
          </h1>
          <p className="text-gray-600">
            Organize catalog categories pulled directly from the database
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadCategoryData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
          </button>
          <button
            onClick={() => {
              setEditingCategory(null);
              setFormData(emptyFormState);
              setShowForm(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" /> New Category
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Traditional Wear"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon / Emoji
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, icon: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., 🧣"
                  maxLength={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Image URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      image_url: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="https://example.com/category.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sort_order: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  min={0}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Short description that appears on the storefront"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Category
                </label>
                <select
                  value={formData.parent_id || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      parent_id: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                >
                  <option value="">No parent (top-level)</option>
                  {categories
                    .filter((category) =>
                      editingCategory
                        ? category.id !== editingCategory.id
                        : true
                    )
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  id="category-active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_active: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 text-emerald-600 border-gray-300 rounded"
                />
                <label
                  htmlFor="category-active"
                  className="text-sm font-medium text-gray-700"
                >
                  Category is active
                </label>
              </div>
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
                {saving ? "Saving..." : editingCategory ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Layers className="w-5 h-5 mr-2 text-emerald-600" /> Active
            Categories
          </h2>
          <span className="text-sm text-gray-500">
            {categories.filter((category) => category.is_active).length} active
            / {categories.length} total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sort Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No categories found. Start by adding one.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">
                          {category.icon || "🛍️"}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {category.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {category.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {category.productCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.parent_id
                        ? parentLookup.get(category.parent_id) || "—"
                        : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.sort_order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          category.is_active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {category.is_active ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" /> Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleToggleActive(category)}
                        className="text-gray-500 hover:text-emerald-600"
                        title={
                          category.is_active
                            ? "Deactivate category"
                            : "Activate category"
                        }
                      >
                        {category.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-emerald-600 hover:text-emerald-700"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;
