import React, { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Truck } from "lucide-react";
import supabase from "../../utils/supabase";

const CustomerForm = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    alternatePhone: initialData.alternatePhone || "",
    addressLine1: initialData.addressLine1 || "",
    addressLine2: initialData.addressLine2 || "",
    city: initialData.city || "",
    stateProvince: initialData.stateProvince || "",
    postalCode: initialData.postalCode || "",
    country: initialData.country || "Pakistan",
    areaId: initialData.areaId || "",
  });
  
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  
  useEffect(() => {
    fetchAreas();
    if (initialData.areaId) {
      fetchArea(initialData.areaId);
    }
  }, [initialData.areaId]);
  
  const fetchAreas = async () => {
    try {
      const { data, error } = await supabase
        .from("areas")
        .select("*")
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      setAreas(data || []);
    } catch (error) {
      console.error("Error fetching shipping areas:", error);
    }
  };
  
  const fetchArea = async (areaId) => {
    try {
      const { data, error } = await supabase
        .from("areas")
        .select("*")
        .eq("id", areaId)
        .single();
      
      if (error) throw error;
      setSelectedArea(data);
    } catch (error) {
      console.error("Error fetching shipping area:", error);
    }
  };
  
  const handleAreaChange = (e) => {
    const areaId = e.target.value;
    setFormData({ ...formData, areaId });
    
    if (areaId) {
      const area = areas.find(a => a.id === areaId);
      setSelectedArea(area);
    } else {
      setSelectedArea(null);
    }
  };

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cities = [
    "Karachi",
    "Lahore",
    "Islamabad",
    "Rawalpindi",
    "Faisalabad",
    "Multan",
    "Peshawar",
    "Quetta",
    "Sialkot",
    "Gujranwala",
    "Hyderabad",
    "Bahawalpur",
    "Sargodha",
    "Jhang",
    "Sheikhupura",
    "Larkana",
    "Gujrat",
    "Mardan",
    "Kasur",
    "Rahim Yar Khan",
    "Okara",
    "Wah Cantonment",
    "Dera Ghazi Khan",
    "Sahiwal",
    "Mirpur",
    "Nawabshah",
    "Burewala",
    "Chiniot",
    "Kamalia",
  ];

  const provinces = [
    "Punjab",
    "Sindh",
    "Khyber Pakhtunkhwa",
    "Balochistan",
    "Gilgit-Baltistan",
    "Azad Jammu & Kashmir",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Mobile number is required";
    } else if (
      !/^(\+92|92|0)?[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ""))
    ) {
      newErrors.phone = "Please enter a valid mobile number";
    }
    if (!formData.addressLine1.trim())
      newErrors.addressLine1 = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.stateProvince.trim())
      newErrors.stateProvince = "Province/Region is required";
    if (!formData.areaId) newErrors.areaId = "Shipping area is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Add slight delay for UX
      await new Promise((resolve) => setTimeout(resolve, 500));
      onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            First Name *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
              errors.firstName ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Enter your first name"
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
              errors.lastName ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Enter your last name"
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
              errors.email ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Mobile Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
              errors.phone ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="03XX-XXXXXXX"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>
      </div>

      {/* Alternate Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Phone className="w-4 h-4 inline mr-2" />
          Alternate Phone (Optional)
        </label>
        <input
          type="tel"
          name="alternatePhone"
          value={formData.alternatePhone}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          placeholder="03XX-XXXXXXX"
        />
      </div>

      {/* Address Information */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="w-4 h-4 inline mr-2" />
          Street Address *
        </label>
        <input
          type="text"
          name="addressLine1"
          value={formData.addressLine1}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
            errors.addressLine1 ? "border-red-300" : "border-gray-300"
          }`}
          placeholder="House/Flat number, Street name, Area"
        />
        {errors.addressLine1 && (
          <p className="text-red-500 text-sm mt-1">{errors.addressLine1}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Address Info (Optional)
        </label>
        <input
          type="text"
          name="addressLine2"
          value={formData.addressLine2}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          placeholder="Landmark, Building name, etc."
        />
      </div>

      {/* City and Province */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City *
          </label>
          <select
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
              errors.city ? "border-red-300" : "border-gray-300"
            }`}
          >
            <option value="">Select City</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Province/Region *
          </label>
          <select
            name="stateProvince"
            value={formData.stateProvince}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
              errors.stateProvince ? "border-red-300" : "border-gray-300"
            }`}
          >
            <option value="">Select Province</option>
            {provinces.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
          {errors.stateProvince && (
            <p className="text-red-500 text-sm mt-1">{errors.stateProvince}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Postal Code (Optional)
          </label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Postal code"
          />
        </div>
      </div>

      {/* Shipping Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Truck className="w-4 h-4 inline mr-2" />
          Shipping Area *
        </label>
        <select
          name="areaId"
          value={formData.areaId}
          onChange={handleAreaChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
            errors.areaId ? "border-red-300" : "border-gray-300"
          }`}
        >
          <option value="">Select Shipping Area</option>
          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name} - ₨{area.shipping_cost.toLocaleString()} ({area.estimated_delivery_days} days)
            </option>
          ))}
        </select>
        {errors.areaId && (
          <p className="text-red-500 text-sm mt-1">{errors.areaId}</p>
        )}
        {selectedArea && (
          <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
            <p>Shipping Cost: <span className="font-semibold">₨{selectedArea.shipping_cost.toLocaleString()}</span></p>
            <p>Estimated Delivery: <span className="font-semibold">{selectedArea.estimated_delivery_days} days</span></p>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Processing..." : "Continue to Review"}
        </button>
      </div>

      <div className="text-xs text-gray-500 text-center">
        * Required fields. Your information is secure and will only be used for
        order fulfillment.
      </div>
    </form>
  );
};

export default CustomerForm;
