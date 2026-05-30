import { toast } from "sonner";

export default function SingleProductItem({
  name,
  price,
  img,
  onAddToCart,
  onClick,
}) {
  const handleAddToCart = (e) => {
    if (e) e.stopPropagation();
    if (onAddToCart) {
      onAddToCart();
    } else {
      toast.success(`${name} added to cart`);
    }
  };

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_18px_rgba(0,0,0,0.08)] transition-shadow duration-300 cursor-pointer"
    >
      {/* Product image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={img}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            type="button"
            onClick={handleAddToCart}
            className="
              px-4 py-2
              sm:px-5 sm:py-2.5
              md:px-6 md:py-3
              bg-[#4f378a]
              text-white
              text-xs sm:text-sm
              font-semibold
              rounded-full
              border-none
              hover:opacity-90
              transition-opacity
            "
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Product details */}
      <div className="p-3 sm:p-4 md:p-5">
        <p className="text-sm sm:text-base font-semibold mb-1 text-[#1d1b20] leading-snug">
          {name}
        </p>

        <p className="text-sm sm:text-base text-[#49454f]">
          {price}
        </p>
      </div>
    </div>
  );
}