import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import {
  Search,
  ShoppingCart,
  User,
  ChevronDown,
  ShoppingBag,
  LogOut,
  Package,
  LayoutDashboard,
  Menu,
  X,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const Navbar = () => {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);

  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Live Search Dropdown States
  const [catalog, setCatalog] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const dropdownRef = useRef(null);
  const searchContainerRef = useRef(null);
  const mobileSearchContainerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch product catalog for instant search across any page
  useEffect(() => {
    let isMounted = true;
    fetch("/api/products")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setCatalog(data);
        }
      })
      .catch((err) => console.error("Search catalog fetch error:", err));
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter products live as the user types
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const matches = catalog.filter((p) => {
      const name = (p.pname || p.name || "").toLowerCase();
      const desc = (p.pdesc || "").toLowerCase();
      const cat = (p.category || "").toLowerCase();
      return name.includes(q) || desc.includes(q) || cat.includes(q);
    });

    setSearchResults(matches);
    setShowSearchDropdown(true);
  }, [searchQuery, catalog]);

  // Close search dropdown and mobile menu on route change
  useEffect(() => {
    setShowSearchDropdown(false);
    setSearchQuery("");
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target) &&
        mobileSearchContainerRef.current &&
        !mobileSearchContainerRef.current.contains(event.target)
      ) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 sm:gap-8">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#153228] flex items-center justify-center text-white shadow-sm group-hover:bg-[#0f241d] transition-colors">
            <ShoppingBag size={22} className="stroke-[2.2]" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#111827] font-serif">
            Buyez
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-[15px] font-medium text-neutral-700">
          <Link
            to="/"
            className={`pb-1 transition-all ${
              isActive("/")
                ? "text-[#153228] font-semibold border-b-2 border-[#153228]"
                : "hover:text-[#153228]"
            }`}
          >
            Home
          </Link>
          <Link
            to="/explore"
            className={`pb-1 transition-all ${
              isActive("/explore")
                ? "text-[#153228] font-semibold border-b-2 border-[#153228]"
                : "hover:text-[#153228]"
            }`}
          >
            Shop
          </Link>
          <Link
            to="/About"
            className={`pb-1 transition-all ${
              isActive("/About")
                ? "text-[#153228] font-semibold border-b-2 border-[#153228]"
                : "hover:text-[#153228]"
            }`}
          >
            About
          </Link>

          {/* Dedicated Admin Portal Pill for Admins */}
          {isAdmin && (
            <Link
              to="/admin"
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                isActive("/admin")
                  ? "bg-[#153228] text-white"
                  : "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
              }`}
            >
              <LayoutDashboard size={14} />
              <span>Admin Portal</span>
            </Link>
          )}
        </nav>

        {/* Search Bar with Instant Live Dropdown */}
        <div
          ref={searchContainerRef}
          className="hidden md:flex items-center flex-1 max-w-md relative"
        >
          <form onSubmit={handleSearch} className="w-full relative">
            <Search
              size={18}
              className="absolute left-3.5 top-2.5 text-neutral-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search products, brands, categories..."
              value={searchQuery}
              onFocus={() => {
                if (searchQuery.trim()) setShowSearchDropdown(true);
              }}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-neutral-100 hover:bg-neutral-50 focus:bg-white text-sm text-neutral-800 placeholder-neutral-400 rounded-lg border border-neutral-200 focus:border-[#153228] focus:ring-1 focus:ring-[#153228] transition-all outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setShowSearchDropdown(false);
                }}
                className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                <X size={15} />
              </button>
            )}
          </form>

          {/* Live Search Results Dropdown Menu */}
          {showSearchDropdown && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-neutral-200/90 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="p-2.5 border-b border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400 font-medium px-3.5 bg-neutral-50/60">
                <span>Matching Products ({searchResults.length})</span>
                <button
                  type="button"
                  onClick={() => setShowSearchDropdown(false)}
                  className="text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  <X size={13} />
                </button>
              </div>

              {searchResults.length > 0 ? (
                <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100">
                  {searchResults.slice(0, 5).map((item) => (
                    <Link
                      key={item._id}
                      to={`/products/${item._id}`}
                      onClick={() => {
                        setShowSearchDropdown(false);
                        setSearchQuery("");
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-neutral-50/80 transition-colors group cursor-pointer"
                    >
                      <div className="w-11 h-11 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0 border border-neutral-200/70 flex items-center justify-center">
                        {item.images?.[0] ? (
                          <img
                            src={item.images[0]}
                            alt={item.pname || item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <ShoppingBag size={18} className="text-neutral-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-neutral-900 truncate group-hover:text-[#153228]">
                          {item.pname || item.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold text-[#153228]">
                            ₹{Number(item.price || 0).toLocaleString("en-IN")}
                          </span>
                          {item.category && (
                            <span className="text-[10px] text-neutral-400 capitalize">
                              • {item.category}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight
                        size={15}
                        className="text-neutral-300 group-hover:text-[#153228] group-hover:translate-x-0.5 transition-all flex-shrink-0"
                      />
                    </Link>
                  ))}

                  <div className="p-2.5 text-center bg-neutral-50 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSearchDropdown(false);
                        navigate(
                          `/explore?search=${encodeURIComponent(
                            searchQuery.trim()
                          )}`
                        );
                        setSearchQuery("");
                      }}
                      className="text-xs font-semibold text-[#153228] hover:underline cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <span>View all {searchResults.length} results in Store</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center space-y-1">
                  <p className="text-xs font-semibold text-neutral-700">
                    No matching products found
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    No products match "{searchQuery}". Press Enter to search all items.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions: Cart & Account */}
        <div className="flex items-center gap-5 sm:gap-6">
          
          {/* Cart */}
          <Link
            to="/cart"
            className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-[#153228] transition-colors relative"
          >
            <div className="relative">
              <ShoppingCart size={21} className="stroke-[1.8]" />
              {cartCount > 0 && (
                <span className="absolute -top-2.5 -right-2.5 bg-rose-600 text-white text-[11px] font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Cart</span>
          </Link>

          {/* Account Dropdown */}
          <div className="relative" ref={dropdownRef}>
            {user ? (
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1.5 text-sm font-medium text-neutral-800 hover:text-[#153228] focus:outline-none cursor-pointer py-1"
              >
                <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs ${
                  isAdmin ? "bg-emerald-700 text-white" : "bg-[#153228]/10 text-[#153228]"
                }`}>
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <span className="hidden md:inline font-semibold">
                  {isAdmin ? "Admin" : "Account"}
                </span>
                <ChevronDown size={14} className="text-neutral-500" />
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 text-sm font-semibold text-neutral-800 hover:text-[#153228]"
              >
                <User size={20} className="stroke-[1.8]" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Dropdown Menu */}
            {isDropdownOpen && user && (
              <div className="absolute right-0 mt-2.5 w-56 bg-white rounded-xl shadow-xl border border-neutral-100 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-4 py-2.5 border-b border-neutral-100">
                  <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
                    Signed in as
                  </p>
                  <p className="text-sm font-semibold text-neutral-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                  {isAdmin ? (
                    <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded">
                      Store Administrator
                    </span>
                  ) : (
                    <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600 rounded">
                      Customer Account
                    </span>
                  )}
                </div>

                <div className="py-1">
                  <Link
                    to="/account"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-[#153228] transition-colors"
                  >
                    <User size={16} />
                    <span>My Account</span>
                  </Link>

                  <Link
                    to="/orders"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-[#153228] transition-colors"
                  >
                    <Package size={16} />
                    <span>My Orders</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-emerald-800 font-semibold hover:bg-emerald-50 transition-colors"
                    >
                      <LayoutDashboard size={16} />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                </div>

                <div className="pt-1 border-t border-neutral-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-neutral-700 hover:text-neutral-900 p-1"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          ref={mobileSearchContainerRef}
          className="md:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-6 space-y-4"
        >
          <div className="relative">
            <form onSubmit={handleSearch} className="relative">
              <Search
                size={18}
                className="absolute left-3.5 top-2.5 text-neutral-400"
              />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onFocus={() => {
                  if (searchQuery.trim()) setShowSearchDropdown(true);
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 bg-neutral-100 text-sm rounded-lg border border-neutral-200 outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setShowSearchDropdown(false);
                  }}
                  className="absolute right-3 top-2.5 text-neutral-400"
                >
                  <X size={15} />
                </button>
              )}
            </form>

            {/* Mobile Dropdown Results */}
            {showSearchDropdown && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden z-50">
                {searchResults.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto divide-y divide-neutral-100">
                    {searchResults.slice(0, 4).map((item) => (
                      <Link
                        key={item._id}
                        to={`/products/${item._id}`}
                        onClick={() => {
                          setShowSearchDropdown(false);
                          setSearchQuery("");
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 p-2.5 hover:bg-neutral-50"
                      >
                        <div className="w-9 h-9 rounded-md bg-neutral-100 overflow-hidden flex-shrink-0 border border-neutral-200 flex items-center justify-center">
                          {item.images?.[0] ? (
                            <img
                              src={item.images[0]}
                              alt={item.pname || item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ShoppingBag size={14} className="text-neutral-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-neutral-900 truncate">
                            {item.pname || item.name}
                          </p>
                          <span className="text-xs font-bold text-[#153228]">
                            ₹{Number(item.price || 0).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </Link>
                    ))}
                    <div className="p-2 text-center bg-neutral-50">
                      <button
                        type="button"
                        onClick={() => {
                          setShowSearchDropdown(false);
                          navigate(
                            `/explore?search=${encodeURIComponent(
                              searchQuery.trim()
                            )}`
                          );
                          setSearchQuery("");
                          setMobileMenuOpen(false);
                        }}
                        className="text-xs font-semibold text-[#153228]"
                      >
                        View all results in Shop →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-neutral-500">
                    No products matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          <nav className="flex flex-col gap-2 font-medium text-neutral-800">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-neutral-100"
            >
              Home
            </Link>
            <Link
              to="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-neutral-100"
            >
              Shop Catalogue
            </Link>
            <Link
              to="/About"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-neutral-100"
            >
              About Us
            </Link>
            {user ? (
              <>
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 px-3 rounded-lg hover:bg-neutral-100 flex items-center gap-2"
                >
                  <User size={16} />
                  <span>My Account</span>
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 px-3 rounded-lg hover:bg-neutral-100 flex items-center gap-2"
                >
                  <Package size={16} />
                  <span>Track Orders</span>
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 px-3 rounded-lg bg-emerald-100 text-emerald-900 font-bold flex items-center gap-2"
                  >
                    <LayoutDashboard size={16} />
                    <span>Admin Console</span>
                  </Link>
                )}
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg bg-[#153228] text-white font-medium flex items-center gap-2 justify-center"
              >
                <User size={16} />
                <span>Sign In / Register</span>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
