import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Check, Ban } from "lucide-react";
import { CartContext } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const { addToCart, cart } = useContext(CartContext);

  if (!product) return null;

  const id = product._id;
  const name = product.pname || product.name || "Product";
  const price = product.price || 0;
  const stock = product.stock !== undefined ? Number(product.stock) : 99;
  const isOutOfStock = stock <= 0;
  const image =
    (product.images && product.images[0]) ||
    product.imageUrl ||
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80";

  const isInCart = cart.some((item) => item.product._id === id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
  };

  return (
    <div className="group relative bg-white border border-neutral-200/80 hover:border-neutral-300 rounded-2xl p-3.5 flex flex-col justify-between transition-all duration-200 hover:shadow-md">
      <div>
        {/* Image Container */}
        <div className="relative w-full aspect-square bg-[#f5f5f4] rounded-xl overflow-hidden mb-3.5 flex items-center justify-center p-3">
          <Link to={`/products/${id}`} className="w-full h-full flex items-center justify-center">
            <img
              src={image}
              alt={name}
              className={`max-h-full max-w-full object-contain object-center transition-transform duration-300 ${
                isOutOfStock ? "opacity-40 grayscale" : "group-hover:scale-105"
              }`}
              loading="lazy"
            />
          </Link>

          {isOutOfStock && (
            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white shadow-xs">
              Sold Out
            </span>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-1">
          <Link to={`/products/${id}`}>
            <h3 className="text-sm font-semibold text-neutral-800 line-clamp-1 hover:text-[#153228] transition-colors">
              {name}
            </h3>
          </Link>

          <p className="text-base font-bold text-neutral-900">
            ₹{Number(price).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Add To Cart Button */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className={`w-full mt-3.5 py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
          isOutOfStock
            ? "bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed"
            : isInCart
            ? "bg-[#153228] text-emerald-100 hover:bg-[#0f241d] cursor-pointer"
            : "bg-[#153228] text-white hover:bg-[#0f241d] active:scale-[0.98] cursor-pointer"
        }`}
      >
        {isOutOfStock ? (
          <>
            <Ban size={13} />
            <span>Out of Stock</span>
          </>
        ) : isInCart ? (
          <>
            <Check size={14} className="stroke-[2.5]" />
            <span>Added to Cart</span>
          </>
        ) : (
          <>
            <ShoppingCart size={14} className="stroke-[2.2]" />
            <span>Add to Cart</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ProductCard;
