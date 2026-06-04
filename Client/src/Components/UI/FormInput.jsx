import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function FormInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  showToggle = false,
}) {
  const [showPassword, setShowPassword] = useState(false);

  // Determine the actual input type
  const isPassword = type === "password";
  const inputType = isPassword && showToggle && showPassword ? "text" : type;

  return (
    <div className="mb-6 relative w-full">
      {/* Label */}
      {label && (
        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#49454f] mb-2 text-left">
          {label}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative flex items-center border-b border-[#e6e0e9] focus-within:border-[#4f378a] transition-colors duration-200">
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full pb-2 pt-1 text-sm bg-transparent outline-none border-none text-[#1d1b20] placeholder-[#7a7582] transition-colors duration-200"
        />

        {/* Password Eye Toggle */}
        {isPassword && showToggle && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-0 bottom-2 text-[#49454f] hover:text-[#4f378a] bg-transparent border-none cursor-pointer flex items-center justify-center p-1"
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}
