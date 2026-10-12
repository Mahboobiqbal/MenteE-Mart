import React, { useState } from "react";
import ServiceMap from "./ServiceMap";

const ServiceMapMobile = () => {
  const [showFullMap, setShowFullMap] = useState(false);

  const freeCities = [
    "Karachi",
    "Lahore",
    "Islamabad",
    "Faisalabad",
    "Multan",
    "Gujranwala",
    "Sialkot",
    "Rawalpindi",
  ];

  return (
    <section className="mt-12">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-[#008060]">
          Delivery Across Pakistan
        </h2>
        <p className="text-sm text-gray-600">
          Free delivery in selected cities
        </p>
      </div>

      {/* Mobile: Summary Card */}
      <div className="md:hidden bg-white rounded-xl p-4 shadow-lg border border-[#dff6ec] mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-[#008060]">Delivery Coverage</h3>
          <button
            onClick={() => setShowFullMap(!showFullMap)}
            className="text-[#008060] text-sm font-semibold hover:underline"
          >
            {showFullMap ? "Hide" : "View"} Full Map →
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {freeCities.slice(0, 4).map((city) => (
            <span
              key={city}
              className="px-3 py-1 bg-[#008060] text-white text-xs rounded-full"
            >
              {city} ✓
            </span>
          ))}
          <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
            +{freeCities.length - 4} more
          </span>
        </div>

        <div className="text-xs text-gray-500">
          Free delivery available in 8 major cities across Pakistan
        </div>
      </div>

      {/* Full Map - Desktop always visible, Mobile only when expanded */}
      <div className="bg-white rounded-xl shadow-lg border border-[#dff6ec] overflow-hidden">
        <ServiceMap />
      </div>

      {/* Mobile: Quick Contact Options */}
      <div className="md:hidden mt-4 text-center">
        <p className="text-sm text-gray-600 mb-3">
          Need delivery to your city?
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://wa.me/923472886228"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold shadow transition-all hover:shadow-md"
            style={{
              background: "linear-gradient(90deg, #25D366, #128C7E)",
              color: "white",
            }}
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.04 2.875 1.186 3.074.149.198 2.05 3.127 4.974 4.266.695.299 1.234.477 1.656.611.696.222 1.33.191 1.83.116.558-.083 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347z" />
            </svg>
            WhatsApp Us
          </a>
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold border-2 transition-all hover:bg-[#008060]/10"
            style={{ borderColor: "#008060", color: "#008060" }}
          >
            Request Service
          </a>
        </div>
      </div>
    </section>
  );
};

export default ServiceMapMobile;
