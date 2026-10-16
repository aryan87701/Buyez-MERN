import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  ShoppingBag,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  KeyRound,
  Info,
  RotateCcw,
} from "lucide-react";

export const Login = () => {
  const { user, login, updateUser, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const isExpired = searchParams.get("expired") === "true";

  // Tab: 'login' | 'register'
  const [tab, setTab] = useState("login");

  // Step inside registration/verification: 'form' | 'verify'
  const [step, setStep] = useState(
    searchParams.get("mode") === "verify" ? "verify" : "form"
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // OTP Verification state
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Redirect if already authenticated and verified
  useEffect(() => {
    if (isAuthenticated && user?.verified && step !== "verify") {
      navigate(redirect === "checkout" ? "/checkout" : "/");
    }
  }, [isAuthenticated, user, navigate, redirect, step]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  // Handle Sign In or Initial Registration Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const isReg = tab === "register";
    const endpoint = isReg ? "/api/auth/register" : "/api/auth/login";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        login(data);

        if (isReg) {
          // Move smoothly to step 2: OTP verification
          setStep("verify");
          setResendCooldown(45);
          setSuccess("Account created! A 6-digit verification code was sent to your email.");
        } else {
          // If existing user is unverified, offer instant verification step
          if (data.verified === false) {
            setStep("verify");
            setResendCooldown(30);
            setSuccess("Welcome back! Please verify your email to unlock all features.");
          } else {
            navigate(redirect === "checkout" ? "/checkout" : "/");
          }
        }
      } else {
        setError(data.message || "Authentication failed. Please check credentials.");
      }
    } catch {
      setError("Network or server connection error.");
    } finally {
      setLoading(false);
    }
  };

  // Direct OTP verification (Step 2)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const tokenToUse = user?.token;

    if (!tokenToUse) {
      setError("Session missing. Please sign in again.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenToUse}`,
        },
        body: JSON.stringify({ otp }),
      });

      const data = await res.json();

      if (res.ok) {
        updateUser({ verified: true });
        setSuccess("Email verified successfully! Welcome to Buyez.");
        setTimeout(() => {
          navigate(redirect === "checkout" ? "/checkout" : "/");
        }, 1200);
      } else {
        setError(data.message || "Invalid OTP. Please check the code and retry.");
      }
    } catch {
      setError("Server error verifying OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    const tokenToUse = user?.token;
    if (!tokenToUse) {
      setError("Please sign in first before requesting an OTP resend.");
      return;
    }

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenToUse}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setResendCooldown(45);
        setSuccess("A fresh 6-digit verification code has been emailed to you.");
      } else {
        setError(data.message || "Could not resend OTP. Please try again shortly.");
      }
    } catch {
      setError("Error requesting new OTP.");
    }
  };

  const handleSkipForNow = () => {
    navigate(redirect === "checkout" ? "/checkout" : "/");
  };

  return (
    <div className="min-h-screen bg-[#fcfbfa] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link
            to="/"
            className="w-12 h-12 rounded-2xl bg-[#153228] text-white flex items-center justify-center mx-auto shadow-sm hover:scale-105 transition-transform"
          >
            <ShoppingBag size={24} />
          </Link>
          <h2 className="text-3xl font-bold font-serif text-neutral-900 tracking-tight">
            {step === "verify"
              ? "Verify Your Email"
              : tab === "register"
              ? "Create Your Account"
              : "Welcome Back"}
          </h2>
          <p className="text-xs text-neutral-500">
            {step === "verify"
              ? `We sent a 6-digit confirmation code to ${user?.email || formData.email || "your email"}`
              : tab === "register"
              ? "Join Buyez to discover curated everyday essentials"
              : "Sign in to access your orders, cart, and account"}
          </p>
        </div>

        {/* Expired Session Notice */}
        {isExpired && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-medium flex items-center gap-2">
            <Info size={16} className="text-amber-600 flex-shrink-0" />
            <span>Your session has expired. Please sign in again to continue.</span>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white p-8 rounded-2xl border border-neutral-200/80 shadow-xs space-y-6">
          
          {/* Two Clean Tabs: Sign In | Register (Hidden during OTP step) */}
          {step !== "verify" ? (
            <div className="flex bg-neutral-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setTab("login");
                  setError("");
                  setSuccess("");
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  tab === "login"
                    ? "bg-white text-neutral-900 shadow-xs"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab("register");
                  setError("");
                  setSuccess("");
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  tab === "register"
                    ? "bg-white text-neutral-900 shadow-xs"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                Register
              </button>
            </div>
          ) : (
            /* Step indicator for OTP verification */
            <div className="flex items-center justify-between text-xs pb-1 border-b border-neutral-100 text-neutral-500">
              <span className="font-semibold text-[#153228]">Step 2 of 2: Security Verification</span>
              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  setError("");
                }}
                className="hover:text-neutral-800 underline cursor-pointer"
              >
                Change details
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium flex items-center gap-2">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-2">
              <CheckCircle size={15} className="flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* STEP 1: SIGN IN & REGISTRATION FORM */}
          {step === "form" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === "register" && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon
                      size={16}
                      className="absolute left-3.5 top-3 text-neutral-400"
                    />
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Eleanor Vance"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-[#153228]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-3 text-neutral-400"
                  />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-[#153228]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-3 text-neutral-400"
                  />
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-[#153228]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#153228] text-white text-sm font-semibold rounded-lg hover:bg-[#0f241d] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <span>Please wait...</span>
                ) : (
                  <>
                    <span>
                      {tab === "register"
                        ? "Continue to Verification"
                        : "Sign In"}
                    </span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: IN-PLACE OTP VERIFICATION FLOW */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#153228] flex items-center justify-center mx-auto mb-2 border border-emerald-100">
                  <KeyRound size={22} />
                </div>
                <p className="text-xs text-neutral-600">
                  Please enter the 6-digit code sent to your email to verify and activate your account.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1 text-center">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full text-center text-2xl tracking-[0.4em] font-mono py-3 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-[#153228]"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 4}
                className="w-full py-3 bg-[#153228] text-white text-sm font-semibold rounded-lg hover:bg-[#0f241d] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    <span>Verify & Continue</span>
                  </>
                )}
              </button>

              <div className="pt-2 flex flex-col items-center gap-3 text-xs">
                {resendCooldown > 0 ? (
                  <span className="text-neutral-400">
                    Resend code available in {resendCooldown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-[#153228] font-semibold hover:underline cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw size={13} />
                    <span>Resend OTP Code</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSkipForNow}
                  className="text-neutral-400 hover:text-neutral-600 underline cursor-pointer"
                >
                  Skip for now & browse store
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};

export default Login;