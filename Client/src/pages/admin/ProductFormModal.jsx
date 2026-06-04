import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FiX } from "react-icons/fi";
import axiosInstance from "../../api/axiosInstance";
import { productSchema } from "../../Validation/admin/productSchema";
import FormInput from "../../components/form/FormInput";
import FormButton from "../../components/form/FormButton";

export default function ProductFormModal({ isOpen, onClose, onSuccess, product = null }) {
  const isEditMode = !!product;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: "",
      category: "Men",
      description: "",
      mainImage: "",
      images: "",
      stock: "",
    },
  });

  // Handle resetting the form when modal opens or editing product changes
  useEffect(() => {
    if (isOpen) {
      if (product) {
        reset({
          name: product.name || "",
          price: product.price ?? "",
          category: product.category || "Men",
          description: product.description || "",
          mainImage: product.mainImage || "",
          images: product.images ? product.images.join(", ") : "",
          stock: product.stock ?? 0,
        });
      } else {
        reset({
          name: "",
          price: "",
          category: "Men",
          description: "",
          mainImage: "",
          images: "",
          stock: 0,
        });
      }
    }
  }, [product, isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    try {
      // Split images by comma, filter out empty elements, and trim whitespace
      const imagesArray = data.images
        ? data.images
            .split(",")
            .map((img) => img.trim())
            .filter(Boolean)
        : [];

      const payload = {
        ...data,
        price: Number(data.price),
        stock: Number(data.stock),
        images: imagesArray,
      };

      if (isEditMode) {
        const res = await axiosInstance.put(`/admin/products/${product._id}`, payload);
        if (res.data.success) {
          toast.success("Product updated successfully");
          onSuccess();
          onClose();
        }
      } else {
        const res = await axiosInstance.post("/admin/products", payload);
        if (res.data.success) {
          toast.success("Product created successfully");
          onSuccess();
          onClose();
        }
      }
    } catch (err) {
      console.error("Error saving product:", err);
      toast.error(err.response?.data?.message || "Failed to save product. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-all duration-300">
      {/* Modal Container */}
      <div 
        className="bg-[#1a1a24] border border-white/[0.06] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] transition-all transform duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.06] flex justify-between items-center bg-white/[0.01]">
          <h2 className="text-lg font-bold text-white tracking-tight">
            {isEditMode ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9ca3af] hover:text-white hover:bg-white/[0.06] transition-all border-none bg-transparent cursor-pointer"
            aria-label="Close modal"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-white/[0.08] flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <FormInput
                name="name"
                control={control}
                label="Product Name"
                placeholder="e.g. Premium Leather Jacket"
                errors={errors}
                dark={true}
              />

              {/* Price */}
              <FormInput
                name="price"
                control={control}
                label="Price ($)"
                type="number"
                placeholder="e.g. 129.99"
                errors={errors}
                dark={true}
              />

              {/* Category (Custom Dropdown) */}
              <div className="mb-1 relative w-full flex flex-col">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#9ca3af] mb-2 text-left">
                  Category
                </label>
                <div
                  className={`relative flex items-center border-b transition-colors duration-200 ${
                    errors.category
                      ? "border-red-400"
                      : "border-white/[0.08] focus-within:border-[#7c5cbf]/60"
                  }`}
                >
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full pb-2 pt-1 text-sm bg-transparent outline-none border-none text-[#e8e3f0] cursor-pointer transition-colors duration-200"
                      >
                        <option value="Men" className="bg-[#1a1a24] text-[#e8e3f0]">Men</option>
                        <option value="Women" className="bg-[#1a1a24] text-[#e8e3f0]">Women</option>
                        <option value="Accessories" className="bg-[#1a1a24] text-[#e8e3f0]">Accessories</option>
                      </select>
                    )}
                  />
                </div>
                {errors.category?.message && (
                  <p className="mt-1.5 text-[11px] text-red-500 font-medium">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Stock */}
              <FormInput
                name="stock"
                control={control}
                label="Stock Quantity"
                type="number"
                placeholder="e.g. 50"
                errors={errors}
                dark={true}
              />

              {/* Main Image URL */}
              <FormInput
                name="mainImage"
                control={control}
                label="Main Image URL"
                placeholder="e.g. https://images.unsplash.com/..."
                errors={errors}
                dark={true}
              />

              {/* Additional Images (Optional, comma-separated) */}
              <FormInput
                name="images"
                control={control}
                label="Additional Image URLs (Comma-separated, optional)"
                placeholder="e.g. https://img1.com, https://img2.com"
                errors={errors}
                dark={true}
              />
            </div>

            {/* Description (Custom Textarea) */}
            <div className="mb-1 relative w-full flex flex-col">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#9ca3af] mb-2 text-left">
                Description
              </label>
              <div
                className={`relative flex items-center border-b transition-colors duration-200 ${
                  errors.description
                    ? "border-red-400"
                    : "border-white/[0.08] focus-within:border-[#7c5cbf]/60"
                }`}
              >
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      placeholder="Enter detailed product description..."
                      rows={3}
                      className="w-full pb-2 pt-1 text-sm bg-transparent outline-none border-none text-[#e8e3f0] placeholder-[#6b7280] resize-y min-h-[80px] transition-colors duration-200"
                    />
                  )}
                />
              </div>
              {errors.description?.message && (
                <p className="mt-1.5 text-[11px] text-red-500 font-medium">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-end gap-3 bg-white/[0.01]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-transparent border border-white/[0.08] hover:bg-white/[0.04] text-[#e8e3f0] hover:text-white rounded-xl text-sm font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <div className="w-36">
              <FormButton
                text={isEditMode ? "Save Changes" : "Create Product"}
                loadingText={isEditMode ? "Saving..." : "Creating..."}
                isLoading={isSubmitting}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
