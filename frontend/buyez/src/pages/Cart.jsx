import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import {
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ShoppingBag,
  Truck,
  ShieldCheck,
} from "lucide-react";

const Cart = () => {
  const {
    cart,
    updateQty,
    removeFromCart,
    clearCart,
    cartTotal,
    freeShippingThreshold,
    shippingFee,
    grandTotal,
  } = useContext(CartContext);

  const navigate = useNavigate();

  const amountNeededForFreeShipping = Math.max(
    0,
    freeShippingThreshold - cartTotal
  );
  const freeShippingProgress = Math.min(
    100,
    Math.round((cartTotal / freeShippingThreshold) * 100)
  );

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#fcfbfa] py-16">
        <div className="max-w-xl mx-auto px-4 text-center space-y-5 bg-white p-10 rounded-2xl border border-neutral-200/80 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
            <ShoppingBag size={28} />
          </div>
          <h2 className="text-2xl font-bold font-serif text-neutral-900">
            Your Cart is Empty
          </h2>
          <p className="text-sm text-neutral-500 max-w-sm mx-auto">
            Looks like you haven't added anything to your cart yet. Explore our
            handpicked catalogue and find something you love.
          </p>
          <div className="pt-2">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#153228] text-white text-sm font-semibold rounded-lg hover:bg-[#0f241d] shadow-sm transition-all"
            >
              <span>Start Shopping</span>
              <ArrowRight size={16} />
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
        <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
          <div>
            <h1 className="text-3xl font-bold font-serif text-neutral-900">
              Shopping Cart
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Review and manage your selected items
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
          >
            Clear All
          </button>
        </div>

        {/* Free Delivery Banner Indicator */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-neutral-700 font-medium">
              <Truck size={16} className="text-emerald-600" />
              {amountNeededForFreeShipping > 0 ? (
                <span>
                  Add{" "}
                  <strong className="text-neutral-900">
                    ₹{amountNeededForFreeShipping.toLocaleString("en-IN")}
                  </strong>{" "}
                  more to unlock <strong>FREE Delivery</strong>
                </span>
              ) : (
                <span className="text-emerald-700 font-bold">
                  🎉 Congratulations! You have unlocked FREE Delivery.
                </span>
              )}
            </div>
            <span className="font-semibold text-neutral-600">
              {freeShippingProgress}%
            </span>
          </div>
          <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const prod = item.product;
              const image =
                (prod.images && prod.images[0]) ||
                prod.imageUrl ||
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80";

              return (
                <div
                  key={prod._id}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  {/* Thumbnail & Title */}
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-neutral-100 rounded-xl p-2 flex items-center justify-center flex-shrink-0">
                      <img
                        src={image}
                        alt={prod.pname || prod.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="space-y-1">
                      <Link
                        to={`/products/${prod._id}`}
                        className="text-sm font-semibold text-neutral-900 hover:text-[#153228] line-clamp-1"
                      >
                        {prod.pname || prod.name}
                      </Link>
                      <p className="text-xs text-neutral-500">
                        Category: {prod.category || "General"}
                      </p>
                      <p className="text-sm font-bold text-neutral-900">
                        ₹{Number(prod.price).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                    <div className="flex items-center border border-neutral-200 rounded-lg bg-neutral-50">
                      <button
                        onClick={() => updateQty(prod._id, item.qty - 1)}
                        className="p-1.5 hover:bg-neutral-200 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(prod._id, item.qty + 1)}
                        className="p-1.5 hover:bg-neutral-200 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="text-right min-w-[80px]">
                      <p className="text-sm font-bold text-neutral-900">
                        ₹{(prod.price * item.qty).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <button
                      onClick={() => removeFromCart(prod._id)}
                      className="text-neutral-400 hover:text-rose-600 p-1.5 transition-colors cursor-pointer"
                      title="Remove Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="pt-2">
              <Link
                to="/explore"
                className="text-xs font-semibold text-[#153228] hover:underline"
              >
                ← Continue Browsing Catalogue
              </Link>
            </div>
          </div>

          {/* Right Col: Order Summary */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-5">
              <h3 className="text-lg font-bold font-serif text-neutral-900 border-b border-neutral-100 pb-3">
                Order Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900">
                    ₹{cartTotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between text-neutral-600">
                  <span>Estimated Delivery</span>
                  <span className="font-semibold text-neutral-900">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-600">FREE</span>
                    ) : (
                      `₹${shippingFee}`
                    )}
                  </span>
                </div>

                <div className="border-t border-neutral-100 pt-3 flex justify-between text-base font-bold text-neutral-900">
                  <span>Total Amount</span>
                  <span>₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full py-3.5 bg-[#153228] text-white text-sm font-semibold rounded-lg hover:bg-[#0f241d] active:scale-[0.99] shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-neutral-500 pt-1">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>100% Secure Checkout Guarantee</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Cart;
