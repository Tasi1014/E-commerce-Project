export default function FormButton({
  text,
  type = "submit",
  onClick,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="w-full py-3.5 bg-[#4f378a] hover:bg-[#5f479a] text-white text-xs font-bold uppercase tracking-[0.1em] rounded-xl cursor-pointer border-none shadow-[0_8px_24px_rgba(79,55,138,0.25)] hover:shadow-[0_12px_28px_rgba(79,55,138,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98] duration-300 flex items-center justify-center"
    >
      {text}
    </button>
  );
}
