import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  MessageCircle,
  Store,
  TrendingUp,
  Package,
  Users,
  Eye,
  Search,
  Filter,
  X,
} from "lucide-react";
import {
  getAllStores,
  createStore,
  updateStore,
  deleteStore,
  getStoreWhatsAppUrl,
} from "../../utils/storeManagement";

const StoreManagement = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    whatsapp_number: "",
    commission_rate: 5.0,
    owner_name: "",
    owner_email: "",
    owner_phone: "",
    address: "",
  });

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      setLoading(true);
      const storesData = await getAllStores();
      setStores(storesData);
    } catch (error) {
      console.error("Error loading stores:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStore) {
        await updateStore(editingStore.id, formData);
      } else {
        await createStore(formData);
      }
      await loadStores();
      resetForm();
    } catch (error) {
      alert("Error saving store: " + error.message);
    }
  };

  const handleDelete = async (storeId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this store? This will deactivate it and remove it from active listings."
      )
    ) {
      try {
        await deleteStore(storeId);
        await loadStores();
      } catch (error) {
        alert("Error deleting store: " + error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      whatsapp_number: "",
      commission_rate: 5.0,
      owner_name: "",
      owner_email: "",
      owner_phone: "",
      address: "",
    });
    setShowAddForm(false);
    setEditingStore(null);
  };

  const handleEdit = (store) => {
    setFormData({
      name: store.name,
      description: store.description || "",
      whatsapp_number: store.whatsapp_number,
      commission_rate: store.commission_rate,
      owner_name: store.owner_name || "",
      owner_email: store.owner_email || "",
      owner_phone: store.owner_phone || "",
      address: store.address || "",
    });
    setEditingStore(store);
    setShowAddForm(true);
  };

  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.owner_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading stores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Management</h1>
          <p className="text-gray-600">
            Manage your store partners and their details
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Store
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search stores by name or owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {filteredStores.length} of {stores.length} stores
            </span>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingStore ? "Edit Store" : "Add New Store"}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., MenteE"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.whatsapp_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      whatsapp_number: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="923001234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commission Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.commission_rate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      commission_rate: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="5.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Owner Name
                </label>
                <input
                  type="text"
                  value={formData.owner_name}
                  onChange={(e) =>
                    setFormData({ ...formData, owner_name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Store owner name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Owner Email
                </label>
                <input
                  type="email"
                  value={formData.owner_email}
                  onChange={(e) =>
                    setFormData({ ...formData, owner_email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="owner@store.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Owner Phone
                </label>
                <input
                  type="tel"
                  value={formData.owner_phone}
                  onChange={(e) =>
                    setFormData({ ...formData, owner_phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="923001234567"
                />
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
                placeholder="Brief description of the store..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Store address..."
              />
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
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-lg hover:bg-emerald-700"
              >
                {editingStore ? "Update Store" : "Add Store"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Store Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStores.map((store) => (
          <div
            key={store.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Store className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {store.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {store.owner_name || "No owner assigned"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2 py-1 rounded-full">
                    {store.commission_rate}%
                  </span>
                </div>
              </div>

              {store.description && (
                <p className="text-sm text-gray-600 mb-4">
                  {store.description}
                </p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  <span>{store.whatsapp_number}</span>
                </div>
                {store.owner_email && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{store.owner_email}</span>
                  </div>
                )}
                {store.address && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Store className="w-4 h-4 mr-2" />
                    <span className="truncate">{store.address}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <a
                    href={getStoreWhatsAppUrl(store)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    WhatsApp
                  </a>
                </div>

                <div className="flex items-center space-x-1">
                  <Link
                    to={`/admin/stores/${store.id}/products`}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="View products"
                  >
                    <Package className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/admin/stores/${store.id}/orders`}
                    className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                    title="View orders"
                  >
                    <TrendingUp className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleEdit(store)}
                    className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"
                    title="Edit store"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(store.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete store"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredStores.length === 0 && !loading && (
        <div className="text-center py-12">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No stores found
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? "No stores match your search criteria."
              : "Get started by adding your first store."}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Store
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default StoreManagement;
