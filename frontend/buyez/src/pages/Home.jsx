import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import {
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  PackageX,
} from "lucide-react";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setProducts(Array.isArray(data) ? data : []);
          }
        } else {
          if (isMounted) setError(true);
        }
      } catch {
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const heroSlides = [
    {
      subtitle: "SHOP SMARTER",
      title: "Everything You Need,\nIn One Place.",
      description:
        "Discover high-quality products for your everyday life. Great prices, reliable delivery and a better shopping experience with Buyez.",
      bgImage:
        "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1600&auto=format&fit=crop&q=80",
      ctaText: "Shop Now",
      ctaLink: "/explore",
    },
    {
      subtitle: "PREMIUM SOUND & TECH",
      title: "Studio Sound,\nAnywhere You Go.",
      description:
        "Immerse yourself in pure clarity with industry-leading noise cancellation and long-lasting battery life.",
      bgImage:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80",
      ctaText: "Explore Audio",
      ctaLink: "/explore?category=Audio",
    },
  ];

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const currentHero = heroSlides[activeSlide];

  return (
    <div className="min-h-screen bg-[#fcfbfa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-12 sm:space-y-16">
        
        {/* ========================================================= */}
        {/* 1. HERO BANNER                                            */}
        {/* ========================================================= */}
        <section className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm min-h-[380px] sm:min-h-[460px] md:min-h-[500px] flex items-center">
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out"
            style={{
              backgroundImage: `url('${currentHero.bgImage}')`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#f7f3ed]/95 via-[#f7f3ed]/80 to-transparent sm:to-black/10" />
          </div>

          <div className="relative z-10 max-w-xl p-6 sm:p-12 md:p-16 space-y-4 sm:space-y-5">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-neutral-600">
              {currentHero.subtitle}
            </span>

            <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-bold text-neutral-900 font-serif leading-[1.15] whitespace-pre-line tracking-tight">
              {currentHero.title}
            </h1>

            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal max-w-md">
              {currentHero.description}
            </p>

            <div className="pt-2">
              <Link
                to={currentHero.ctaLink}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#153228] text-white text-sm font-semibold rounded-lg hover:bg-[#0f241d] shadow-sm hover:shadow transition-all group"
              >
                <span>{currentHero.ctaText}</span>
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>

            {/* Pagination Dots */}
            <div className="flex items-center gap-2 pt-4">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    activeSlide === idx
                      ? "w-6 bg-[#153228]"
                      : "w-2 bg-neutral-300 hover:bg-neutral-400"
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Slide Arrow Controls */}
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-neutral-700 hover:text-black flex items-center justify-center shadow-md transition-all cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-neutral-700 hover:text-black flex items-center justify-center shadow-md transition-all cursor-pointer"
          >
            <ChevronRight size={20} />
          </button>
        </section>

        {/* ========================================================= */}
        {/* 2. VALUE PROPOSITIONS                                     */}
        {/* ========================================================= */}
        <section className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800 flex-shrink-0">
                <Truck size={24} className="stroke-[1.8]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900">Free Delivery</h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  on orders above ₹999
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800 flex-shrink-0">
                <ShieldCheck size={24} className="stroke-[1.8]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900">Secure Payments</h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  100% safe & secure
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800 flex-shrink-0">
                <RotateCcw size={24} className="stroke-[1.8]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900">Easy Returns</h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  7-day hassle free returns
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800 flex-shrink-0">
                <Headphones size={24} className="stroke-[1.8]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900">24/7 Support</h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  We're always here to help
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. FEATURED PRODUCTS (REAL BACKEND DATA ONLY)             */}
        {/* ========================================================= */}
        <section className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 font-serif">
                Featured Products
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                Handpicked from our catalog
              </p>
            </div>
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-800 hover:text-[#153228] transition-colors"
            >
              <span>View All</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs sm:text-sm font-medium flex items-center justify-between">
              <span>Could not load featured products from server. Please check connection.</span>
              <button
                onClick={() => window.location.reload()}
                className="underline hover:text-rose-900 cursor-pointer font-semibold"
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-64 bg-neutral-100 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
              {products.slice(0, 6).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-12 text-center space-y-3">
              <PackageX size={32} className="mx-auto text-neutral-400" />
              <h3 className="text-base font-semibold text-neutral-800">
                No Products Available
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                No products are currently published in the backend database.
                Products added by the administrator or seeded will appear here
                automatically.
              </p>
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* 4. SPLIT PROMO BANNERS                                    */}
        {/* ========================================================= */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden min-h-[260px] sm:min-h-[280px] p-8 sm:p-10 flex flex-col justify-between text-white bg-gradient-to-r from-[#172520] via-[#1f332c] to-[#274037] shadow-sm">
            <div
              className="absolute inset-0 bg-cover bg-right opacity-30 mix-blend-luminosity"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80')",
              }}
            />
            <div className="relative z-10 space-y-2 max-w-xs">
              <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-300">
                UPGRADE YOUR SETUP
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold font-serif leading-tight">
                Laptops, Headphones and More.
              </h3>
            </div>
            <div className="relative z-10 pt-4">
              <Link
                to="/explore?category=Electronics"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-neutral-900 text-xs sm:text-sm font-semibold rounded-lg hover:bg-neutral-100 shadow transition-all group"
              >
                <span>Shop Electronics</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden min-h-[260px] sm:min-h-[280px] p-8 sm:p-10 flex flex-col justify-between text-neutral-900 bg-gradient-to-r from-[#faeee1] via-[#f5e4d2] to-[#eed7c0] shadow-sm">
            <div
              className="absolute inset-0 bg-cover bg-right opacity-35"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80')",
              }}
            />
            <div className="relative z-10 space-y-2 max-w-xs">
              <span className="text-[11px] font-bold tracking-widest uppercase text-amber-800">
                DAILY ESSENTIALS
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold font-serif leading-tight">
                Accessories and Daily Gear.
              </h3>
            </div>
            <div className="relative z-10 pt-4">
              <Link
                to="/explore?category=Accessories"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#153228] text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-[#0f241d] shadow transition-all group"
              >
                <span>Shop Accessories</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Home;