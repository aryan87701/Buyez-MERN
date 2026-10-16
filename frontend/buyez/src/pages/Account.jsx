import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  User,
  Mail,
  ShieldCheck,
  AlertTriangle,
  Package,
  ShoppingCart,
  LayoutDashboard,
  LogOut,
  KeyRound,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export const Account = () => {
  const { user, token, isAdmin, logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Verification UI state
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // If not logged in, redirect to login
  useEffect(() => {
    if (!user) {
      navigate("/login?redirect=account");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  // Request a new OTP
  const handleRequestOtp = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setShowOtpInput(true);
        setResendCooldown(45);
        setMessage({
          type: "success",
          text: "A 6-digit verification code has been sent to your email.",
        });
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to send verification code. Please try again.",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Network error sending OTP. Please check your connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Submit OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otp }),
      });

      const data = await res.json();

      if (res.ok) {
        updateUser({ verified: true });
        setShowOtpInput(false);
        setOtp("");
        setMessage({
          type: "success",
          text: "Congratulations! Your email has been verified successfully.",
        });
      } else {
        setMessage({
          type: "error",
          text: data.message || "Invalid or expired OTP. Please try again.",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Network error verifying OTP.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#fcfbfa] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Breadcrumb / Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium">
            <Link to="/" className="hover:text-neutral-700">Home</Link>
            <span>/</span>
            <span className="text-neutral-800">My Account</span>
          </div>
          <h1 className="text-3xl font-bold font-serif text-neutral-900 tracking-tight">
            Account & Profile
          </h1>
          <p className="text-sm text-neutral-500">
            Manage your personal profile, verification status, and recent orders.
          </p>
        </div>

        {/* Global Feedback Banner */}
        {message.text && (
          <div
            className={`p-4 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-3 border ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle size={18} className="text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle size={18} className="text-rose-600 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#153228] text-white flex items-center justify-center text-2xl font-bold font-serif shadow-xs">
                {user.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">{user.name}</h2>
                <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                  <Mail size={13} className="text-neutral-400" />
                  <span>{user.email}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-lg uppercase tracking-wider">
                  Store Administrator
                </span>
              )}
              {user.verified ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-lg">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Verified</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold rounded-lg">
                  <AlertTriangle size={14} className="text-amber-600" />
                  <span>Unverified</span>
                </span>
              )}
            </div>
          </div>

          {/* Verification Callout if unverified */}
          {!user.verified && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 space-y-4">
              <div className="flex items-start gap-3">
                <ShieldAlert size={20} className="text-amber-700 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-amber-900">
                    Your email address is not verified
                  </h3>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Verifying your email confirms your identity, secures order notifications, and unlocks full platform access.
                  </p>
                </div>
              </div>

              {!showOtpInput ? (
                <div>
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={loading}
                    className="px-4 py-2 bg-[#153228] text-white text-xs font-semibold rounded-lg hover:bg-[#0f241d] active:scale-[0.99] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <KeyRound size={14} />
                    <span>{loading ? "Sending Code..." : "Verify Email Now"}</span>
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleVerifyOtp}
                  className="bg-white p-4 rounded-xl border border-amber-200/80 space-y-3 max-w-md"
                >
                  <label className="block text-xs font-semibold text-neutral-800">
                    Enter the 6-digit code sent to {user.email}:
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      className="w-36 text-center text-lg tracking-[0.3em] font-mono py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-[#153228]"
                    />
                    <button
                      type="submit"
                      disabled={loading || otp.length < 4}
                      className="px-4 py-2 bg-[#153228] text-white text-xs font-semibold rounded-lg hover:bg-[#0f241d] transition-all cursor-pointer disabled:opacity-50"
                    >
                      {loading ? "Checking..." : "Submit OTP"}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 pt-1 text-xs text-neutral-500">
                    <span>Didn't receive it?</span>
                    {resendCooldown > 0 ? (
                      <span className="text-neutral-400 font-medium">
                        Resend in {resendCooldown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        disabled={loading}
                        className="text-[#153228] font-bold hover:underline cursor-pointer"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Quick Stats / Info List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
              <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider block">
                Account ID
              </span>
              <span className="text-xs font-mono text-neutral-700 mt-1 block truncate">
                {user._id}
              </span>
            </div>
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
              <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider block">
                Role
              </span>
              <span className="text-xs font-semibold text-neutral-800 capitalize mt-1 block">
                {user.role || "Customer"}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            to="/orders"
            className="p-6 bg-white rounded-2xl border border-neutral-200/80 hover:border-[#153228]/40 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-700 group-hover:bg-[#153228] group-hover:text-white transition-colors flex items-center justify-center mb-4">
              <Package size={20} />
            </div>
            <h3 className="text-base font-bold text-neutral-900 group-hover:text-[#153228] flex items-center justify-between">
              <span>My Orders</span>
              <ArrowRight size={16} className="text-neutral-400 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              View your order history, statuses, and live delivery updates.
            </p>
          </Link>

          <Link
            to="/cart"
            className="p-6 bg-white rounded-2xl border border-neutral-200/80 hover:border-[#153228]/40 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-700 group-hover:bg-[#153228] group-hover:text-white transition-colors flex items-center justify-center mb-4">
              <ShoppingCart size={20} />
            </div>
            <h3 className="text-base font-bold text-neutral-900 group-hover:text-[#153228] flex items-center justify-between">
              <span>Shopping Cart</span>
              <ArrowRight size={16} className="text-neutral-400 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Review current items, shipping discounts, and checkout.
            </p>
          </Link>

          {isAdmin ? (
            <Link
              to="/admin"
              className="p-6 bg-emerald-50/60 rounded-2xl border border-emerald-200 hover:border-emerald-400 hover:shadow-sm transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center mb-4">
                <LayoutDashboard size={20} />
              </div>
              <h3 className="text-base font-bold text-emerald-950 flex items-center justify-between">
                <span>Admin Portal</span>
                <ArrowRight size={16} className="text-emerald-700 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-emerald-800/80 mt-1">
                Access product catalogues, order fulfillment, and user accounts.
              </p>
            </Link>
          ) : (
            <Link
              to="/explore"
              className="p-6 bg-white rounded-2xl border border-neutral-200/80 hover:border-[#153228]/40 hover:shadow-sm transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-700 group-hover:bg-[#153228] group-hover:text-white transition-colors flex items-center justify-center mb-4">
                <User size={20} />
              </div>
              <h3 className="text-base font-bold text-neutral-900 group-hover:text-[#153228] flex items-center justify-between">
                <span>Shop Catalogue</span>
                <ArrowRight size={16} className="text-neutral-400 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Browse our curated selection of artisanal goods and apparel.
              </p>
            </Link>
          )}
        </div>

        {/* Security & Sign Out Section */}
        <div className="pt-4 flex justify-between items-center text-xs text-neutral-500 border-t border-neutral-200">
          <span>Buyez Secured Account Session</span>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-rose-600 font-semibold hover:text-rose-700 cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default Account;
