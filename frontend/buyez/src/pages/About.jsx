import React from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
  Award,
} from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-[#fcfbfa] py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 space-y-16">
        
        {/* 1. HERO HEADER */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="inline-block px-3 py-1 bg-[#153228]/10 text-[#153228] text-xs font-bold tracking-widest uppercase rounded-full">
            ABOUT BUYEZ
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold font-serif text-neutral-900 tracking-tight leading-[1.15]">
            Redefining Everyday E-Commerce with Simplicity & Trust
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
            Buyez was engineered to replace cluttered, disconnected marketplaces
            with a clean, transparent, and dependable shopping destination for
            authentic electronics, audio, lifestyle, and footwear.
          </p>
        </div>

        {/* 2. BRAND STORY SECTION */}
        <div className="bg-white rounded-3xl border border-neutral-200/80 p-8 sm:p-12 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold tracking-widest uppercase text-neutral-400">
              OUR MISSION
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-neutral-900 leading-snug">
              Quality Products. Honest Pricing. Zero Distractions.
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              We started Buyez with a straightforward principle: online shopping
              should be effortless, reliable, and secure. We connect buyers directly
              with vetted products, maintain transparent inventory levels, and
              provide real-time order visibility at every step.
            </p>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Whether you are upgrading your workspace with premium headphones or
              ordering everyday essentials, Buyez guarantees genuine items backed
              by dedicated customer support and 7-day hassle-free returns.
            </p>
          </div>

          <div className="relative rounded-2xl overflow-hidden aspect-4/3 bg-neutral-100 border border-neutral-200">
            <img
              src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&auto=format&fit=crop&q=80"
              alt="Buyez Team Office & Workspace"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white text-xs font-medium">
              Designed for quality, performance, and everyday convenience.
            </div>
          </div>
        </div>

        {/* 3. FOUR CORE VALUES */}
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold tracking-widest uppercase text-neutral-400">
              THE BUYEZ STANDARD
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-neutral-900">
              Why Shoppers Choose Us
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-base font-bold text-neutral-900 font-serif">
                100% Genuine
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Direct partnerships and certified quality assurance prevent
                counterfeits.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center">
                <Clock size={20} />
              </div>
              <h3 className="text-base font-bold text-neutral-900 font-serif">
                Rapid Dispatch
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Streamlined logistics and nationwide courier dispatch within 24
                hours of order confirmation.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
                <Award size={20} />
              </div>
              <h3 className="text-base font-bold text-neutral-900 font-serif">
                Transparent Returns
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                7-day return policy with clear updates and immediate refund
                processing.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="text-base font-bold text-neutral-900 font-serif">
                OTP Verified
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Email verification ensures authentic user accounts and fraud-free
                transactions.
              </p>
            </div>
          </div>
        </div>

        {/* 4. PLATFORM ARCHITECTURE CALLOUT */}
        <div className="bg-[#153228] text-white p-8 sm:p-12 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-lg text-center sm:text-left">
            <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-300">
              MODERN FULL-STACK PLATFORM
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif leading-tight">
              Ready to Discover Buyez?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300">
              Explore our catalogue of electronics, audio accessories, and
              everyday gear with fast door-to-door delivery.
            </p>
          </div>

          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-[#153228] text-xs sm:text-sm font-semibold rounded-lg hover:bg-neutral-100 shadow transition-all flex-shrink-0"
          >
            <span>Browse Products</span>
            <ArrowRight size={15} />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default About;