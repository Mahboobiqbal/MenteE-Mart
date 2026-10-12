import React from "react";
import { Link, useParams } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";

const emerald = "#008060";

const content = {
  contact: {
    title: "Contact Us",
    intro: "We're here to help. Reach out and we'll get back to you quickly.",
    sections: [
      {
        heading: "WhatsApp",
        body: "The fastest way to reach us. Tap the chat button and message us directly.",
      },
      {
        heading: "Email",
        body: "info@menabazar.com",
      },
      {
        heading: "Address",
        body: "Swat, Khyber Pakhtunkhwa, Pakistan",
      },
    ],
  },
  shipping: {
    title: "Shipping Information",
    intro: "We deliver nationwide across Pakistan.",
    sections: [
      { heading: "Delivery Time", body: "Orders are typically delivered within 3–7 working days." },
      { heading: "Shipping Charges", body: "Free delivery on orders over Rs. 3,000. A flat fee applies below that." },
      { heading: "Cash on Delivery", body: "COD is available on eligible orders across most cities." },
    ],
  },
  faq: {
    title: "Frequently Asked Questions",
    intro: "Quick answers to the questions we hear most.",
    sections: [
      { heading: "How do I place an order?", body: "Add items to your cart and check out, or tap 'Order on WhatsApp' on any product to order directly." },
      { heading: "What payment methods do you accept?", body: "Cash on Delivery, Bank Transfer and Easypaisa." },
      { heading: "How do I track my order?", body: "Use the Track Order page with your order ID, or message us on WhatsApp." },
      { heading: "Can I return an item?", body: "Yes, we offer a 7-day return policy on eligible products." },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    intro: "Your privacy matters to us.",
    sections: [
      { heading: "Information We Collect", body: "We collect the details you provide at checkout (name, phone, address) solely to fulfil your order." },
      { heading: "How We Use It", body: "Your information is used to process orders, provide support and improve our service. We never sell your data." },
      { heading: "Data Security", body: "We take reasonable measures to protect your personal information." },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    intro: "By using Mena Bazar you agree to the following terms.",
    sections: [
      { heading: "Orders & Pricing", body: "All prices are listed in PKR. We reserve the right to update prices and product availability." },
      { heading: "Payments", body: "Orders may be paid via Cash on Delivery, Bank Transfer or Easypaisa." },
      { heading: "Returns", body: "Eligible items may be returned within 7 days as per our return policy." },
    ],
  },
};

const InfoPage = ({ slug: propSlug }) => {
  const { slug: paramSlug } = useParams();
  const slug = propSlug || paramSlug;
  const page = content[slug];

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#f5f7f6]">
        <div className="text-center bg-white rounded-2xl border border-gray-200 p-10 max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Page not found</h2>
          <Link to="/" className="text-emerald-700 font-medium">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7f6]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumbs items={[{ label: page.title }]} className="mb-6" />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
          <p className="text-gray-600 mt-2">{page.intro}</p>
          <div className="mt-8 space-y-6">
            {page.sections.map((section) => (
              <div key={section.heading}>
                <h2
                  className="font-semibold text-lg"
                  style={{ color: emerald }}
                >
                  {section.heading}
                </h2>
                <p className="text-gray-700 mt-1 leading-relaxed">
                  {section.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
