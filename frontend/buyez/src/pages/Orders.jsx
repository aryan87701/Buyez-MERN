import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

const Orders = () => {
  const { user, token, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/orders/myOrders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Handle 401 Session Expiration
        if (res.status === 401) {
          logout();
          navigate("/login?expired=true");
          return;
        }

        if (res.ok) {
          const data = await res.json();
          if (isMounted) setOrders(Array.isArray(data) ? data : []);
        } else {
          if (isMounted) setError("Failed to fetch your orders from the server.");
        }
      } catch {
        if (isMounted) setError("Network error while loading your orders.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOrders();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, token, logout, navigate]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fcfbfa] py-16">
        <div className="max-w-md mx-auto px-4 text-center space-y-5 bg-white p-10 rounded-2xl border border-neutral-200/80 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
            <Package size={28} />
          </div>
          <h2 className="text-2xl font-bold font-serif text-neutral-900">
            Sign In to Track Orders
          </h2>
          <p className="text-xs text-neutral-500">
            Please log into your account to inspect your purchase history and live
            shipment tracking updates.
          </p>
          <div className="pt-2">
            <Link
              to="/login?redirect=orders"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#153228] text-white text-xs font-semibold rounded-lg hover:bg-[#0f241d]"
            >
              <span>Go to Sign In</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle size={13} className="text-emerald-600" />
            <span className="capitalize">Delivered</span>
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <Truck size={13} className="text-sky-600" />
            <span className="capitalize">Shipped</span>
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={13} className="text-amber-600" />
            <span className="capitalize">Processing</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbfa] py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 space-y-8">
        
        {/* Title */}
        <div className="border-b border-neutral-200 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-serif text-neutral-900">
              My Orders
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Track status, shipment updates, and receipt details
            </p>
          </div>
          <Link
            to="/explore"
            className="text-xs font-semibold text-[#153228] hover:underline"
          >
            + New Purchase
          </Link>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-44 bg-neutral-100 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-neutral-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
              <Package size={24} />
            </div>
            <h3 className="text-lg font-bold font-serif text-neutral-800">
              No Orders Found
            </h3>
            <p className="text-xs text-neutral-500">
              You haven't placed any orders with this account yet.
            </p>
            <div className="pt-2">
              <Link
                to="/explore"
                className="px-5 py-2.5 bg-[#153228] text-white text-xs font-semibold rounded-lg inline-block hover:bg-[#0f241d]"
              >
                Explore Catalogue
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((ord) => (
              <div
                key={ord._id}
                className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-xs"
              >
                {/* Order Top Bar */}
                <div className="bg-neutral-50/70 p-4 sm:p-5 border-b border-neutral-200/60 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex flex-wrap items-center gap-6 sm:gap-10">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-neutral-400">
                        Order Placed
                      </span>
                      <span className="font-semibold text-neutral-800">
                        {new Date(ord.createdAt || 0).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "short", year: "numeric" }
                        )}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase font-bold text-neutral-400">
                        Total
                      </span>
                      <span className="font-bold text-neutral-900">
                        ₹{Number(ord.totalAmount).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase font-bold text-neutral-400">
                        Ship To
                      </span>
                      <span className="font-semibold text-neutral-800">
                        {ord.address?.fullName || user?.name || "Customer"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-neutral-400">
                      #{ord._id.slice(-8)}
                    </span>
                    {getStatusBadge(ord.status || "pending")}
                  </div>
                </div>

                {/* Items */}
                <div className="p-6 space-y-4">
                  {ord.items &&
                    ord.items.map((item, idx) => {
                      const resolvedName =
                        item.productId?.pname ||
                        item.productId?.name ||
                        "Product Item";

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs py-2 border-b border-neutral-100 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded bg-neutral-100 font-bold flex items-center justify-center text-[10px]">
                              {item.qty}x
                            </span>
                            <span className="font-semibold text-neutral-900">
                              {resolvedName}
                            </span>
                          </div>
                          <span className="font-bold text-neutral-800">
                            ₹{((item.price || 0) * (item.qty || 1)).toLocaleString("en-IN")}
                          </span>
                        </div>
                      );
                    })}

                  <div className="pt-2 text-xs text-neutral-500">
                    <p>
                      <strong>Delivery Address:</strong> {ord.address?.street},{" "}
                      {ord.address?.city}, {ord.address?.postalcode},{" "}
                      {ord.address?.country}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
