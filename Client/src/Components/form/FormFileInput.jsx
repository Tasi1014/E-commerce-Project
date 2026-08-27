import { FiUploadCloud, FiX, FiImage } from "react-icons/fi";

export default function FormFileInput({
  name,
  label,
  accept = "image/*",
  multiple = false,
  onChange,
  previews = [], // Array of preview objects: { url, isExisting, file } or simple URLs
  onRemovePreview,
  error,
  dark = true,
}) {
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onChange(files);
    }
    // Reset file input value so re-selecting same file triggers change
    e.target.value = "";
  };

  const previewList = Array.isArray(previews) ? previews : previews ? [previews] : [];

  return (
    <div className="mb-1 relative w-full flex flex-col">
      {/* Label */}
      {label && (
        <label
          className={`block text-[10px] font-bold uppercase tracking-wider mb-2 text-left ${
            dark ? "text-[#9ca3af]" : "text-[#49454f]"
          }`}
        >
          {label}
        </label>
      )}

      {/* Input container / Drop area */}
      <div
        className={`relative flex flex-col gap-3 p-3 rounded-xl border-b border transition-colors duration-200 ${
          error
            ? "border-red-400 bg-red-500/5"
            : dark
            ? "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#7c5cbf]/60"
            : "border-[#e6e0e9] bg-gray-50 hover:border-[#4f378a]"
        }`}
      >
        <label className="flex items-center justify-center gap-2.5 cursor-pointer py-2 px-3 rounded-lg text-xs font-semibold text-[#e8e3f0] hover:text-white transition-colors">
          <FiUploadCloud className="w-5 h-5 text-[#7c5cbf]" />
          <span>{multiple ? "Choose Image Files" : "Choose Main Image File"}</span>
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {/* Thumbnail Previews */}
        {previewList.length > 0 && (
          <div className="flex flex-wrap gap-2.5 pt-2 border-t border-white/[0.06]">
            {previewList.map((item, index) => {
              const url = typeof item === "string" ? item : item.url;
              return (
                <div
                  key={url || index}
                  className="relative group w-16 h-16 rounded-lg overflow-hidden border border-white/10 bg-black/40 shrink-0"
                >
                  {url ? (
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <FiImage size={20} />
                    </div>
                  )}

                  {onRemovePreview && (
                    <button
                      type="button"
                      onClick={() => onRemovePreview(index)}
                      className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none"
                      title="Remove image"
                    >
                      <FiX size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1.5 text-[11px] text-red-500 font-medium text-left">
          {error}
        </p>
      )}
    </div>
  );
}
