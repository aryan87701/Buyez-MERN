import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  Lock,
} from "lucide-react";

const Checkout = () => {
  const { user, token, isAuthenticated, logout } = useContext(AuthContext);
  const { cart, grandTotal, cartTotal, shippingFee, clearCart } =
    useContext(CartContext);
  const navigate = useNavigate();

  // Load saved address from sessionStorage if returning from login redirect
  const [address, setAddress] = useState(() => {
    try {
      const saved = sessionStorage.getItem("buyez_pending_address");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      fullName: user?.name || "",
      street: "",
      city: "",
      postalcode: "",
      country: "India",
    };
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Sync user's name if they just logged in and fullName was blank
  useEffect(() => {
    if (user?.name && !address.fullName) {
      setAddress((prev) => ({ ...prev, fullName: user.name }));
    }
  }, [user]);

  if (cart.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen bg-[#fcfbfa] py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold font-serif text-neutral-900">
          No Items to Checkout
        </h2>
        <p className="text-xs text-neutral-500">
          Your shopping cart is currently empty.
        </p>
        <Link
          to="/explore"
          className="inline-block text-sm text-[#153228] font-semibold hover:underline"
        >
          ← Return to Catalogue
        </Link>
      </div>
    );
  }

  const handleChange = (e) => {
    const updated = { ...address, [e.target.name]: e.target.value };
    setAddress(updated);
    setError("");
    try {
      sessionStorage.setItem("buyez_pending_address", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate("/login?redirect=checkout");
      return;
    }

    if (
      !address.fullName ||
      !address.street ||
      !address.city ||
      !address.postalcode ||
      !address.country
    ) {
      setError("Please fill in all required shipping address fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        items: cart.map((item) => ({
          productId: item.product._id,
          qty: item.qty,
          price: item.product.price,
        })),
        totalAmount: grandTotal,
        address: {
          fullName: address.fullName,
          street: address.street,
          city: address.city,
          postalcode: address.postalcode,
          country: address.country,
        },
        paymentId: "COD",
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Handle 401 Session Expiration
      if (res.status === 401) {
        logout();
        navigate("/login?redirect=checkout&expired=true");
        return;
      }

      const data = await res.json();

      if (res.ok) {
        setOrderSuccess(data.order || { _id: "ORD-" + Date.now() });
        clearCart();
        try {
          sessionStorage.removeItem("buyez_pending_address");
        } catch {
          // ignore
        }
      } else {
        setError(data.message || "Failed to place order. Please try again.");
      }
    } catch {
      setError("Network or server error while placing your order.");
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[#fcfbfa] py-16">
        <div className="max-w-xl mx-auto px-4 text-center space-y-6 bg-white p-10 rounded-2xl border border-neutral-200/80 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>

          <h2 className="text-3xl font-bold font-serif text-neutral-900">
            Order Placed Successfully!
          </h2>

          <p className="text-sm text-neutral-600 leading-relaxed">
            Thank you for shopping with Buyez! We've received your order and
            dispatched a confirmation email.
          </p>

          <div className="bg-neutral-50 p-4 rounded-xl text-xs text-neutral-700 border border-neutral-200/80 space-y-1">
            <p>
              Order Reference:{" "}
              <strong className="text-neutral-900 font-mono">
                {orderSuccess._id || "Confirmed"}
              </strong>
            </p>
            <p>Status: <span className="font-semibold text-amber-700">Pending Dispatch</span></p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link
              to="/orders"
              className="flex-1 py-3 px-4 bg-[#153228] text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-[#0f241d] transition-all"
            >
              View Order History
            </Link>
            <Link
              to="/explore"
              className="flex-1 py-3 px-4 border border-neutral-300 text-neutral-800 text-xs sm:text-sm font-semibold rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfbfa] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        
        {/* Title */}
        <div className="border-b border-neutral-200 pb-4">
          <h1 className="text-3xl font-bold font-serif text-neutral-900">
            Checkout
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Enter your shipping details to complete your order
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Shipping Details Form */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-xs space-y-5">
              <h3 className="text-lg font-bold font-serif text-neutral-900 flex items-center gap-2">
                <Truck size={18} className="text-[#153228]" />
                <span>Delivery Address</span>
              </h3>

              {!isAuthenticated && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center justify-between">
                  <span>Sign in to complete checkout without losing your entered address.</span>
                  <Link
                    to="/login?redirect=checkout"
                    className="font-bold underline hover:text-amber-900 cursor-pointer"
                  >
                    Sign In
                  </Link>
                </div>
              )}

              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={address.fullName}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-[#153228]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="street"
                    required
                    value={address.street}
                    onChange={handleChange}
                    placeholder="e.g. Flat 402, Green Avenue, MG Road"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-[#153228]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={address.city}
                      onChange={handleChange}
                      placeholder="e.g. Bengaluru"
                      className="w-full px-3.5 py-2.5 bg-neutral-50 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-[#153228]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Postal Code / PIN *
                    </label>
                    <input
                      type="text"
                      name="postalcode"
                      required
                      value={address.postalcode}
                      onChange={handleChange}
                      placeholder="e.g. 560001"
                      className="w-full px-3.5 py-2.5 bg-neutral-50 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-[#153228]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    required
                    value={address.country}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-[#153228]"
                  />
                </div>

                {/* Payment Selection */}
                <div className="pt-4 border-t border-neutral-100 space-y-3">
                  <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    Payment Method
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3.5 rounded-xl border border-[#153228] bg-emerald-50/40 cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="accent-[#153228]"
                      />
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">
                          Cash on Delivery
                        </p>
                        <p className="text-xs text-neutral-500">
                          Pay cash or UPI directly when your courier arrives
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-[#153228] text-white text-sm font-semibold rounded-lg hover:bg-[#0f241d] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Placing Order...</span>
                    ) : (
                      <>
                        <Lock size={16} />
                        <span>Confirm & Place Order (₹{grandTotal.toLocaleString("en-IN")})</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* Right Col: Order Summary */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
              <h3 className="text-lg font-bold font-serif text-neutral-900 border-b border-neutral-100 pb-3">
                Items in Order ({cart.length})
              </h3>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.product._id}
                    className="flex items-center justify-between text-xs py-1"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-5 h-5 rounded bg-neutral-100 text-neutral-600 font-bold flex items-center justify-center text-[10px]">
                        {item.qty}x
                      </span>
                      <span className="truncate max-w-[160px] font-medium text-neutral-800">
                        {item.product.pname || item.product.name}
                      </span>
                    </div>
                    <span className="font-bold text-neutral-900">
                      ₹{(item.product.price * item.qty).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-100 pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900">
                    ₹{cartTotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Delivery</span>
                  <span className="font-semibold text-neutral-900">
                    {shippingFee === 0 ? "FREE" : `₹${shippingFee}`}
                  </span>
                </div>
                <div className="border-t border-neutral-100 pt-2 flex justify-between text-sm font-bold text-neutral-900">
                  <span>Grand Total</span>
                  <span>₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-neutral-500 flex items-center gap-1.5 justify-center">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Protected by 256-bit SSL encryption</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Checkout;
