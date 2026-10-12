import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Phone, Mail, MessageCircle, Users, Award, Heart, Shield } from "lucide-react";
import { whatsappUrl } from "../utils/siteConfig";

const teamMembers = [
  {
    name: "Mahboob Iqbal",
    role: "Founder & CEO",
    bio: "Visionary behind Mena Bazar, bringing Swat Valley's heritage crafts to the digital marketplace.",
    image: null,
  },
  {
    name: "Muhammad Ali",
    role: "Operations Manager",
    bio: "Ensures smooth operations across all stores and manages seller relationships nationwide.",
    image: null,
  },
  {
    name: "Fatima Khan",
    role: "Head of Curation",
    bio: "Curates the finest handcrafted collections from artisans across Pakistan.",
    image: null,
  },
  {
    name: "Ahmed Hassan",
    role: "Tech Lead",
    bio: "Builds and maintains the platform connecting artisans with customers across Pakistan.",
    image: null,
  },
];

const values = [
  {
    icon: Heart,
    title: "Artisan First",
    desc: "Every decision starts with our artisans' wellbeing and fair compensation.",
  },
  {
    icon: Shield,
    title: "Authentic Quality",
    desc: "Hand-verified products ensuring genuine heritage craftsmanship.",
  },
  {
    icon: Users,
    title: "Community Driven",
    desc: "Empowering local communities in Swat Valley and beyond.",
  },
  {
    icon: Award,
    title: "Excellence",
    desc: "Committed to the highest standards in every piece we offer.",
  },
];

const TeamPage = () => {
  return (
    <div className="w-full min-h-screen">
      {/* Page Header */}
      <section className="bg-char text-ivory py-16 md:py-24">
        <div className="container-x px-5 md:px-10 text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-ivory/60 mb-3">Our Team</p>
          <h1 className="display text-[40px] md:text-[56px] lg:text-[64px] leading-[1.05] mb-6">
            The People Behind Mena Bazar
          </h1>
          <p className="text-[16px] md:text-[18px] leading-relaxed text-ivory/70 max-w-3xl mx-auto">
            A passionate team dedicated to bringing Pakistan's finest heritage crafts to your doorstep.
          </p>
        </div>
      </section>

      {/* Team Members */}
      <section className="container-x py-16 md:py-24 px-5 md:px-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-olive mb-3">Leadership</p>
          <h2 className="display text-[32px] md:text-[40px] leading-tight text-char mb-4">
            Meet Our Leadership
          </h2>
          <p className="text-[15px] text-olive">
            Experienced professionals united by a passion for Pakistani craftsmanship.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={member.name}
              className="group animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative aspect-[3/4] bg-stone overflow-hidden rounded-[4px] mb-6">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-char p-6">
                    <div className="w-20 h-20 bg-forest/10 rounded-full flex items-center justify-center mb-4">
                      <Users className="w-10 h-10 text-forest" strokeWidth={1.5} />
                    </div>
                    <span className="text-[13px] text-olive">Photo coming soon</span>
                  </div>
                )}
              </div>
              <h3 className="display text-[20px] text-char mb-1">{member.name}</h3>
              <p className="text-[13px] font-medium text-forest mb-3">{member.role}</p>
              <p className="text-[14px] text-olive leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Our Values */}
      <section className="bg-char text-ivory py-16 md:py-24">
        <div className="container-x px-5 md:px-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-ivory/60 mb-3">Our Values</p>
            <h2 className="display text-[32px] md:text-[40px] leading-tight mb-4">
              What Drives Us
            </h2>
            <p className="text-[15px] text-ivory/70">
              These principles guide every decision we make.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={value.title}
                className="text-center p-8 bg-ivory/5 border border-stone/20 hover:border-forest/30 hover:bg-ivory/10 transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 mx-auto mb-5 bg-forest/10 flex items-center justify-center">
                  <value.icon className="w-8 h-8 text-forest" strokeWidth={1.5} />
                </div>
                <h3 className="display text-[18px] mb-2">{value.title}</h3>
                <p className="text-[14px] text-ivory/70">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Origin Story */}
      <section className="container-x py-16 md:py-24 px-5 md:px-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-olive mb-3">Our Story</p>
            <h2 className="display text-[32px] md:text-[40px] leading-tight text-char mb-6">
              Born in Swat Valley
            </h2>
            <div className="space-y-4 text-[15px] leading-relaxed text-olive">
              <p>
                Mena Bazar was founded with a simple vision: to connect the master artisans of Swat Valley with customers across Pakistan and beyond.
              </p>
              <p>
                For generations, families in Swat have woven pashmina, wool, and kani shawls using techniques passed down through centuries. Yet these artisans often struggled to reach fair markets for their work.
              </p>
              <p>
                We built Mena Bazar to change that — creating a platform where heritage craft meets modern commerce, where every artisan gets fair compensation, and where customers receive authentic, handcrafted quality.
              </p>
            </div>
            <Link to="/about" className="mt-6 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-forest hover:text-forest-deep transition-colors">
              Read Full Story
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
            </Link>
          </div>
          <div className="relative aspect-[4/3] bg-stone overflow-hidden rounded-[4px]">
            <img
              src="/assets/1.jpg"
              alt="Swat Valley landscape"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-char/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-ivory">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ivory/70 mb-1">Swat Valley, KPK</p>
              <p className="display text-[22px] md:text-[28px] leading-tight">Where It All Began</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-forest text-ivory py-16 md:py-24">
        <div className="container-x px-5 md:px-10 text-center">
          <h2 className="display text-[32px] md:text-[42px] leading-tight mb-4">
            Join Our Journey
          </h2>
          <p className="text-[15px] text-ivory/70 max-w-xl mx-auto mb-8">
            Whether you're an artisan looking to showcase your craft or a customer seeking authentic heritage pieces, we'd love to connect.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/admin/enter" className="btn btn-solid bg-ivory text-char hover:bg-ivory/90">
              Become a Seller
            </Link>
            <a
              href={whatsappUrl("Hello! I'd like to learn more about joining Mena Bazar.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline border-ivory/30 text-ivory hover:bg-ivory/10"
            >
              <MessageCircle className="w-4 h-4" strokeWidth={1.75} />
              Contact on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TeamPage;