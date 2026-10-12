import React from "react";

const _emerald = "#008060";
const yellow = "#FFD700";
const charcoal = "#333333";

const SectionHeader = ({ badge, title, subtitle, badgeColor = yellow }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div>
        {badge && (
          <div
            className="inline-block rounded-full px-3 py-1 text-sm font-semibold mb-2"
            style={{ background: badgeColor, color: charcoal }}
          >
            {badge}
          </div>
        )}
        <h2 className="text-xl md:text-2xl font-extrabold" style={{ color: charcoal }}>
          {title}
        </h2>
        {subtitle && <p className="text-sm mt-1" style={{ color: "#555" }}>{subtitle}</p>}
      </div>
    </div>
  );
};

export default SectionHeader;
