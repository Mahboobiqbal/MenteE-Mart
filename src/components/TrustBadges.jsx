import React from "react";

const badges = [
  {
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-7 h-7">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.7"
          d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.7"
          d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a3 3 0 01-3 3H9m4-3h4m-4 0V8h4l3 3v5a1 1 0 01-1 1h-2m-6-3H5"
        />
      </svg>
    ),
    title: "Nationwide Delivery",
    subtitle: "Fast shipping across Pakistan",
  },
  {
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-7 h-7">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.7"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
    title: "Secure Payments",
    subtitle: "COD, Bank Transfer & Easypaisa",
  },
  {
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-7 h-7">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.7"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    ),
    title: "Easy Returns",
    subtitle: "7-day return policy",
  },
  {
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-7 h-7">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.7"
          d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.828m-2.828-2.829a5 5 0 00-1.464-3.535m0 0L5.636 5.636m-2.829 2.829l2.829 2.828m0 0l-2.829 2.829M12 12h.01"
        />
      </svg>
    ),
    title: "24/7 Support",
    subtitle: "WhatsApp & phone support",
  },
];

const TrustBadges = () => {
  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {badges.map((badge) => (
        <div
          key={badge.title}
          className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            {badge.icon}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm sm:text-base">
              {badge.title}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">{badge.subtitle}</p>
          </div>
        </div>
      ))}
    </section>
  );
};

export default TrustBadges;
