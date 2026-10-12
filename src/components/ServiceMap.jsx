// filepath: h:\Code\Mena Bazar\src\components\ServiceMap.jsx
import React from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const emerald = "#008060";
const yellow = "#FFD700";
const charcoal = "#333333";

// city coordinates (lat, lng) — adjust if you want different placement
const cities = [
  { name: "Karachi", coords: [24.8607, 67.0011], free: true },
  { name: "Hyderabad", coords: [25.3960, 68.3578], free: false },
  { name: "Sukkur", coords: [27.7052, 68.8574], free: false },
  { name: "Quetta", coords: [30.1798, 66.9750], free: false },
  { name: "Multan", coords: [30.1978, 71.4711], free: true },
  { name: "Faisalabad", coords: [31.4504, 73.1350], free: true },
  { name: "Lahore", coords: [31.5204, 74.3587], free: true },
  { name: "Islamabad", coords: [33.6844, 73.0479], free: true },
  { name: "Rawalpindi", coords: [33.5651, 73.0169], free: true },
  { name: "Peshawar", coords: [34.0150, 71.5249], free: false },
  { name: "Mingora (Swat)", coords: [34.7758, 72.3601], free: false },
  { name: "Abbottabad", coords: [34.1463, 73.2115], free: false },
  { name: "Gujranwala", coords: [32.1877, 74.1945], free: true },
  { name: "Sialkot", coords: [32.4945, 74.5229], free: true },
  { name: "Gilgit", coords: [35.9200, 74.3080], free: false },
];

const ServiceMap = () => {
  const centerPakistan = [30.3753, 69.3451]; // Pakistan center
  return (
    <section className="py-16 bg-gradient-to-br from-[#f0f9f6] to-[#eef9f2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold" style={{ color: emerald }}>
            Nationwide Coverage — Pakistan
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-2">
            Real map powered by OpenStreetMap (free). Click markers for city info — green = free delivery.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Map */}
          <div className="flex-1">
            <div className="rounded-2xl shadow-xl overflow-hidden border border-[#dff6ec]">
              <MapContainer center={centerPakistan} zoom={5} scrollWheelZoom={false} style={{ height: 520, width: "100%" }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {cities.map((c) => (
                  <CircleMarker
                    key={c.name}
                    center={c.coords}
                    radius={c.free ? 10 : 8}
                    pathOptions={{
                      color: c.free ? emerald : yellow,
                      fillColor: c.free ? emerald : yellow,
                      fillOpacity: 0.9,
                      weight: 1.5,
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                      <div className="text-sm font-semibold" style={{ color: charcoal }}>
                        {c.name} {c.free ? "— FREE delivery" : "— Standard"}
                      </div>
                    </Tooltip>
                    <Popup>
                      <div className="text-sm">
                        <div style={{ fontWeight: 700 }}>{c.name}</div>
                        <div style={{ color: "#4B5563", marginTop: 6 }}>
                          {c.free ? "Free delivery available in this city — awesome!" : "Standard delivery applies here."}
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Right info panel */}
          <aside className="w-full lg:w-96">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#dff6ec]">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#008060]/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#008060]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: charcoal }}>Delivering across Pakistan</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    We cover major cities and growing towns — free delivery in selected cities.
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold" style={{ color: emerald }}>Quick facts</h4>
                <ul className="mt-3 text-sm text-gray-700 space-y-2">
                  <li>• Same-week dispatch for in-stock items in supported cities.</li>
                  <li>• Local hubs reduce shipping times & cost.</li>
                  <li>• SMS & email tracking for every order.</li>
                </ul>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-semibold" style={{ color: emerald }}>Sample cities with Free delivery</h4>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-700">
                  {cities.filter(c => c.free).map((c) => (
                    <div key={c.name} className="flex items-center gap-2">
                      <div style={{ width: 10, height: 10, borderRadius: 9999, background: emerald }} />
                      <span>{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <a href="/contact" className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold shadow" style={{ background: emerald, color: "#fff" }}>
                  Request service for your city
                </a>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Coverage is updated frequently. If you don't see your city listed, request service — we add nearby areas quickly.
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default ServiceMap;