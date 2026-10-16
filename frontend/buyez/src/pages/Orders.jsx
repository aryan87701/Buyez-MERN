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
  const [productMap, setProductMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchOrdersAndProducts = async () => {
      try {
        // 1. Fetch orders
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
          setError("Failed to fetch your orders.");
        }

        // 2. Fetch products to resolve names if backend populate omitted 'pname'
        const resProds = await fetch("/api/products");
        if (resProds.ok) {
          const prods = await resProds.json();
          if (Array.isArray(prods) && isMounted) {
            const map = {};
            prods.forEach((p) => {
              map[p._id] = p;
            });
            setProductMap(map);
          }
        }
      } catch {
        setError("Network error while loading orders.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOrdersAndProducts();
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
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Please log in with your Buyez account to view your purchase history
            and tracking updates.
          </p>
          <div className="pt-2">
            <Link
              to="/login?redirect=orders"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#153228] text-white text-xs font-semibold rounded-lg hover:bg-[#0f241d] shadow-sm transition-all"
            >
              <span>Sign In Now</span>
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle size={13} />
            Delivered
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <Truck size={13} />
            In Transit / Shipped
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock size={13} />
            Order Placed (Pending)
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
                className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden"
              >
                {/* Header */}
                <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200/80 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-xs text-neutral-600">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-neutral-400">
                        Order Placed
                      </span>
                      <span className="font-semibold text-neutral-800">
                        {new Date(ord.createdAt || Date.now()).toLocaleDateString(
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
                        {ord.address?.fullName || user.name}
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
                      const prodId = item.productId?._id || item.productId;
                      // Resolve product name through populated object or product map fallback
                      const resolvedName =
                        item.productId?.pname ||
                        item.productId?.name ||
                        productMap[prodId]?.pname ||
                        productMap[prodId]?.name ||
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
                            ₹{(item.price * item.qty).toLocaleString("en-IN")}
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
