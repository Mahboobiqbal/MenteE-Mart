import React from "react";

const testimonials = [
  {
    quote:
      "Great quality products and fast delivery. Ordering on WhatsApp made it so easy and the team replied within minutes.",
    name: "Ayesha K.",
    location: "Swat",
  },
  {
    quote:
      "Easypaisa payment was simple and my order arrived exactly as described. I'll definitely be shopping again.",
    name: "Bilal A.",
    location: "Peshawar",
  },
  {
    quote:
      "The WhatsApp support helped me track my order instantly. Genuinely one of the smoothest online shopping experiences.",
    name: "Sana M.",
    location: "Islamabad",
  },
];

const Stars = () => (
  <div className="flex text-[#ffb400]" aria-label="5 out of 5 stars">
    {[1, 2, 3, 4, 5].map((i) => (
      <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.539 1.118l-3.366-2.446a1 1 0 00-1.176 0l-3.366 2.446c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L1.77 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.958z" />
      </svg>
    ))}
  </div>
);

const Testimonials = () => {
  return (
    <section className="mt-14">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          What Our Customers Say
        </h2>
        <p className="text-gray-500 mt-1">Real feedback from happy shoppers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <figure
            key={t.name}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col"
          >
            <Stars />
            <blockquote className="mt-4 text-gray-700 leading-relaxed flex-1">
              "{t.quote}"
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                {t.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                <p className="text-xs text-gray-500">Verified Buyer · {t.location}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
