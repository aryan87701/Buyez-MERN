import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#121417] text-neutral-300 pt-16 pb-12 mt-20 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-neutral-800">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#153228] flex items-center justify-center text-white">
                <ShoppingBag size={20} />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white font-serif">
                Buyez
              </span>
            </Link>
            <p className="text-sm text-neutral-400 max-w-sm leading-relaxed">
              Curated everyday merchandise delivered reliably.
            </p>
            <div className="pt-2 text-xs text-neutral-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-emerald-400" />
                <span>support@buyez.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wide uppercase">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-white transition-colors">
                  Shop Catalogue
                </Link>
              </li>
              <li>
                <Link to="/About" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wide uppercase">
              Customer Portal
            </h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <Link to="/orders" className="hover:text-white transition-colors">
                  Track Your Orders
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Sign In / Register
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} Buyez. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;