import React, { useState, useEffect } from "react";
import { getCachedData, loadStores } from "../utils/dataLoader";

const StoreContact = ({ storeName, productName }) => {
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const stores = await getCachedData("stores", loadStores);
        const store = stores.find((s) => s.name === storeName);
        setStoreData(store);
      } catch (error) {
        console.error("Error loading store data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (storeName) {
      fetchStoreData();
    }
  }, [storeName]);

  if (loading || !storeData) {
    return (
      <div className="flex space-x-2">
        <button className="flex-1 bg-gray-100 rounded-lg p-3 animate-pulse h-12" />
        <button className="flex-1 bg-gray-100 rounded-lg p-3 animate-pulse h-12" />
      </div>
    );
  }

  const phoneNumber = storeData?.contact?.phone;
  const whatsappNumber = phoneNumber?.replace(/\+/g, "").replace(/\s/g, "");

  const handleCall = () => {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, "_self");
    }
  };

  const handleWhatsApp = () => {
    if (whatsappNumber) {
      const message = `Hi! I'm interested in: ${productName || "this product"}`;
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        message
      )}`;
      window.open(whatsappUrl, "_blank");
    }
  };

  if (!phoneNumber) {
    return null;
  }

  return (
    <div className="flex space-x-2">
      {/* Call Button */}
      <button
        onClick={handleCall}
        className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
        style={{
          backgroundColor: "#059669",
          color: "white",
          boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)",
        }}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
        <span className="text-sm">Call Store</span>
      </button>

      {/* WhatsApp Button */}
      <button
        onClick={handleWhatsApp}
        className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
        style={{
          backgroundColor: "#25D366",
          color: "white",
          boxShadow: "0 4px 12px rgba(37, 211, 102, 0.3)",
        }}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
        </svg>
        <span className="text-sm">WhatsApp</span>
      </button>
    </div>
  );
};

export default StoreContact;
