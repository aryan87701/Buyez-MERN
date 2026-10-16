import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import {
  Star,
  Truck,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Minus,
  Plus,
  ArrowLeft,
  Check,
  PackageX,
  Trash2,
  ShieldAlert,
} from "lucide-react";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, isAdmin } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedNotice, setAddedNotice] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setProduct(data);
            return;
          }
        }

        const resAll = await fetch("/api/products");
        if (resAll.ok) {
          const allProds = await resAll.json();
          const found = Array.isArray(allProds)
            ? allProds.find((p) => p._id === id)
            : null;
          if (found && isMounted) {
            setProduct(found);
            return;
          }
        }

        if (isMounted) setError(true);
      } catch {
        try {
          const resAll = await fetch("/api/products");
          if (resAll.ok) {
            const allProds = await resAll.json();
            const found = Array.isArray(allProds)
              ? allProds.find((p) => p._id === id)
              : null;
            if (found && isMounted) {
              setProduct(found);
              return;
            }
          }
        } catch {
          // ignore
        }
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProduct();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleDeleteProduct = async () => {
    if (!window.confirm("Are you sure you want to delete this product from the database?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert("Product deleted successfully.");
        navigate("/explore");
      } else {
        alert("Failed to delete product.");
      }
    } catch {
      alert("Error deleting product.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-20 flex justify-center">
        <div className="w-10 h-10 border-3 border-neutral-300 border-t-[#153228] rounded-full animate-spin" />
      </div>
    );
  }

  if (!product || error) {
    return (
      <div className="min-h-screen bg-[#fcfbfa] py-20">
        <div className="max-w-md mx-auto px-4 text-center space-y-4 bg-white p-10 rounded-2xl border border-neutral-200">
          <PackageX size={36} className="mx-auto text-neutral-400" />
          <h2 className="text-2xl font-bold font-serif text-neutral-900">
            Product Not Found
          </h2>
          <p className="text-xs text-neutral-500">
            This product could not be loaded from the database.
          </p>
          <div className="pt-2">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#153228] text-white text-xs font-semibold rounded-lg hover:bg-[#0f241d]"
            >
              <ArrowLeft size={14} />
              <span>Back to Catalogue</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const name = product.pname || product.name;
  const price = product.price || 0;
  const images =
    product.images && product.images.length > 0
      ? product.images
      : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"];
  const stock = product.stock || 0;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-[#fcfbfa] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        
        {/* Admin In-Store Action Banner */}
        {isAdmin && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-medium">
              <ShieldAlert size={16} className="text-emerald-700" />
              <span>
                <strong>Admin Mode:</strong> You are viewing this item with full
                catalog privileges (Database ID: <code className="font-mono">{product._id}</code>).
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/admin"
                className="px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-emerald-800 font-semibold hover:bg-emerald-100"
              >
                Open Admin Portal
              </Link>
              <button
                onClick={handleDeleteProduct}
                disabled={deleting}
                className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Trash2 size={13} />
                <span>{deleting ? "Deleting..." : "Delete from DB"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <Link to="/" className="hover:text-neutral-800">
            Home
          </Link>
          <span>/</span>
          <Link to="/explore" className="hover:text-neutral-800">
            Shop
          </Link>
          <span>/</span>
          <span className="text-neutral-800 font-medium truncate max-w-xs">
            {name}
          </span>
        </div>

        {/* Product Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 bg-white p-6 sm:p-10 rounded-2xl border border-neutral-200/80 shadow-xs">
          
          {/* Gallery Column */}
          <div className="space-y-4">
            <div className="relative w-full aspect-square bg-[#f5f5f4] rounded-2xl overflow-hidden p-6 flex items-center justify-center border border-neutral-200/60">
              <img
                src={images[selectedImage] || images[0]}
                alt={name}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 rounded-xl bg-neutral-100 p-1.5 border-2 transition-all flex-shrink-0 cursor-pointer ${
                      selectedImage === idx
                        ? "border-[#153228]"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information Column */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-md uppercase tracking-wider">
                {product.category || "General"}
              </span>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 font-serif leading-tight">
                {name}
              </h1>

              <div className="flex items-center gap-4 pt-1">
                <span className="text-3xl font-bold text-neutral-900">
                  ₹{Number(price).toLocaleString("en-IN")}
                </span>
                {product.ratings > 0 && (
                  <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-amber-900">
                      {product.ratings}
                    </span>
                    <span className="text-[11px] text-amber-700">
                      ({product.numreviews || 0} reviews)
                    </span>
                  </div>
                )}
              </div>

              <div>
                {stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    In Stock ({stock} units available)
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md">
                    Out of Stock
                  </span>
                )}
              </div>

              <div className="pt-2">
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-1.5">
                  Description
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {product.pdesc || "No description provided."}
                </p>
              </div>

              {stock > 0 && (
                <div className="pt-2 flex items-center gap-4">
                  <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    Quantity
                  </span>
                  <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-neutral-50">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-neutral-200 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                      disabled={quantity >= stock}
                      className="p-2 hover:bg-neutral-200 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-neutral-100">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={stock <= 0}
                  className="flex-1 py-3.5 px-6 bg-[#153228] text-white text-sm font-semibold rounded-lg hover:bg-[#0f241d] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {addedNotice ? (
                    <>
                      <Check size={18} className="text-emerald-300" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={stock <= 0}
                  className="sm:w-44 py-3.5 px-6 border-2 border-[#153228] text-[#153228] text-sm font-semibold rounded-lg hover:bg-neutral-50 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  Buy Now
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-100 text-center">
                <div className="p-2 space-y-1">
                  <Truck size={18} className="mx-auto text-neutral-600" />
                  <p className="text-[11px] font-semibold text-neutral-800">
                    Free Delivery
                  </p>
                  <p className="text-[10px] text-neutral-500">Above ₹999</p>
                </div>
                <div className="p-2 space-y-1">
                  <RotateCcw size={18} className="mx-auto text-neutral-600" />
                  <p className="text-[11px] font-semibold text-neutral-800">
                    7 Days Return
                  </p>
                  <p className="text-[10px] text-neutral-500">Hassle free</p>
                </div>
                <div className="p-2 space-y-1">
                  <ShieldCheck size={18} className="mx-auto text-neutral-600" />
                  <p className="text-[11px] font-semibold text-neutral-800">
                    100% Genuine
                  </p>
                  <p className="text-[10px] text-neutral-500">Verified</p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default ProductDetails;
