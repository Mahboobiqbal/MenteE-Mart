import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import supabase from "../../utils/supabase";

const ShippingAreasManagement = () => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingArea, setEditingArea] = useState(null);
  const [newArea, setNewArea] = useState({
    name: "",
    code: "",
    shipping_cost: 0,
    estimated_delivery_days: 3,
    is_active: true,
  });

  // Fetch areas from database
  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const { data, error } = await supabase
        .from("areas")
        .select("*")
        .order("name");

      if (error) throw error;
      setAreas(data || []);
    } catch (error) {
      console.error("Error fetching shipping areas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add new area
  const handleAddArea = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from("areas")
        .insert([newArea])
        .select();

      if (error) throw error;
      setAreas([...areas, data[0]]);
      setNewArea({
        name: "",
        code: "",
        shipping_cost: 0,
        estimated_delivery_days: 3,
        is_active: true,
      });
    } catch (error) {
      console.error("Error adding shipping area:", error);
      alert("Failed to add shipping area. Please try again.");
    }
  };

  // Update existing area
  const handleUpdateArea = async () => {
    try {
      const { error } = await supabase
        .from("areas")
        .update(editingArea)
        .eq("id", editingArea.id);

      if (error) throw error;

      setAreas(
        areas.map((area) =>
          area.id === editingArea.id ? editingArea : area
        )
      );
      setEditingArea(null);
    } catch (error) {
      console.error("Error updating shipping area:", error);
      alert("Failed to update shipping area. Please try again.");
    }
  };

  // Delete area
  const handleDeleteArea = async (id) => {
    if (window.confirm("Are you sure you want to delete this shipping area?")) {
      try {
        const { error } = await supabase
          .from("areas")
          .delete()
          .eq("id", id);

        if (error) throw error;
        setAreas(areas.filter((area) => area.id !== id));
      } catch (error) {
        console.error("Error deleting shipping area:", error);
        alert("Failed to delete shipping area. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Areas Management</h2>

      {/* Add New Area Form */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Shipping Area</h3>
        <form onSubmit={handleAddArea} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Area Name</label>
            <input
              type="text"
              required
              value={newArea.name}
              onChange={(e) => setNewArea({ ...newArea, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Area Code</label>
            <input
              type="text"
              required
              maxLength={20}
              value={newArea.code}
              onChange={(e) => setNewArea({ ...newArea, code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Cost (PKR)</label>
            <input
              type="number"
              required
              min={0}
              step={0.01}
              value={newArea.shipping_cost}
              onChange={(e) => setNewArea({ ...newArea, shipping_cost: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery Days</label>
            <input
              type="number"
              required
              min={1}
              value={newArea.estimated_delivery_days}
              onChange={(e) => setNewArea({ ...newArea, estimated_delivery_days: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="new-area-active"
              checked={newArea.is_active}
              onChange={(e) => setNewArea({ ...newArea, is_active: e.target.checked })}
              className="mr-2 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
            <label htmlFor="new-area-active" className="text-sm font-medium text-gray-700">
              Active
            </label>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Area
            </button>
          </div>
        </form>
      </div>

      {/* Areas List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Area Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shipping Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Delivery Days
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {areas.map((area) => (
              <tr key={area.id}>
                {editingArea?.id === area.id ? (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={editingArea.name}
                        onChange={(e) => setEditingArea({ ...editingArea, name: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={editingArea.code}
                        onChange={(e) => setEditingArea({ ...editingArea, code: e.target.value.toUpperCase() })}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={editingArea.shipping_cost}
                        onChange={(e) => setEditingArea({ ...editingArea, shipping_cost: parseFloat(e.target.value) })}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={editingArea.estimated_delivery_days}
                        onChange={(e) => setEditingArea({ ...editingArea, estimated_delivery_days: parseInt(e.target.value) })}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={editingArea.is_active ? "true" : "false"}
                        onChange={(e) => setEditingArea({ ...editingArea, is_active: e.target.value === "true" })}
                        className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdateArea}
                          className="text-emerald-600 hover:text-emerald-900"
                        >
                          <Save className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setEditingArea(null)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {area.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {area.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₨{area.shipping_cost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {area.estimated_delivery_days} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          area.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {area.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingArea(area)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteArea(area.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default ShippingAreasManagement;
