import { Link } from "react-router-dom";
import { FiX } from "react-icons/fi";

export default function LoginPromptModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all">
      <div className="bg-white w-[90%] max-w-md rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#49454f] hover:text-[#1d1b20] transition-colors"
          aria-label="Close"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="text-center mt-2">
          <div className="w-14 h-14 mx-auto bg-[#f2ecf4] rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🛍️</span>
          </div>
          <h3 className="text-xl font-bold text-[#1d1b20] mb-2">Login to add items</h3>
          <p className="text-sm text-[#49454f] mb-6">
            You need an account to add products to your cart. Sign in or create one in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/login"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-[#4f378a] text-white font-semibold rounded-full hover:bg-[#5f479a] transition text-center"
            >
              Login
            </Link>
            <Link
              to="/register"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[#4f378a] text-[#4f378a] font-semibold rounded-full hover:bg-[#f2ecf4] transition text-center"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}