import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Truck,
  Clock,
  Check,
  UserCheck,
  UserX,
  X,
  RefreshCw,
} from "lucide-react";

const AdminDashboard = () => {
  const { user, token } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    userCount: 0,
    productCount: 0,
    orderCount: 0,
    totalRevenue: 0,
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Add Product Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    pname: "",
    pdesc: "",
    price: "",
    category: "Electronics",
    stock: "",
    imageFile: null,
  });

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Fetch Analytics
      const resStats = await fetch("/api/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resStats.ok) {
        const data = await resStats.json();
        setStats(data);
      }

      // 2. Fetch Products
      const resProds = await fetch("/api/products");
      if (resProds.ok) {
        const data = await resProds.json();
        setProducts(Array.isArray(data) ? data : []);
      }

      // 3. Fetch All Orders
      const resOrds = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resOrds.ok) {
        const data = await resOrds.json();
        setOrders(Array.isArray(data) ? data : []);
      }

      // 4. Fetch Users
      const resUsers = await fetch("/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resUsers.ok) {
        const data = await resUsers.json();
        setUsersList(Array.isArray(data) ? data : []);
      }
    } catch {
      setError("Failed to load some admin data from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  // Handle Order Status Update
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setNotice(`Order status updated to "${newStatus}"`);
        setOrders((prev) =>
          prev.map((ord) =>
            ord._id === orderId ? { ...ord, status: newStatus } : ord
          )
        );
        setTimeout(() => setNotice(""), 3000);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to update order status.");
      }
    } catch {
      setError("Network error updating order status.");
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (prodId, prodName) => {
    if (!window.confirm(`Are you sure you want to delete "${prodName}"?`)) return;
    try {
      const res = await fetch(`/api/products/${prodId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotice(`Product "${prodName}" deleted successfully.`);
        setProducts((prev) => prev.filter((p) => p._id !== prodId));
        setStats((prev) => ({
          ...prev,
          productCount: Math.max(0, prev.productCount - 1),
        }));
        setTimeout(() => setNotice(""), 3000);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to delete product.");
      }
    } catch {
      setError("Network error deleting product.");
    }
  };

  // Handle Add Product Submit (Multipart with Image)
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setSubmittingProduct(true);
    setError("");

    const formData = new FormData();
    formData.append("pname", newProduct.pname);
    formData.append("pdesc", newProduct.pdesc);
    formData.append("price", newProduct.price);
    formData.append("category", newProduct.category);
    formData.append("stock", newProduct.stock);
    if (newProduct.imageFile) {
      formData.append("image", newProduct.imageFile);
    }

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const created = await res.json();
        setProducts([created, ...products]);
        setStats((prev) => ({
          ...prev,
          productCount: prev.productCount + 1,
        }));
        setShowAddModal(false);
        setNotice(`Product "${created.pname || newProduct.pname}" published!`);
        setNewProduct({
          pname: "",
          pdesc: "",
          price: "",
          category: "Electronics",
          stock: "",
          imageFile: null,
        });
        setTimeout(() => setNotice(""), 3000);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to create product.");
      }
    } catch {
      setError("Network error during product upload.");
    } finally {
      setSubmittingProduct(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbfa] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#153228] text-white">
                Admin Console
              </span>
              <span className="text-xs text-neutral-500">
                Logged in as <strong>{user?.name}</strong>
              </span>
            </div>
            <h1 className="text-3xl font-bold font-serif text-neutral-900 mt-1">
              Store Management
            </h1>
          </div>

          {/* Tab Navigation Controls */}
          <div className="flex items-center gap-1.5 bg-neutral-100 p-1.5 rounded-xl overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Overview & Analytics
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "products"
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "orders"
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "users"
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Users ({usersList.length})
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {notice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
            <CheckCircle size={15} />
            <span>{notice}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW & ANALYTICS                               */}
        {/* ========================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-2">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Total Revenue
                </span>
                <p className="text-3xl font-bold font-serif text-[#153228]">
                  ₹{Number(stats.totalRevenue || 0).toLocaleString("en-IN")}
                </p>
                <p className="text-[11px] text-neutral-500">Sum of order totals</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-2">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Total Orders
                </span>
                <p className="text-3xl font-bold font-serif text-neutral-900">
                  {stats.orderCount || orders.length || 0}
                </p>
                <p className="text-[11px] text-neutral-500">Customer transactions</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-2">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Catalogue Products
                </span>
                <p className="text-3xl font-bold font-serif text-neutral-900">
                  {stats.productCount || products.length || 0}
                </p>
                <p className="text-[11px] text-neutral-500">Active store items</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-2">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Registered Users
                </span>
                <p className="text-3xl font-bold font-serif text-neutral-900">
                  {stats.userCount || usersList.length || 0}
                </p>
                <p className="text-[11px] text-neutral-500">Total customer accounts</p>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-gradient-to-r from-[#f5ede3] via-[#f7f2ea] to-[#eee4d6] rounded-2xl p-6 sm:p-8 border border-[#e8dfd2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold font-serif text-neutral-900">
                  Quick Inventory Upload
                </h3>
                <p className="text-xs text-neutral-600 mt-1 max-w-md">
                  Upload new products directly to the store with Cloudinary image
                  storage and instant catalog availability.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 bg-[#153228] text-white text-xs font-semibold rounded-lg hover:bg-[#0f241d] flex items-center gap-1.5 cursor-pointer shadow-sm w-fit"
              >
                <Plus size={16} />
                <span>Add Product</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PRODUCTS INVENTORY TABLE                           */}
        {/* ========================================================= */}
        {activeTab === "products" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold font-serif text-neutral-900">
                  Product Inventory
                </h3>
                <p className="text-xs text-neutral-500">
                  View and manage items published to MongoDB
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-[#153228] text-white text-xs font-semibold rounded-lg hover:bg-[#0f241d] flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus size={15} />
                <span>Add New Product</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Product</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Price</th>
                      <th className="p-3.5">Stock</th>
                      <th className="p-3.5 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-neutral-500">
                          No products found in database. Click "Add New Product" to create one.
                        </td>
                      </tr>
                    ) : (
                      products.map((p) => (
                        <tr key={p._id} className="hover:bg-neutral-50/70">
                          <td className="p-3.5 flex items-center gap-3">
                            <img
                              src={
                                (p.images && p.images[0]) ||
                                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&auto=format&fit=crop&q=80"
                              }
                              alt=""
                              className="w-10 h-10 object-contain rounded-md bg-neutral-100 p-1"
                            />
                            <div>
                              <Link
                                to={`/products/${p._id}`}
                                className="font-semibold text-neutral-900 hover:text-[#153228] line-clamp-1 max-w-xs"
                              >
                                {p.pname || p.name}
                              </Link>
                              <span className="text-[10px] text-neutral-400 font-mono">
                                ID: {p._id}
                              </span>
                            </div>
                          </td>
                          <td className="p-3.5 text-neutral-600 font-medium">
                            {p.category}
                          </td>
                          <td className="p-3.5 font-bold text-neutral-900">
                            ₹{Number(p.price).toLocaleString("en-IN")}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                p.stock > 0
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {p.stock} units
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() =>
                                handleDeleteProduct(p._id, p.pname || p.name)
                              }
                              className="text-neutral-400 hover:text-rose-600 p-1.5 transition-colors cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: ORDERS MANAGEMENT TABLE                            */}
        {/* ========================================================= */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold font-serif text-neutral-900">
                All Customer Orders ({orders.length})
              </h3>
              <p className="text-xs text-neutral-500">
                View customer orders and transition statuses between pending, shipped, and delivered
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Order ID</th>
                      <th className="p-3.5">Customer & Address</th>
                      <th className="p-3.5">Items</th>
                      <th className="p-3.5">Total Amount</th>
                      <th className="p-3.5">Current Status</th>
                      <th className="p-3.5 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-neutral-500">
                          No orders placed yet.
                        </td>
                      </tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o._id} className="hover:bg-neutral-50/70">
                          <td className="p-3.5 font-mono text-neutral-500">
                            #{o._id.slice(-6)}
                            <span className="block text-[10px] text-neutral-400 font-sans">
                              {new Date(o.createdAt || Date.now()).toLocaleDateString(
                                "en-IN"
                              )}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-semibold text-neutral-900 block">
                              {o.address?.fullName || o.user?.name || "Customer"}
                            </span>
                            <span className="text-[11px] text-neutral-400 block max-w-xs truncate">
                              {o.address?.street}, {o.address?.city},{" "}
                              {o.address?.postalcode}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-medium text-neutral-700">
                              {o.items?.length || 0} item(s)
                            </span>
                          </td>
                          <td className="p-3.5 font-bold text-neutral-900">
                            ₹{Number(o.totalAmount).toLocaleString("en-IN")}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                o.status === "delivered"
                                ? "bg-emerald-100 text-emerald-800"
                                : o.status === "shipped"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {o.status || "pending"}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <select
                              value={o.status || "pending"}
                              onChange={(e) =>
                                handleUpdateStatus(o._id, e.target.value)
                              }
                              className="bg-neutral-50 border border-neutral-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-[#153228] cursor-pointer"
                            >
                              <option value="pending">Pending</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: USERS MANAGEMENT TABLE                             */}
        {/* ========================================================= */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold font-serif text-neutral-900">
                Registered Users ({usersList.length})
              </h3>
              <p className="text-xs text-neutral-500">
                Inspect customer and administrator accounts from MongoDB
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">User</th>
                      <th className="p-3.5">Email</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {usersList.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-neutral-500">
                          No users loaded.
                        </td>
                      </tr>
                    ) : (
                      usersList.map((u) => (
                        <tr key={u._id} className="hover:bg-neutral-50/70">
                          <td className="p-3.5 font-semibold text-neutral-900">
                            {u.name}
                          </td>
                          <td className="p-3.5 text-neutral-600">{u.email}</td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                u.role === "admin"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-neutral-100 text-neutral-700"
                              }`}
                            >
                              {u.role || "user"}
                            </span>
                          </td>
                          <td className="p-3.5">
                            {u.verified ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                                <UserCheck size={14} /> Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-[11px]">
                                <UserX size={14} /> Unverified
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL: ADD PRODUCT WITH CLOUDINARY FILE UPLOAD            */}
        {/* ========================================================= */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-neutral-200">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="text-xl font-bold font-serif text-neutral-900">
                  Add New Product
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProduct.pname}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, pname: e.target.value })
                    }
                    placeholder="e.g. Sony WH-1000XM5"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-[#153228]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    value={newProduct.pdesc}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, pdesc: e.target.value })
                    }
                    placeholder="Detailed product specifications..."
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg h-20 focus:outline-none focus:border-[#153228]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, price: e.target.value })
                      }
                      placeholder="e.g. 29990"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-[#153228]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Stock Units *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newProduct.stock}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, stock: e.target.value })
                      }
                      placeholder="e.g. 25"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-[#153228]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                    placeholder="e.g. Electronics, Audio, Footwear"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-[#153228]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Product Image (Uploads to Cloudinary)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        imageFile: e.target.files[0],
                      })
                    }
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded-lg file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#153228] file:text-white hover:file:bg-[#0f241d] cursor-pointer"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Uploaded file will be securely hosted on Cloudinary CDN.
                  </p>
                </div>

                <div className="flex gap-3 pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 border border-neutral-300 rounded-lg hover:bg-neutral-100 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingProduct}
                    className="flex-1 py-2.5 bg-[#153228] text-white rounded-lg hover:bg-[#0f241d] font-semibold cursor-pointer disabled:opacity-50"
                  >
                    {submittingProduct ? "Uploading to Cloudinary..." : "Publish Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
