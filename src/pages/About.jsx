import React, { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import supabase from "../utils/supabase";

/*
  Updated About page:
  - Product highlight strip now loads real products from the DB (featured / top)
  - Team section removed per request
  - Small loading / error handling for the product strip
*/

const emerald = "#008060";
const yellow = "#FFD700";
const charcoal = "#333333";

const Stat = ({ value, label }) => (
  <div className="flex flex-col items-start">
    <div
      className="text-2xl md:text-3xl font-extrabold"
      style={{ color: emerald }}
    >
      {value}
    </div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);

const Feature = ({ title, desc, icon }) => (
  <div className="p-6 bg-white rounded-2xl shadow-sm border">
    <div className="flex items-start gap-4">
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center bg-[#F0FFF6]"
        style={{ color: emerald }}
      >
        {icon}
      </div>
      <div>
        <h4 className="font-semibold" style={{ color: charcoal }}>
          {title}
        </h4>
        <p className="text-sm text-gray-600 mt-1">{desc}</p>
      </div>
    </div>
  </div>
);

const Testimonial = ({ quote, name, role }) => (
  <div className="p-6 bg-white rounded-2xl shadow-sm border">
    <p className="text-gray-700 italic">“{quote}”</p>
    <div className="mt-4 text-sm font-semibold" style={{ color: charcoal }}>
      {name}
    </div>
    <div className="text-xs text-gray-500">{role}</div>
  </div>
);

const FAQItem = ({ q, a }) => (
  <details className="mb-3 p-4 rounded-lg bg-white border">
    <summary className="font-medium cursor-pointer" style={{ color: charcoal }}>
      {q}
    </summary>
    <div className="mt-2 text-sm text-gray-600">{a}</div>
  </details>
);

const About = () => {
  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [featuredError, setFeaturedError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingFeatured(true);
      try {
        // Pull up to 4 featured / top-viewed products from the DB
        const { data, error } = await supabase
          .from("products")
          .select(
            "id,name,description,image_url,price,sale_price,regular_price,views"
          )
          .or("featured.eq.true,views.gte.1")
          .order("featured", { ascending: false })
          .order("views", { ascending: false })
          .limit(4);

        if (error) throw error;
        if (!mounted) return;

        const mapped = (data || []).map((p) => ({
          id: p.id,
          name: p.name ?? p.title ?? "Untitled",
          description: p.description ?? "",
          image: p.image_url ?? p.image ?? "",
          price: p.sale_price ?? p.price ?? p.regular_price ?? 0,
          regular_price: p.regular_price ?? null,
          views: Number(p.views ?? 0),
        }));
        setFeatured(mapped);
        setFeaturedError(null);
      } catch (e) {
        console.error("Failed to load featured products:", e);
        if (mounted) setFeaturedError(e.message || "Failed to load products");
      } finally {
        if (mounted) setLoadingFeatured(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="w-full bg-[#FAFAFA]">
      {/* Hero */}
      <section className="bg-gradient-to-r from-[#E8F8F3] to-white">
        <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-4 mb-6">
              <img
                src={logo}
                alt="Mena Bazar Logo"
                className="w-16 h-16 rounded-lg shadow-md"
              />
              <div>
                <div
                  className="text-lg font-bold mb-1"
                  style={{ color: emerald }}
                >
                  Mena Bazar
                </div>
                <div className="text-xs text-gray-600">
                  Shop Smart. Live Better.
                </div>
              </div>
            </div>

            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-4"
              style={{ color: charcoal }}
            >
              Thoughtfully curated essentials, designed to make everyday living
              better.
            </h1>

            <p
              className="text-gray-700 max-w-xl mb-6"
              style={{ lineHeight: 1.7 }}
            >
              We source quality products, negotiate fair prices and deliver with
              care. Our goal is to make shopping honest, fast and delightful —
              whether you’re restocking pantry staples, gifting, or treating
              yourself.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="/products"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold shadow"
                style={{ background: emerald, color: "#fff" }}
              >
                Shop Now
              </a>
              <a
                href="/about#story"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full border font-semibold"
                style={{ borderColor: "#E6E6E6", color: charcoal }}
              >
                Our Story
              </a>
            </div>
          </div>

          {/* Visual / quick stats */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="grid grid-cols-3 gap-4">
              <Stat value="10k+" label="Happy customers" />
              <Stat value="2k+" label="Products curated" />
              <Stat value="99%" label="Satisfaction rate" />
            </div>

            <div className="mt-6">
              <h5 className="text-sm font-semibold" style={{ color: charcoal }}>
                Why customers choose us
              </h5>
              <p className="text-sm text-gray-600 mt-2">
                Fast delivery, trusted selection, and friendly support — every
                order matters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="story" className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-extrabold" style={{ color: charcoal }}>
            Our Promise
          </h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Quality, transparency and customer-first service at fair prices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Feature
            title="Quality First"
            desc="Every product is evaluated for durability and value — only the best make the shelf."
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke={emerald}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3"
                />
              </svg>
            }
          />
          <Feature
            title="Fair Pricing"
            desc="We keep margins honest so you get great value without surprises."
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke={yellow}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-3 0-4 1-4 4s1 4 4 4 4-1 4-4-1-4-4-4z"
                />
              </svg>
            }
          />
          <Feature
            title="Fast Support"
            desc="Real people, quick answers and easy returns whenever you need help."
            icon={
              <svg
                className="w-6 h-6"
                fill="none"
                stroke={charcoal}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 10h.01M12 10h.01M16 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
        </div>
      </section>

      {/* Product highlight strip (loaded from DB) */}
      <section className="bg-[#F8FFFB] py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold" style={{ color: charcoal }}>
                A few favorites
              </h3>
              <p className="text-sm text-gray-600">
                Top picks from our curated selection — updated from the store.
              </p>
            </div>
            <a
              href="/products"
              className="text-sm font-medium"
              style={{ color: emerald }}
            >
              View all
            </a>
          </div>

          {loadingFeatured ? (
            <div className="py-8 text-center text-gray-600">
              Loading featured products…
            </div>
          ) : featuredError ? (
            <div className="py-8 text-center text-red-600">
              Failed to load products: {featuredError}
            </div>
          ) : featured.length === 0 ? (
            <div className="py-8 text-center text-gray-600">
              No featured products available right now.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured.map((p, i) => (
                <div
                  key={p.id}
                  className="bg-white rounded-xl p-4 shadow-sm border flex flex-col items-center"
                >
                  <a
                    href={`/product/${p.id}`}
                    className="w-full h-40 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center"
                  >
                    <img
                      src={
                        p.image ||
                        `https://via.placeholder.com/300x300?text=Item+${i + 1}`
                      }
                      alt={p.name}
                      className="object-contain w-full h-full"
                      onError={(e) => {
                        e.currentTarget.src = `https://via.placeholder.com/300x300?text=Item+${
                          i + 1
                        }`;
                      }}
                    />
                  </a>

                  <div className="mt-3 w-full text-left">
                    <a
                      href={`/product/${p.id}`}
                      className="font-semibold text-sm block"
                      style={{ color: charcoal }}
                    >
                      {p.name}
                    </a>
                    <div className="text-sm text-gray-600 mt-1">
                      ₨{Number(p.price).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {p.views.toLocaleString()} views
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-6 text-center">
            <h3 className="text-2xl font-extrabold" style={{ color: charcoal }}>
              What shoppers say
            </h3>
            <p className="text-gray-600 mt-2">
              Real feedback — honest and helpful.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Testimonial
              quote="Fast delivery and excellent quality — will buy again!"
              name="Nadia"
              role="Verified buyer"
            />
            <Testimonial
              quote="Great value for money. Customer support was very responsive."
              name="Irfan"
              role="Regular customer"
            />
            <Testimonial
              quote="Curated selection made it easy to find gifts for family."
              name="Maya"
              role="Gift buyer"
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-6 text-center">
          <h3 className="text-2xl font-extrabold" style={{ color: charcoal }}>
            FAQ
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FAQItem
            q="What is your return policy?"
            a="Easy 7-day returns for most items — contact support and we'll guide you."
          />
          <FAQItem
            q="How long does shipping take?"
            a="Standard delivery 2-5 business days depending on location and stock."
          />
          <FAQItem
            q="Do you offer bulk discounts?"
            a="Yes — contact our support team with order details for a quote."
          />
          <FAQItem
            q="How do I track my order?"
            a="You will receive a tracking link via SMS / email once your order ships."
          />
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-gradient-to-r from-[#FDF7E6] to-white py-12">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h4 className="text-xl font-extrabold" style={{ color: charcoal }}>
            Stay in the loop
          </h4>
          <p className="text-gray-600 mt-2">
            Join our newsletter for early access to deals and curated picks.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Thanks — you're subscribed!");
            }}
            className="mt-6 flex flex-col sm:flex-row gap-3 items-center justify-center"
          >
            <input
              type="email"
              placeholder="Your email"
              required
              className="w-full sm:w-auto px-4 py-3 rounded-full border focus:outline-none"
              style={{ maxWidth: 420 }}
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-full font-semibold"
              style={{ background: emerald, color: "#fff" }}
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* <footer className="bg-[#0f172a]/5 py-8 mt-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} Mena Bazar — Built with care. <span className="block">Made in Pakistan • Support: hello@menabazar.example</span>
        </div>
      </footer> */}
    </div>
  );
};

export default About;
