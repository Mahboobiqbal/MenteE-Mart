import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { getStoreBySlug, getProductsByStore } from "../utils/storeManagement";
import { normalizeProductRecord } from "../utils/dataLoader";

const emerald = "#008060";

const StorePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const storeData = await getStoreBySlug(slug);
        if (!mounted) return;

        if (!storeData) {
          setStore(null);
          setProducts([]);
          return;
        }

        setStore(storeData);

        const rows = await getProductsByStore(storeData.id, 500);
        if (!mounted) return;

        const normalized = (rows || [])
          .map((row) =>
            normalizeProductRecord({
              ...row,
              stores: {
                id: storeData.id,
                name: storeData.name,
                slug: storeData.slug,
                whatsapp_number: storeData.whatsapp_number,
              },
            })
          )
          .filter(Boolean);

        setProducts(normalized);
      } catch (error) {
        console.error("Error loading store page:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [slug]);

  const whatsappNumber = (store?.whatsapp_number || "").replace(/\D/g, "");
  const phoneNumber = (store?.owner_phone || store?.whatsapp_number || "").trim();

  if (loading) {
    return (
      <div
        className="min-h-screen flex justify-center items-center"
        style={{ background: "#f5f7f6" }}
      >
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div
              className="absolute inset-0 border-4 rounded-full animate-pulse"
              style={{ borderColor: `${emerald}33` }}
            ></div>
            <div
              className="absolute inset-2 border-4 rounded-full animate-spin"
              style={{ borderColor: `${emerald}55`, borderTopColor: emerald }}
            />
          </div>
          <p className="text-lg font-medium text-gray-700">Loading store...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#f5f7f6" }}>
        <div className="text-center bg-white rounded-2xl border border-gray-200 p-10 max-w-md">
          <div className="text-5xl mb-4">🏬</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Store not found
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn't find the store you're looking for.
          </p>
          <button
            onClick={() => navigate("/stores")}
            className="px-6 py-3 rounded-xl font-medium text-white"
            style={{ background: emerald }}
          >
            Browse all stores
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f5f7f6" }}>
      {/* Store header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <nav className="text-sm text-gray-500 mb-4 flex items-center gap-2">
            <Link to="/" className="hover:text-emerald-600">
              Home
            </Link>
            <span>→</span>
            <Link to="/stores" className="hover:text-emerald-600">
              Stores
            </Link>
            <span>→</span>
            <span className="text-gray-800 font-semibold">{store.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
              style={{ background: `${emerald}1a` }}
            >
              🏬
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{store.name}</h1>
              {store.description && (
                <p className="text-gray-600 mt-1 max-w-2xl">
                  {store.description}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                {products.length} product{products.length === 1 ? "" : "s"} available
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                    `Hello ${store.name}! I'd like to ask about your products.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white"
                  style={{ background: "#25D366" }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                  </svg>
                  Chat with store
                </a>
              )}
              {phoneNumber && (
                <a
                  href={`tel:${phoneNumber}`}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold border border-gray-300 text-gray-700"
                >
                  📞 Call store
                </a>
              )}
            </div>
          </div>

          {store.address && (
            <p className="text-sm text-gray-500 mt-4 flex items-center gap-2">
              <span>📍</span>
              {store.address}
            </p>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Products from {store.name}
        </h2>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-xl font-medium text-gray-800">
              No products yet
            </h3>
            <p className="mt-1 text-gray-500">
              This store hasn't added any products so far.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StorePage;
