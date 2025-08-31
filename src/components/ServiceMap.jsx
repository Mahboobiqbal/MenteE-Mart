import React from 'react';

const ServiceMap = () => {
  // Supported cities in Swat
  const supportedCities = [
    { name: "Saidu Sharif", lat: 34.75, lng: 72.35 },
    { name: "Mingora", lat: 34.77, lng: 72.37 },
    { name: "Kabal", lat: 34.82, lng: 72.55 },
    { name: "Charbagh", lat: 34.55, lng: 72.25 },
    { name: "Barikot", lat: 34.92, lng: 72.52 }
  ];

  return (
    <div className="py-16 bg-gradient-to-br from-[#f0f9f6] to-[#e6f4f1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#008060] mb-4">
            Our Service Coverage
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Currently delivering to major cities in Swat District with expanding coverage across Pakistan
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-center">
          {/* Map Container */}
          <div className="flex-1 relative">
            <div className="bg-white rounded-2xl shadow-xl p-4 border border-[#d1f0e2]">
              {/* Simplified Pakistan Map with Swat Highlighted */}
              <div className="relative h-96 w-full bg-[#e8f5e9] rounded-xl overflow-hidden">
                {/* Pakistan Outline (Stylized) */}
                <div className="absolute inset-4 border-2 border-[#007a5a] rounded-lg bg-[#c8e6c9]/30"></div>
                
                {/* Swat Region Highlight */}
                <div className="absolute top-1/3 left-1/4 w-1/3 h-1/4 bg-[#008060]/20 border-2 border-[#008060] rounded-md flex items-center justify-center">
                  <span className="text-[#008060] font-bold text-sm md:text-base">Swat District</span>
                </div>
                
                {/* City Markers */}
                {supportedCities.map((city, index) => (
                  <div 
                    key={index}
                    className="absolute w-4 h-4 bg-[#FFD700] rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-pulse"
                    style={{
                      top: `${25 + index * 8}%`,
                      left: `${35 + (index % 3) * 10}%`
                    }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#008060] text-white text-xs font-medium px-2 py-1 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-300">
                      {city.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#d1f0e2]">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-[#008060]/10 flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-[#008060]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-[#333]">Swat District Coverage</h3>
              </div>

              <p className="text-gray-600 mb-6">
                We're proud to serve the beautiful Swat Valley with fast and reliable delivery. 
                Our logistics network ensures your products reach you fresh and on time.
              </p>

              <div className="mb-6">
                <h4 className="font-bold text-[#008060] mb-3">Currently Serving:</h4>
                <div className="grid grid-cols-2 gap-3">
                  {supportedCities.map((city, index) => (
                    <div key={index} className="flex items-center">
                      <svg className="w-5 h-5 text-[#FFD700] mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                      <span className="text-gray-700">{city.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#008060]/5 rounded-xl p-4 border border-[#008060]/10">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-[#008060] mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p className="text-gray-600 text-sm">
                    <span className="font-semibold">Expanding Soon:</span> We're continuously working to expand our service area to more cities in KPK and beyond. Stay tuned for updates!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white rounded-2xl shadow-lg p-6 border border-[#d1f0e2] max-w-4xl mx-auto">
            <div className="flex-1 text-left">
              <h3 className="text-xl font-bold text-[#333] mb-1">Don't see your city?</h3>
              <p className="text-gray-600">Request delivery in your area</p>
            </div>
            <a 
              href="mailto:info@nainzaka.com?subject=Delivery%20Area%20Request" 
              className="px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
              style={{ background: 'linear-gradient(90deg, #008060, #006b51)', color: 'white' }}
            >
              Request Service
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceMap;