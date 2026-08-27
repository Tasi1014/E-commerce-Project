import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FiX } from "react-icons/fi";
import axiosInstance from "../../api/axiosInstance";
import { productSchema } from "../../Validation/admin/productSchema";
import FormInput from "../../Components/form/FormInput";
import FormFileInput from "../../Components/form/FormFileInput";
import FormButton from "../../Components/form/FormButton";

export default function ProductFormModal({ isOpen, onClose, onSuccess, product = null }) {
  const isEditMode = !!product;

  // Local state for image files and previews
  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState("");

  const [imagesFiles, setImagesFiles] = useState([]);
  const [existingGalleryImages, setExistingGalleryImages] = useState([]);
  const [newImagesPreviews, setNewImagesPreviews] = useState([]);

  const [imageError, setImageError] = useState("");
  const [uploadStatus, setUploadStatus] = useState("idle"); // "idle" | "uploading" | "saving"

  // Track created object URLs for memory cleanup
  const createdObjectUrlsRef = useRef([]);

  const trackObjectUrl = (url) => {
    createdObjectUrlsRef.current.push(url);
    return url;
  };

  const cleanupObjectUrls = () => {
    createdObjectUrlsRef.current.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch (_) {}
    });
    createdObjectUrlsRef.current = [];
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: "",
      category: "Men",
      description: "",
      stock: 0,
    },
  });

  // Handle setting initial form values and image previews on open or product change
  useEffect(() => {
    if (isOpen) {
      cleanupObjectUrls();
      setMainImageFile(null);
      setImagesFiles([]);
      setNewImagesPreviews([]);
      setImageError("");
      setUploadStatus("idle");

      if (product) {
        reset({
          name: product.name || "",
          price: product.price ?? "",
          category: product.category || "Men",
          description: product.description || "",
          stock: product.stock ?? 0,
        });
        setMainImagePreview(product.mainImage || "");
        setExistingGalleryImages(product.images || []);
      } else {
        reset({
          name: "",
          price: "",
          category: "Men",
          description: "",
          stock: 0,
        });
        setMainImagePreview("");
        setExistingGalleryImages([]);
      }
    } else {
      cleanupObjectUrls();
    }
    return () => cleanupObjectUrls();
  }, [product, isOpen, reset]);

  if (!isOpen) return null;

  // Handle main image file selection
  const handleMainImageChange = (files) => {
    const file = files[0];
    if (!file) return;

    setMainImageFile(file);
    setImageError("");
    const previewUrl = trackObjectUrl(URL.createObjectURL(file));
    setMainImagePreview(previewUrl);
  };

  // Handle main image removal
  const handleRemoveMainImage = () => {
    setMainImageFile(null);
    setMainImagePreview("");
  };

  // Handle additional gallery images file selection
  const handleGalleryImagesChange = (files) => {
    if (!files.length) return;

    setImagesFiles((prev) => [...prev, ...files]);
    const newUrls = files.map((f) => trackObjectUrl(URL.createObjectURL(f)));
    setNewImagesPreviews((prev) => [...prev, ...newUrls]);
  };

  // Handle gallery image removal (existing vs newly added)
  const handleRemoveGalleryImage = (index) => {
    const totalExisting = existingGalleryImages.length;
    if (index < totalExisting) {
      // Remove existing image URL
      setExistingGalleryImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      // Remove newly added file preview
      const newIndex = index - totalExisting;
      setImagesFiles((prev) => prev.filter((_, i) => i !== newIndex));
      setNewImagesPreviews((prev) => prev.filter((_, i) => i !== newIndex));
    }
  };

  const onSubmit = async (data) => {
    // Component-level validation: main image is required
    if (!mainImagePreview && !mainImageFile) {
      setImageError("Main image is required");
      return;
    }

    try {
      let finalMainImage = isEditMode ? product.mainImage : "";
      let finalGalleryImages = [...existingGalleryImages];

      const needsUpload = !!mainImageFile || imagesFiles.length > 0;

      // STEP 1: Upload new images if selected
      if (needsUpload) {
        setUploadStatus("uploading");
        const formData = new FormData();

        if (mainImageFile) {
          formData.append("mainImage", mainImageFile);
        }

        if (imagesFiles.length > 0) {
          imagesFiles.forEach((file) => {
            formData.append("images", file);
          });
        }

        try {
          const uploadRes = await axiosInstance.post("/products/upload-images", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          if (uploadRes.data.success) {
            if (uploadRes.data.mainImage) {
              finalMainImage = uploadRes.data.mainImage;
            }
            if (uploadRes.data.images && uploadRes.data.images.length > 0) {
              finalGalleryImages = [...finalGalleryImages, ...uploadRes.data.images];
            }
          } else {
            throw new Error(uploadRes.data.message || "Upload failed");
          }
        } catch (uploadErr) {
          console.error("Upload error:", uploadErr);
          toast.error(
            uploadErr.response?.data?.message || "Failed to upload images, please try again."
          );
          setUploadStatus("idle");
          return; // Stop flow, do NOT proceed to Step 2
        }
      }

      // If main image was removed and not replaced
      if (!finalMainImage && mainImagePreview) {
        finalMainImage = mainImagePreview;
      }

      // STEP 2: Save product data
      setUploadStatus("saving");

      const payload = {
        name: data.name,
        price: Number(data.price),
        category: data.category,
        description: data.description,
        stock: Number(data.stock),
        mainImage: finalMainImage,
        images: finalGalleryImages,
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
    } finally {
      setUploadStatus("idle");
    }
  };

  const isProcessing = uploadStatus !== "idle";

  const getButtonText = () => {
    if (uploadStatus === "uploading") return "Uploading images...";
    if (uploadStatus === "saving") return isEditMode ? "Saving changes..." : "Creating product...";
    return isEditMode ? "Save Changes" : "Create Product";
  };

  const allGalleryPreviews = [...existingGalleryImages, ...newImagesPreviews];

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
            disabled={isProcessing}
            className="p-1 rounded-lg text-[#9ca3af] hover:text-white hover:bg-white/[0.06] transition-all border-none bg-transparent cursor-pointer disabled:opacity-50"
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

              {/* Category (Dropdown) */}
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
                        <option value="Men" className="bg-[#1a1a24] text-[#e8e3f0]">
                          Men
                        </option>
                        <option value="Women" className="bg-[#1a1a24] text-[#e8e3f0]">
                          Women
                        </option>
                        <option value="Accessories" className="bg-[#1a1a24] text-[#e8e3f0]">
                          Accessories
                        </option>
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
            </div>

            {/* Image Upload Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Main Image File Upload */}
              <FormFileInput
                name="mainImage"
                label="Main Product Image (Required)"
                accept="image/*"
                multiple={false}
                onChange={handleMainImageChange}
                previews={mainImagePreview ? [mainImagePreview] : []}
                onRemovePreview={handleRemoveMainImage}
                error={imageError}
                dark={true}
              />

              {/* Additional Gallery Images File Upload */}
              <FormFileInput
                name="images"
                label="Gallery Images (Optional)"
                accept="image/*"
                multiple={true}
                onChange={handleGalleryImagesChange}
                previews={allGalleryPreviews}
                onRemovePreview={handleRemoveGalleryImage}
                dark={true}
              />
            </div>

            {/* Description (Textarea) */}
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
                <p className="mt-1.5 text-[11px] text-red-500 font-medium text-left">
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
              disabled={isProcessing}
              className="px-5 py-2.5 bg-transparent border border-white/[0.08] hover:bg-white/[0.04] text-[#e8e3f0] hover:text-white rounded-xl text-sm font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <div className="min-w-[150px]">
              <FormButton
                text={getButtonText()}
                loadingText={getButtonText()}
                isLoading={isProcessing}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
