import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Truck, Package, ShieldAlert, KeyRound, Check } from "lucide-react";

const TopBar = () => {
  const { user, token, updateUser } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const isUnverified = user && user.verified === false;

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
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
        setShowModal(false);
      } else {
        setErr(data.message || "Invalid OTP code.");
      }
    } catch {
      setErr("Error verifying OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setErr("");
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
        setMsg("New OTP sent to your email!");
        setTimeout(() => setMsg(""), 3000);
      } else {
        setErr(data.message || "Failed to resend.");
      }
    } catch {
      setErr("Error resending OTP.");
    }
  };

  return (
    <>
      {/* Unverified Account Banner */}
      {isUnverified && (
        <div className="bg-amber-500 text-neutral-900 text-xs py-1.5 px-4 font-semibold text-center flex items-center justify-center gap-2">
          <ShieldAlert size={15} />
          <span>Your account is unverified!</span>
          <button
            onClick={() => setShowModal(true)}
            className="underline font-bold hover:text-black cursor-pointer ml-1"
          >
            Enter OTP to Verify
          </button>
          <span>|</span>
          <button
            onClick={handleResend}
            className="hover:underline cursor-pointer"
          >
            Resend OTP
          </button>
          {msg && <span className="ml-2 text-white bg-black/40 px-2 py-0.5 rounded">{msg}</span>}
        </div>
      )}

      {/* Main Top Announcement Bar */}
      <div className="bg-[#121417] text-[#e5e7eb] text-xs py-2 px-4 sm:px-8 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <Truck size={14} className="text-emerald-400" />
            <span>Free delivery on orders above ₹999</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-300">
            {user && (
              <span className="hidden sm:inline text-neutral-400">
                Welcome, {user.name}
              </span>
            )}
            <Link
              to="/orders"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Package size={13} />
              <span>Track Order</span>
            </Link>
          </div>
        </div>
      </div>

      {/* TopBar OTP Verification Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-neutral-200">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <KeyRound size={22} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold font-serif text-neutral-900">
                Enter Verification OTP
              </h3>
              <p className="text-xs text-neutral-500">
                Enter the 6-digit OTP code sent to <strong>{user?.email}</strong>.
              </p>
            </div>

            {err && (
              <div className="p-2.5 bg-rose-50 text-rose-700 rounded-lg text-xs font-medium">
                {err}
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
              <input
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full text-center text-2xl tracking-[0.4em] font-mono py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-[#153228]"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 text-xs border border-neutral-300 rounded-lg hover:bg-neutral-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || otp.length < 4}
                  className="flex-1 py-2 text-xs bg-[#153228] text-white font-semibold rounded-lg hover:bg-[#0f241d] disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleResend}
                className="text-xs text-[#153228] font-semibold hover:underline cursor-pointer"
              >
                Resend OTP to Email
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopBar;
