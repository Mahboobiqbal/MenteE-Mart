import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllStores } from "../utils/storeManagement";

const emerald = "#008060";

const Stores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getAllStores();
        if (!mounted) return;
        setStores(data || []);
      } catch (error) {
        console.error("Error loading stores:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#f5f7f6" }}>
      <div
        className="relative overflow-hidden border-b"
        style={{ borderColor: "#e5e7eb" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-light text-gray-800">
              Our{" "}
              <span className="font-semibold" style={{ color: emerald }}>
                Stores
              </span>
            </h1>
            <p className="text-base md:text-lg text-gray-500">
              Browse products from every store and order directly on WhatsApp
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-48 rounded-2xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <h3 className="text-xl font-medium text-gray-800">
              No stores available yet
            </h3>
            <p className="mt-1 text-gray-500">
              Please check back soon for our store partners.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => {
              const whatsapp = (store.whatsapp_number || "").replace(/\D/g, "");
              return (
                <div
                  key={store.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
                >
                  <div className="h-2" style={{ background: emerald }} />
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ background: `${emerald}1a` }}
                      >
                        🏬
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">
                          {store.name}
                        </h3>
                        {store.commission_rate ? (
                          <span className="text-xs text-gray-500">
                            Partner store
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {store.description && (
                      <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                        {store.description}
                      </p>
                    )}

                    {store.address && (
                      <p className="text-sm text-gray-500 mb-4 flex items-start gap-2">
                        <span>📍</span>
                        <span className="line-clamp-2">{store.address}</span>
                      </p>
                    )}

                    <div className="mt-auto flex flex-col sm:flex-row gap-3">
                      <Link
                        to={`/store/${store.slug || store.id}`}
                        className="flex-1 text-center px-4 py-2.5 rounded-lg font-medium text-white transition-colors"
                        style={{ background: emerald }}
                      >
                        View Products
                      </Link>
                      {whatsapp && (
                        <a
                          href={`https://wa.me/${whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center px-4 py-2.5 rounded-lg font-medium text-white transition-colors"
                          style={{ background: "#25D366" }}
                        >
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Stores;
