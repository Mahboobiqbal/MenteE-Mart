import React from "react";
import logo from "../assets/logo.png";

const About = () => {
  return (
    <div className="w-full bg-[#FFFFFF]">
      {/* Hero (merged from previous Home) */}
      <section className="bg-[#008060] text-[#FFFFFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col md:flex-row items-center gap-8">
          <img src={logo} alt="MenteE Mart" className="w-24 h-24 rounded-xl bg-white p-2 border border-[#FFD700]" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">MenteE Mart 🌸</h1>
            <p className="mt-2 text-[#FFFFFF]/85">Shop Smart. Live Better.</p>
            <p className="mt-4 max-w-2xl text-[#FFFFFF]/85">
              Welcome to MenteE Mart — your trusted destination for everyday essentials. We’ve moved the previous
              Home page’s highlights here so you can learn more about our brand, values, and what makes us different.
            </p>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#333333]">Our Story</h2>
          <p className="mt-3 text-[#333333]/80">
            We curate quality products at fair prices with fast delivery. Our goal is to make shopping simple,
            transparent, and delightful — every time.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-[#333333]/10">
              <h3 className="font-semibold text-[#333333]">Quality First</h3>
              <p className="mt-2 text-sm text-[#333333]/80">Every item is vetted for durability and value.</p>
            </div>
            <div className="p-6 rounded-xl border border-[#333333]/10">
              <h3 className="font-semibold text-[#333333]">Fair Pricing</h3>
              <p className="mt-2 text-sm text-[#333333]/80">We keep margins honest so you save more.</p>
            </div>
            <div className="p-6 rounded-xl border border-[#333333]/10">
              <h3 className="font-semibold text-[#333333]">Fast Support</h3>
              <p className="mt-2 text-sm text-[#333333]/80">Real help, quick responses, and easy returns.</p>
            </div>
          </div>
        </div>
      </section>

      {/* If you had custom sections on Home, paste/merge them here */}
      {/* ...existing code... */}
    </div>
  );
};

export default About;